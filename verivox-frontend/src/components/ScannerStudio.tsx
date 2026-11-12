'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  MonitorSpeaker,
  Upload,
  Play,
  Pause,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  RotateCcw,
  Download,
  Volume2,
  Activity,
  Cpu,
  Radio,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';
import { convertBlobTo16kHzWav, ClientAcousticFeatures } from '@/utils/wavEncoder';
import jsPDF from 'jspdf';

interface ScanResultData {
  verdict: 'spoofed' | 'authentic';
  predictedLabel: 'spoof' | 'bonafide';
  confidence: number;
  spoofScore: number;
  bonafideScore: number;
  audioCategory: string;
  categoryBadge: string;
  captureMode: 'microphone' | 'screen_audio' | 'file_upload';
  summary: string;
  explanation: string;
  detectionSignals: {
    label: string;
    value: string;
    status: 'good' | 'warn' | 'danger';
  }[];
  metrics: ClientAcousticFeatures;
}

interface ScannerStudioProps {
  mode?: 'landing' | 'dashboard';
  onDashboardSaved?: (jobId: string) => void;
}

export const ScannerStudio: React.FC<ScannerStudioProps> = ({
  mode = 'landing',
  onDashboardSaved,
}) => {
  const [activeTab, setActiveTab] = useState<'microphone' | 'screen_audio' | 'file_upload'>('microphone');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [spectrumBars, setSpectrumBars] = useState<number[]>(
    Array.from({ length: 28 }, () => 18)
  );

  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const [stagedFeatures, setStagedFeatures] = useState<ClientAcousticFeatures | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      stopActiveStreams();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, []);

  const stopActiveStreams = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
  };

  const resetScanner = () => {
    stopActiveStreams();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setStagedFile(null);
    setStagedFeatures(null);
    setAudioUrl(null);
    setScanResult(null);
    setErrorMsg(null);
    setRecordingSeconds(0);
    setIsPlaying(false);
  };

  const startLiveVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateBars = () => {
        analyser.getByteFrequencyData(dataArray);
        const nextBars = Array.from({ length: 28 }, (_, i) => {
          const val = dataArray[i % dataArray.length] || 0;
          return Math.max(14, Math.min(98, Math.round((val / 255) * 95) + 12));
        });
        setSpectrumBars(nextBars);
        animFrameRef.current = requestAnimationFrame(updateBars);
      };
      updateBars();
    } catch {
      // Fallback animation if AudioContext fails
    }
  };

  const handleStartMicrophone = async () => {
    resetScanner();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1,
          sampleRate: 16000,
        },
      });
      beginRecordingStream(stream, 'microphone');
    } catch (err: any) {
      setErrorMsg(
        'Microphone access was denied or unavailable. Please allow microphone permission in your browser.'
      );
    }
  };

  const handleStartScreenAudio = async () => {
    resetScanner();
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        stream.getTracks().forEach((t) => t.stop());
        setErrorMsg(
          'No system audio track selected. Make sure to check "Share tab audio" or "Share system audio" in the popup.'
        );
        return;
      }

      const audioOnlyStream = new MediaStream(audioTracks);
      stream.getVideoTracks().forEach((vt) => {
        vt.onended = () => handleStopRecording();
      });

      beginRecordingStream(audioOnlyStream, 'screen_audio');
    } catch (err: any) {
      setErrorMsg(
        'Screen or tab audio capture was cancelled. Select a browser tab and enable "Share tab audio".'
      );
    }
  };

  const beginRecordingStream = (
    stream: MediaStream,
    captureType: 'microphone' | 'screen_audio'
  ) => {
    mediaStreamRef.current = stream;
    audioChunksRef.current = [];

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/mp4')
      ? 'audio/mp4'
      : '';

    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        audioChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = async () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      setIsRecording(false);

      const rawBlob = new Blob(audioChunksRef.current, {
        type: recorder.mimeType || 'audio/webm',
      });

      if (rawBlob.size < 400) {
        setErrorMsg('Recording was too short. Please record at least 2 seconds of audio.');
        return;
      }

      try {
        setScanning(true);
        const label =
          captureType === 'microphone'
            ? `live-mic-${Date.now()}.wav`
            : `screen-audio-${Date.now()}.wav`;
        const { wavFile, features } = await convertBlobTo16kHzWav(
          rawBlob,
          label,
          captureType
        );
        const url = URL.createObjectURL(wavFile);
        setStagedFile(wavFile);
        setStagedFeatures(features);
        setAudioUrl(url);
        await runVerificationScan(wavFile, features, captureType);
      } catch (convErr: any) {
        setErrorMsg(
          convErr.message || 'Could not process recorded audio. Please try again.'
        );
        setScanning(false);
      }
    };

    recorder.start(200);
    setIsRecording(true);
    setRecordingSeconds(0);
    startLiveVisualizer(stream);

    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => {
        if (prev >= 29) {
          handleStopRecording();
          return 30;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleStopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    resetScanner();

    try {
      setScanning(true);
      const { wavFile, features } = await convertBlobTo16kHzWav(
        selected,
        selected.name,
        'file_upload'
      );
      const url = URL.createObjectURL(wavFile);
      setStagedFile(wavFile);
      setStagedFeatures(features);
      setAudioUrl(url);
      await runVerificationScan(wavFile, features, 'file_upload');
    } catch (err: any) {
      setErrorMsg(
        'Could not decode this audio file. Please upload a valid WAV, MP3, FLAC, M4A, or WebM recording.'
      );
      setScanning(false);
    }
  };

  const runVerificationScan = async (
    wavFile: File,
    features: ClientAcousticFeatures,
    captureType: 'microphone' | 'screen_audio' | 'file_upload'
  ) => {
    setScanning(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', wavFile);
      formData.append('captureMode', captureType);
      formData.append('features', JSON.stringify(features));
      formData.append('duration', String(features.durationSeconds));

      const response = await fetch('/api/live-scan', {
        method: 'POST',
        body: formData,
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Verification scan failed.');
      }

      setScanResult(json.data);

      // If running inside the logged-in dashboard, also save to user's history in background
      if (mode === 'dashboard') {
        try {
          const uploadForm = new FormData();
          uploadForm.append('file', wavFile);
          uploadForm.append('duration', String(features.durationSeconds));
          uploadForm.append('captureMode', captureType);
          const upRes = await fetch('/api/upload', {
            method: 'POST',
            credentials: 'include',
            body: uploadForm,
          });
          if (upRes.ok) {
            const upJson = await upRes.json();
            if (onDashboardSaved && upJson.data?.jobId) {
              onDashboardSaved(upJson.data.jobId);
            }
          }
        } catch {
          // Non-blocking if user quota or session is guest
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification scan failed. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
    } else {
      audioPlayerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleExportInstantPdf = () => {
    if (!scanResult) return;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = doc.internal.pageSize.getWidth();
    const m = 18;
    const isSpoof = scanResult.verdict === 'spoofed';

    doc.setFillColor(11, 15, 25);
    doc.rect(0, 0, W, 28, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('VERIVOX AI', m, 14);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(167, 139, 250);
    doc.text('Real-Time Voice & Deepfake Verification Report', m, 21);

    let y = 38;
    doc.setFillColor(isSpoof ? 225 : 16, isSpoof ? 29 : 185, isSpoof ? 72 : 129);
    doc.roundedRect(m, y, W - 2 * m, 18, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text(
      `${
        isSpoof ? 'SYNTHETIC / AI AUDIO DETECTED' : 'AUTHENTIC HUMAN VOICE VERIFIED'
      }  (${(scanResult.confidence * 100).toFixed(1)}%)`,
      m + 6,
      y + 11.5
    );

    y += 26;
    doc.setTextColor(24, 24, 27);
    doc.setFontSize(11);
    doc.text(`Detected Profile: ${scanResult.audioCategory}`, m, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(
      `File: ${stagedFile?.name || 'live-capture.wav'}  |  Duration: ${
        scanResult.metrics.durationSeconds
      }s  |  Sample Rate: 16,000 Hz Mono`,
      m,
      y
    );

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Forensic Explanation', m, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const lines = doc.splitTextToSize(scanResult.explanation, W - 2 * m);
    doc.text(lines, m, y);
    y += lines.length * 5 + 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Acoustic Biometric Signals', m, y);
    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    scanResult.detectionSignals.forEach((sig) => {
      doc.text(`• ${sig.label}: ${sig.value}`, m + 2, y);
      y += 6;
    });

    doc.save(`verivox-live-report-${Date.now()}.pdf`);
  };

  return (
    <div className="rounded-3xl bg-[#0d111d] border border-white/10 shadow-2xl overflow-hidden text-white">
      {/* Studio Top Bar & Capture Mode Tabs */}
      <div className="px-5 sm:px-7 py-4 border-b border-white/10 bg-[#13192b]/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-wider text-emerald-300 font-semibold">
            Real-Time Multi-Model Voice Scanner
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 bg-[#090d16] p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => {
              resetScanner();
              setActiveTab('microphone');
            }}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'microphone'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Live Mic</span>
          </button>

          <button
            type="button"
            onClick={() => {
              resetScanner();
              setActiveTab('screen_audio');
            }}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'screen_audio'
                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <MonitorSpeaker className="w-3.5 h-3.5" />
            <span>Screen Audio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              resetScanner();
              setActiveTab('file_upload');
            }}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'file_upload'
                ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Capture Controls when not yet scanned */}
        {!scanResult && (
          <div className="rounded-2xl bg-[#13192b]/70 border border-white/10 p-6 sm:p-8 text-center">
            {activeTab === 'microphone' && (
              <div className="max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
                  <Mic className={`w-8 h-8 ${isRecording ? 'animate-bounce text-rose-400' : ''}`} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {isRecording
                    ? `Recording Live Voice... 00:${String(recordingSeconds).padStart(2, '0')}`
                    : 'Record Your Voice Live'}
                </h3>
                <p className="text-sm text-slate-300 mb-6">
                  {isRecording
                    ? 'Speak naturally into your microphone (or play an AI voice clip near the mic) for 3 to 15 seconds.'
                    : 'Judges & users can speak directly into the microphone to verify real human speech vs. AI voice clones in real time.'}
                </p>

                {/* Live Spectrum Bars */}
                <div className="h-20 px-4 py-3 rounded-xl bg-[#090d16] border border-white/10 flex items-end justify-between gap-1 mb-6">
                  {spectrumBars.map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${isRecording ? h : 20}%` }}
                      className={`flex-1 rounded-full transition-all duration-75 ${
                        isRecording
                          ? i % 3 === 0
                            ? 'bg-emerald-400'
                            : i % 2 === 0
                            ? 'bg-violet-400'
                            : 'bg-rose-400'
                          : 'bg-slate-700/60'
                      }`}
                    />
                  ))}
                </div>

                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartMicrophone}
                    disabled={scanning}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Radio className="w-4 h-4" />
                    Start Live Mic Recording
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:brightness-110 transition-all shadow-lg shadow-rose-500/25"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    Stop &amp; Analyze Audio ({recordingSeconds}s)
                  </button>
                )}
              </div>
            )}

            {activeTab === 'screen_audio' && (
              <div className="max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/15 border border-violet-400/30 flex items-center justify-center mx-auto mb-4 text-violet-400">
                  <MonitorSpeaker className="w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {isRecording
                    ? `Capturing System Audio... 00:${String(recordingSeconds).padStart(2, '0')}`
                    : 'Capture Screen or Browser Tab Audio'}
                </h3>
                <p className="text-sm text-slate-300 mb-6">
                  Record live audio playing from YouTube, WhatsApp Web, TikTok, Zoom, or an AI voice generator tab and verify it immediately.
                </p>

                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartScreenAudio}
                    disabled={scanning}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 text-white hover:brightness-110 transition-all shadow-lg shadow-violet-500/25"
                  >
                    <MonitorSpeaker className="w-4 h-4" />
                    Select Tab / Screen Audio
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:brightness-110 transition-all shadow-lg shadow-rose-500/25"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    Stop &amp; Verify Stream ({recordingSeconds}s)
                  </button>
                )}
              </div>
            )}

            {activeTab === 'file_upload' && (
              <div className="max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Upload Any Audio File
                </h3>
                <p className="text-sm text-slate-300 mb-6">
                  Supports WAV, MP3, FLAC, M4A, WebM, and OGG voice notes up to 15 MB. Automatically resampled to 16 kHz mono.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".wav,.mp3,.flac,.m4a,.webm,.ogg,audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="studio-file-input"
                />
                <label
                  htmlFor="studio-file-input"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 text-white hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-rose-500/25"
                >
                  <Upload className="w-4 h-4" />
                  Choose Audio File to Scan
                </label>
              </div>
            )}

            {scanning && (
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center gap-3 text-emerald-300 font-mono text-xs">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>
                  Running Multi-Model Ensemble (Wav2Vec2 + AASIST + Vocal Cord Biometrics)...
                </span>
              </div>
            )}
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs sm:text-sm flex items-center justify-between gap-4">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-xs font-mono underline text-rose-300 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Live Scan Result Panel */}
        {scanResult && (
          <div className="space-y-5 animate-fade-in">
            {/* Verdict Banner */}
            <div
              className={`p-5 sm:p-6 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                scanResult.verdict === 'spoofed'
                  ? 'bg-rose-500/15 border-rose-500/40'
                  : 'bg-emerald-500/15 border-emerald-500/40'
              }`}
            >
              <div className="flex items-start sm:items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    scanResult.verdict === 'spoofed'
                      ? 'bg-rose-500 text-white'
                      : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  {scanResult.verdict === 'spoofed' ? (
                    <ShieldAlert className="w-6 h-6" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-white font-semibold">
                      {scanResult.categoryBadge}
                    </span>
                    <span className="font-mono text-xs text-slate-300">
                      {(scanResult.confidence * 100).toFixed(1)}% CONFIDENCE
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {scanResult.audioCategory}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 mt-0.5">
                    {scanResult.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-center">
                <button
                  type="button"
                  onClick={handleExportInstantPdf}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/15"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF Report
                </button>
                <button
                  type="button"
                  onClick={resetScanner}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Scan Another
                </button>
              </div>
            </div>

            {/* Audio Player Bar */}
            {audioUrl && (
              <div className="px-4 py-3 rounded-xl bg-[#13192b] border border-white/10 flex items-center gap-4">
                <button
                  type="button"
                  onClick={togglePlayback}
                  className="w-9 h-9 rounded-lg bg-violet-500 hover:bg-violet-400 text-white flex items-center justify-center flex-shrink-0 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-xs text-slate-300 truncate">
                    {stagedFile?.name || 'captured-audio.wav'} • 16 kHz Mono PCM •{' '}
                    {scanResult.metrics.durationSeconds}s
                  </div>
                </div>
                <audio
                  ref={audioPlayerRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="h-8 max-w-[220px] sm:max-w-xs"
                  controls
                />
              </div>
            )}

            {/* Probability Meters & Signals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Probability Breakdown */}
              <div className="p-5 rounded-2xl bg-[#13192b] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-violet-300 font-semibold">
                    Ensemble Probability Split
                  </span>
                  <Cpu className="w-4 h-4 text-violet-400" />
                </div>

                <div>
                  <div className="flex justify-between font-mono text-xs mb-1.5">
                    <span className="text-emerald-300">AUTHENTIC HUMAN VOICE</span>
                    <span className="font-bold text-emerald-400">
                      {(scanResult.bonafideScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${scanResult.bonafideScore * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-mono text-xs mb-1.5">
                    <span className="text-rose-300">AI CLONE / SYNTHETIC / MIMIC</span>
                    <span className="font-bold text-rose-400">
                      {(scanResult.spoofScore * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${scanResult.spoofScore * 100}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-white/10">
                  {scanResult.explanation}
                </p>
              </div>

              {/* Acoustic Biometric Telemetry */}
              <div className="p-5 rounded-2xl bg-[#13192b] border border-white/10 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs uppercase tracking-wider text-emerald-300 font-semibold">
                    Live Acoustic &amp; Vocoder Signals
                  </span>
                  <Activity className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="space-y-2.5">
                  {scanResult.detectionSignals.map((sig, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#090d16] border border-white/10 flex items-center justify-between gap-3"
                    >
                      <span className="text-xs text-slate-300">{sig.label}</span>
                      <span
                        className={`font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          sig.status === 'good'
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : sig.status === 'warn'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {sig.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
