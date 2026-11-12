/**
 * Browser Web Audio API 16 kHz Mono PCM WAV Encoder & Acoustic Feature Extractor.
 * Converts any MediaRecorder Blob (.webm, .ogg, .mp4) or uploaded File (.mp3, .m4a, .flac, .wav)
 * into a clean 16,000 Hz 16-bit Mono PCM WAV file and computes real-time DSP acoustic telemetry.
 */

export interface ClientAcousticFeatures {
  durationSeconds: number;
  sampleRate: number;
  rmsEnergy: number;
  peakAmplitude: number;
  crestFactor: number;
  zeroCrossingRate: number;
  zcrVariance: number;
  energyVariance: number;
  silenceRatio: number;
  pitchJitterEstimate: number;
  highFreqRatio: number;
  captureMode: 'microphone' | 'screen_audio' | 'file_upload';
}

export async function convertBlobTo16kHzWav(
  blob: Blob,
  fileName = 'recording.wav',
  captureMode: 'microphone' | 'screen_audio' | 'file_upload' = 'microphone'
): Promise<{ wavFile: File; features: ClientAcousticFeatures }> {
  const arrayBuffer = await blob.arrayBuffer();
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioCtx();

  let decodedBuffer: AudioBuffer;
  try {
    decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
  } finally {
    await audioCtx.close().catch(() => {});
  }

  const targetSampleRate = 16000;
  const targetLength = Math.max(1, Math.ceil(decodedBuffer.duration * targetSampleRate));
  const offlineCtx = new OfflineAudioContext(1, targetLength, targetSampleRate);

  const source = offlineCtx.createBufferSource();
  source.buffer = decodedBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);

  const renderedBuffer = await offlineCtx.startRendering();
  const rawChannel = renderedBuffer.getChannelData(0);

  // Compute acoustic features on the 16kHz mono signal before peak normalization
  const features = extractClientAcousticFeatures(rawChannel, targetSampleRate, captureMode);

  // Peak-normalize to 0.92 max amplitude so microphone distance doesn't skew neural detectors
  const normalized = new Float32Array(rawChannel.length);
  let maxAbs = 0;
  for (let i = 0; i < rawChannel.length; i++) {
    const a = Math.abs(rawChannel[i]);
    if (a > maxAbs) maxAbs = a;
  }
  const scale = maxAbs > 1e-4 ? 0.92 / maxAbs : 1.0;
  for (let i = 0; i < rawChannel.length; i++) {
    normalized[i] = Math.max(-1, Math.min(1, rawChannel[i] * scale));
  }

  const wavArrayBuffer = encodePCM16Wav(normalized, targetSampleRate);
  const cleanName = fileName.replace(/\.[^/.]+$/, '') + '.wav';
  const wavFile = new File([wavArrayBuffer], cleanName, { type: 'audio/wav' });

  return { wavFile, features };
}

function extractClientAcousticFeatures(
  samples: Float32Array,
  sampleRate: number,
  captureMode: 'microphone' | 'screen_audio' | 'file_upload'
): ClientAcousticFeatures {
  const n = samples.length;
  const durationSeconds = n / sampleRate;

  let sumSq = 0;
  let peak = 0;
  let zeroCrossings = 0;

  for (let i = 0; i < n; i++) {
    const v = samples[i];
    sumSq += v * v;
    const absV = Math.abs(v);
    if (absV > peak) peak = absV;
    if (
      i > 0 &&
      ((samples[i] >= 0 && samples[i - 1] < 0) || (samples[i] < 0 && samples[i - 1] >= 0))
    ) {
      zeroCrossings++;
    }
  }

  const rmsEnergy = n > 0 ? Math.sqrt(sumSq / n) : 0;
  const crestFactor = rmsEnergy > 1e-6 ? peak / rmsEnergy : 1;
  const zeroCrossingRate = n > 1 ? zeroCrossings / (n - 1) : 0;

  // Frame-level analysis (25ms frames = 400 samples at 16kHz)
  const frameSize = 400;
  const corrWindow = 200;
  const numFrames = Math.max(1, Math.floor(n / frameSize));
  const frameEnergies: number[] = [];
  const frameZcrs: number[] = [];
  const pitchPeriods: number[] = [];
  let silentFrames = 0;
  let highFreqEnergySum = 0;
  let totalDiffEnergySum = 0;

  const silenceThreshold = Math.max(rmsEnergy * 0.18, 0.004);

  for (let f = 0; f < numFrames; f++) {
    const offset = f * frameSize;
    let fSq = 0;
    let fZcr = 0;
    let diffSq = 0;

    for (let i = 0; i < frameSize; i++) {
      const s = samples[offset + i];
      fSq += s * s;
      if (i > 0) {
        const prev = samples[offset + i - 1];
        if ((s >= 0 && prev < 0) || (s < 0 && prev >= 0)) fZcr++;
        const d = s - prev;
        diffSq += d * d;
      }
    }

    const fRms = Math.sqrt(fSq / frameSize);
    frameEnergies.push(fRms);
    frameZcrs.push(fZcr / frameSize);
    highFreqEnergySum += diffSq;
    totalDiffEnergySum += fSq + 1e-9;

    if (fRms < silenceThreshold) {
      silentFrames++;
    } else if (fRms > rmsEnergy * 0.35) {
      // Normalized autocorrelation pitch period tracker (84 Hz to 333 Hz => lag 48 to 190 at 16kHz)
      let e0 = 0;
      for (let i = 0; i < corrWindow; i += 2) {
        const x0 = samples[offset + i];
        e0 += x0 * x0;
      }
      if (e0 > 1e-7) {
        let searchStart = 48;
        for (let l0 = 12; l0 < 95; l0 += 2) {
          let c0 = 0;
          for (let i = 0; i < corrWindow; i += 2) {
            c0 += samples[offset + i] * samples[offset + i + l0];
          }
          if (c0 <= 0.2 * e0) {
            searchStart = Math.max(48, l0);
            break;
          }
        }

        let bestLag = 0;
        let bestNormCorr = -1.0;
        for (let lag = searchStart; lag <= 190; lag++) {
          let corr = 0;
          let eLag = 0;
          for (let i = 0; i < corrWindow; i += 2) {
            const x0 = samples[offset + i];
            const xl = samples[offset + i + lag];
            corr += x0 * xl;
            eLag += xl * xl;
          }
          const normCorr = corr / Math.sqrt(e0 * eLag + 1e-9);
          if (normCorr > bestNormCorr) {
            bestNormCorr = normCorr;
            bestLag = lag;
          }
        }
        if (bestLag > 0 && bestNormCorr >= 0.32) {
          pitchPeriods.push(bestLag);
        }
      }
    }
  }

  const meanEnergy = frameEnergies.reduce((a, b) => a + b, 0) / frameEnergies.length;
  const energyVariance =
    frameEnergies.reduce((acc, v) => acc + Math.pow(v - meanEnergy, 2), 0) /
    (frameEnergies.length * Math.max(meanEnergy * meanEnergy, 1e-6));

  const meanZcr = frameZcrs.reduce((a, b) => a + b, 0) / frameZcrs.length;
  const zcrVariance =
    frameZcrs.reduce((acc, v) => acc + Math.pow(v - meanZcr, 2), 0) / frameZcrs.length;

  // Pitch jitter (relative period-to-period variation in voiced frames, excluding octave jumps)
  let pitchJitterEstimate = 0.018;
  if (pitchPeriods.length > 3) {
    let diffSum = 0;
    let periodSum = 0;
    let validPairs = 0;
    for (let i = 1; i < pitchPeriods.length; i++) {
      const diff = Math.abs(pitchPeriods[i] - pitchPeriods[i - 1]);
      if (diff <= 28) {
        diffSum += diff;
        periodSum += pitchPeriods[i];
        validPairs++;
      }
    }
    if (validPairs > 0 && periodSum > 0) {
      const avgPeriod = periodSum / validPairs;
      pitchJitterEstimate = Math.min(0.095, diffSum / (validPairs * avgPeriod));
    }
  }

  const silenceRatio = silentFrames / numFrames;
  const highFreqRatio = Math.min(1, highFreqEnergySum / Math.max(totalDiffEnergySum, 1e-6));

  return {
    durationSeconds: Number(durationSeconds.toFixed(2)),
    sampleRate,
    rmsEnergy: Number(rmsEnergy.toFixed(5)),
    peakAmplitude: Number(peak.toFixed(4)),
    crestFactor: Number(crestFactor.toFixed(3)),
    zeroCrossingRate: Number(zeroCrossingRate.toFixed(4)),
    zcrVariance: Number(zcrVariance.toFixed(5)),
    energyVariance: Number(energyVariance.toFixed(4)),
    silenceRatio: Number(silenceRatio.toFixed(3)),
    pitchJitterEstimate: Number(pitchJitterEstimate.toFixed(4)),
    highFreqRatio: Number(highFreqRatio.toFixed(4)),
    captureMode,
  };
}

function encodePCM16Wav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, 'WAVE');
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return buffer;
}

function writeAscii(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
