const API_URL = 'https://www.verivox.studio/api/live-scan';

let currentMode = 'screen_audio';
let isRecording = false;
let mediaRecorder = null;
let activeStream = null;
let chunks = [];
let animId = null;

const barsContainer = document.getElementById('bars-container');
for (let i = 0; i < 20; i++) {
  const b = document.createElement('div');
  b.className = 'bar';
  barsContainer.appendChild(b);
}
const barEls = Array.from(barsContainer.querySelectorAll('.bar'));

const tabTab = document.getElementById('tab-tab');
const tabMic = document.getElementById('tab-mic');
const tabFile = document.getElementById('tab-file');
const modeTitle = document.getElementById('mode-title');
const modeDesc = document.getElementById('mode-desc');
const actionBtn = document.getElementById('action-btn');
const fileInput = document.getElementById('file-input');
const errorBox = document.getElementById('error-box');
const resultBox = document.getElementById('result-box');

function setMode(mode) {
  stopStream();
  currentMode = mode;
  errorBox.style.display = 'none';
  tabTab.classList.toggle('active', mode === 'screen_audio');
  tabMic.classList.toggle('active', mode === 'microphone');
  tabFile.classList.toggle('active', mode === 'file_upload');

  if (mode === 'screen_audio') {
    modeTitle.textContent = 'Capture Active Browser Tab Audio';
    modeDesc.textContent = 'Verify audio playing right now on YouTube, WhatsApp Web, TikTok, or any browser tab.';
    actionBtn.textContent = 'Start Tab Audio Capture';
    actionBtn.className = 'primary-btn';
  } else if (mode === 'microphone') {
    modeTitle.textContent = 'Record Live Microphone Speech';
    modeDesc.textContent = 'Speak directly into your microphone for 3 to 10 seconds to verify live human speech.';
    actionBtn.textContent = 'Start Live Mic Recording';
    actionBtn.className = 'primary-btn';
  } else {
    modeTitle.textContent = 'Upload Audio Recording';
    modeDesc.textContent = 'Select any WAV, MP3, FLAC, M4A, or WebM voice file to run LIME XAI verification.';
    actionBtn.textContent = 'Choose Audio File';
    actionBtn.className = 'primary-btn';
  }
}

tabTab.addEventListener('click', () => setMode('screen_audio'));
tabMic.addEventListener('click', () => setMode('microphone'));
tabFile.addEventListener('click', () => setMode('file_upload'));

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.style.display = 'block';
}

function stopStream() {
  if (animId) cancelAnimationFrame(animId);
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    try { mediaRecorder.stop(); } catch (e) {}
  }
  if (activeStream) {
    activeStream.getTracks().forEach((t) => t.stop());
    activeStream = null;
  }
  isRecording = false;
  barEls.forEach((b) => {
    b.style.height = '22%';
    b.classList.remove('live');
  });
}

actionBtn.addEventListener('click', async () => {
  errorBox.style.display = 'none';
  if (currentMode === 'file_upload') {
    fileInput.click();
    return;
  }

  if (isRecording) {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    return;
  }

  try {
    if (currentMode === 'screen_audio') {
      if (chrome && chrome.tabCapture && chrome.tabCapture.capture) {
        chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
          if (!stream) {
            startDisplayMediaFallback();
            return;
          }
          // Play audio back to user while capturing so tab isn't muted
          const audioCtx = new AudioContext();
          const src = audioCtx.createMediaStreamSource(stream);
          src.connect(audioCtx.destination);
          beginRecording(stream, 'screen_audio');
        });
      } else {
        await startDisplayMediaFallback();
      }
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      beginRecording(stream, 'microphone');
    }
  } catch (err) {
    showError(err.message || 'Could not start audio capture.');
  }
});

async function startDisplayMediaFallback() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    const audioTracks = stream.getAudioTracks();
    if (!audioTracks.length) {
      stream.getTracks().forEach((t) => t.stop());
      showError('Please enable "Share tab audio" in the popup.');
      return;
    }
    beginRecording(new MediaStream(audioTracks), 'screen_audio');
  } catch (e) {
    showError('Tab audio capture was cancelled.');
  }
}

function beginRecording(stream, mode) {
  activeStream = stream;
  chunks = [];
  isRecording = true;
  actionBtn.textContent = 'Stop & Analyze Audio';
  actionBtn.className = 'stop-btn';

  try {
    const ctx = new AudioContext();
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 64;
    src.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    const loop = () => {
      analyser.getByteFrequencyData(data);
      barEls.forEach((b, i) => {
        const val = data[i % data.length] || 0;
        b.style.height = Math.max(18, Math.round((val / 255) * 95)) + '%';
        b.classList.add('live');
      });
      animId = requestAnimationFrame(loop);
    };
    loop();
  } catch (e) {}

  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  mediaRecorder.onstop = async () => {
    stopStream();
    setMode(mode);
    const blob = new Blob(chunks, { type: 'audio/webm' });
    await processAndScanBlob(blob, mode);
  };
  mediaRecorder.start(200);
}

fileInput.addEventListener('change', async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  await processAndScanBlob(file, 'file_upload');
});

async function encode16kWav(blob) {
  const ab = await blob.arrayBuffer();
  const ctx = new AudioContext();
  const decoded = await ctx.decodeAudioData(ab.slice(0));
  await ctx.close();

  const sr = 16000;
  const len = Math.max(1, Math.ceil(decoded.duration * sr));
  const offline = new OfflineAudioContext(1, len, sr);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.connect(offline.destination);
  src.start(0);
  const rendered = await offline.startRendering();
  const ch = rendered.getChannelData(0);

  let maxAbs = 0;
  for (let i = 0; i < ch.length; i++) {
    const a = Math.abs(ch[i]);
    if (a > maxAbs) maxAbs = a;
  }
  const scale = maxAbs > 1e-4 ? 0.92 / maxAbs : 1.0;

  const buf = new ArrayBuffer(44 + ch.length * 2);
  const view = new DataView(buf);
  const writeStr = (off, s) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + ch.length * 2, true);
  writeStr(8, 'WAVEfmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sr, true);
  view.setUint32(28, sr * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, ch.length * 2, true);

  let offset = 44;
  for (let i = 0; i < ch.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, ch[i] * scale));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buf], { type: 'audio/wav' });
}

async function processAndScanBlob(blob, mode) {
  try {
    actionBtn.textContent = 'Running Wav2Vec2-XLSR + LIME XAI...';
    actionBtn.disabled = true;
    const wavBlob = await encode16kWav(blob);

    const form = new FormData();
    form.append('file', wavBlob, 'extension-capture.wav');
    form.append('captureMode', mode);

    const res = await fetch(API_URL, { method: 'POST', body: form });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'Verification failed');
    }
    renderResult(json.data);
  } catch (err) {
    showError(err.message || 'Scan failed. Please try again.');
  } finally {
    actionBtn.disabled = false;
    setMode(currentMode);
  }
}

function renderResult(data) {
  resultBox.style.display = 'block';
  const isSpoof = data.verdict === 'spoofed';
  const badge = document.getElementById('res-badge');
  badge.textContent = `${data.categoryBadge} • ${(data.confidence * 100).toFixed(1)}%`;
  badge.style.background = isSpoof ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)';
  badge.style.color = isSpoof ? '#FDA4AF' : '#34D399';

  document.getElementById('res-category').textContent = data.audioCategory;
  document.getElementById('res-summary').textContent = data.xaiSummary || data.summary;

  const realPct = (data.bonafideScore * 100).toFixed(1) + '%';
  const fakePct = (data.spoofScore * 100).toFixed(1) + '%';
  document.getElementById('res-real').textContent = realPct;
  document.getElementById('bar-real').style.width = realPct;
  document.getElementById('res-fake').textContent = fakePct;
  document.getElementById('bar-fake').style.width = fakePct;

  const grid = document.getElementById('xai-grid');
  grid.innerHTML = '';
  (data.temporalSegments || []).slice(0, 4).forEach((seg) => {
    const cell = document.createElement('div');
    cell.className = 'xai-cell';
    const pct = isSpoof ? seg.syntheticRisk : seg.authenticScore;
    cell.innerHTML = `<div style="color:#A8A29E;">${seg.label}</div><div style="font-weight:800; color:${
      isSpoof ? '#FB7185' : '#34D399'
    };">${pct}%</div>`;
    grid.appendChild(cell);
  });
}
