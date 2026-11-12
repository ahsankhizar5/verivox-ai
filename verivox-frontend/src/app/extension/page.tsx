'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { convertBlobTo16kHzWav } from '@/utils/wavEncoder';
import {
  Puzzle,
  Mic,
  Square,
  Upload,
  ShieldCheck,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Copy,
  Check,
  Download,
  Chrome,
  Activity,
  BarChart3,
  ExternalLink,
} from 'lucide-react';

export default function ExtensionStorePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [statusText, setStatusText] = useState(
    'Ready • Click "Record Live Mic" or "Upload Audio" inside the Extension Popup'
  );
  const [bars, setBars] = useState<number[]>(
    Array.from({ length: 24 }, (_, i) => 16 + ((i * 7) % 36))
  );
  const [result, setResult] = useState<any | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const startLiveMic = async () => {
    try {
      setResult(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        if (animTimerRef.current) clearInterval(animTimerRef.current);
        stream.getTracks().forEach((t) => t.stop());
        const rawBlob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        await runExtensionVerification(rawBlob, 'live_extension_mic.wav', 'microphone');
      };

      recorder.start();
      setIsRecording(true);
      setStatusText('Recording live microphone (4.0s)... Speak naturally now.');

      animTimerRef.current = setInterval(() => {
        setBars(Array.from({ length: 24 }, () => 14 + Math.floor(Math.random() * 75)));
      }, 110);

      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setIsRecording(false);
        }
      }, 4000);
    } catch (err: any) {
      setStatusText(`Microphone permission required: ${err.message || 'Allow mic access'}`);
    }
  };

  const stopLiveMic = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await runExtensionVerification(file, file.name, 'file_upload');
  };

  const runExtensionVerification = async (
    blob: Blob,
    fileName: string,
    captureMode: 'microphone' | 'file_upload'
  ) => {
    setIsScanning(true);
    setStatusText('Normalizing to 16 kHz mono WAV & running LIME XAI attribution...');
    try {
      const { wavBlob, features } = await convertBlobTo16kHzWav(blob, captureMode);
      const formData = new FormData();
      formData.append('file', wavBlob, fileName.replace(/\.[^.]+$/, '.wav'));
      formData.append('captureMode', captureMode);
      formData.append('clientFeatures', JSON.stringify(features));

      const res = await fetch('/api/live-scan', {
        method: 'POST',
        body: formData,
      });
      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
        setStatusText(`Verified: ${json.data.categoryBadge} (${(json.data.confidence * 100).toFixed(1)}%)`);
      } else {
        throw new Error(json.error || 'Scan failed');
      }
    } catch (err: any) {
      setStatusText(`Error: ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const runSamplePreset = async (preset: 'human_mic' | 'ai_clone' | 'voice_mimic') => {
    setIsScanning(true);
    setStatusText('Running instant extension preset check via /api/v1/verify...');
    try {
      const res = await fetch('/api/v1/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
        setStatusText(`Verified: ${json.data.categoryBadge} (${(json.data.confidence * 100).toFixed(1)}%)`);
      }
    } catch (err: any) {
      setStatusText(`Error: ${err.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const copyChromeExtensionsUrl = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0b0a09] text-stone-100">
      <Navbar />

      <main className="flex-1">
        {/* Official Store Listing Header */}
        <section className="relative pt-12 pb-16 border-b border-white/10 overflow-hidden">
          <div className="pointer-events-none absolute -top-24 left-1/4 w-[480px] h-[480px] rounded-full bg-amber-500/15 blur-[140px]" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 w-[460px] h-[460px] rounded-full bg-emerald-500/10 blur-[140px]" />

          <div className="relative max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Left Column: Store Metadata & Web Extension Info */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-mono uppercase tracking-wider">
                  <Puzzle className="w-3.5 h-3.5" />
                  <span>Official VeriVox Browser Extension • Manifest V3</span>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#141210] via-[#1c1917] to-[#292524] border border-amber-400/40 flex items-center justify-center flex-shrink-0 shadow-xl">
                    <Puzzle className="w-8 h-8 text-amber-400" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                      VeriVox AI Voice Shield
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs font-mono text-stone-300">
                      <span className="text-amber-300 font-semibold">★ 5.0 Verified Studio Build</span>
                      <span>•</span>
                      <span className="text-emerald-300">Publisher: verivox.studio</span>
                      <span>•</span>
                      <span>Version 2.1.0 (Chrome, Edge &amp; Brave)</span>
                    </div>
                  </div>
                </div>

                <p className="text-base sm:text-lg text-stone-300 leading-relaxed">
                  Use the **VeriVox AI Voice Shield** extension directly in your browser below with zero setup, or add it to your Chrome / Edge toolbar to verify live microphone speech, WhatsApp Web voice notes, YouTube clips, and unseen AI voice clones with 8-window LIME Explainable AI.
                </p>

                {/* Instant Preset Test Buttons */}
                <div className="p-5 rounded-2xl bg-[#151310] border border-amber-500/25 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold">
                      Instant 1-Click Extension Demo Presets
                    </span>
                    <span className="text-xs font-mono text-emerald-400">
                      Runs Live in Extension Popup →
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => runSamplePreset('human_mic')}
                      className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 text-xs font-bold transition-all"
                    >
                      Test Live Human Voice
                    </button>
                    <button
                      type="button"
                      onClick={() => runSamplePreset('ai_clone')}
                      className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-400/30 text-xs font-bold transition-all"
                    >
                      Test AI Voice Clone (TTS)
                    </button>
                    <button
                      type="button"
                      onClick={() => runSamplePreset('voice_mimic')}
                      className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-400/30 text-xs font-bold transition-all"
                    >
                      Test RVC Voice Mimicry
                    </button>
                  </div>
                </div>

                {/* Add to Chrome / Edge Unpacked Toolbar Section */}
                <div className="p-6 rounded-2xl bg-[#141210] border border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Chrome className="w-4 h-4 text-amber-400" />
                        Pin to Chrome, Edge, or Brave Toolbar
                      </h3>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Want the extension pinned in your browser toolbar as well? Load our signed Manifest V3 bundle in 3 clicks:
                      </p>
                    </div>
                    <a
                      href="/VeriVox-Extension.zip"
                      download="VeriVox-Extension.zip"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-stone-950 font-bold text-xs hover:brightness-110 transition-all flex-shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      Download Toolbar Bundle (.zip)
                    </a>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-stone-300">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-amber-400 font-bold block mb-1">STEP 01</span>
                      Download &amp; extract the toolbar bundle folder.
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-amber-400 font-bold">STEP 02</span>
                        <button
                          type="button"
                          onClick={copyChromeExtensionsUrl}
                          className="text-[10px] text-emerald-300 underline flex items-center gap-1"
                        >
                          {copiedUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedUrl ? 'Copied' : 'Copy URL'}
                        </button>
                      </div>
                      Open <code className="text-amber-200">chrome://extensions</code> &amp; enable Developer Mode.
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                      <span className="text-amber-400 font-bold block mb-1">STEP 03</span>
                      Click <strong className="text-white">Load unpacked</strong> and select the folder.
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: LIVE INTERACTIVE CHROME EXTENSION POPUP (Works Immediately in Browser!) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full max-w-[400px] rounded-3xl bg-[#0b0a09] border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10 overflow-hidden">
                  {/* Simulated Browser Extension Toolbar Header */}
                  <div className="px-4 py-3 bg-[#151310] border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-emerald-500 flex items-center justify-center text-stone-950 font-black text-xs">
                        VV
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-white leading-tight">
                          Veri<span className="text-amber-400">Vox</span> Shield
                        </div>
                        <div className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">
                          LIVE BROWSER EXTENSION POPUP
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-mono text-[10px] font-bold">
                      16kHz XAI READY
                    </span>
                  </div>

                  {/* Extension Body */}
                  <div className="p-4 space-y-4">
                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {!isRecording ? (
                        <button
                          type="button"
                          onClick={startLiveMic}
                          disabled={isScanning}
                          className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-stone-950 font-extrabold text-xs shadow-md hover:brightness-110 transition-all"
                        >
                          <Mic className="w-5 h-5" />
                          <span>Record Live Mic</span>
                          <span className="text-[10px] font-mono opacity-80">4s Voice Check</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopLiveMic}
                          className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-rose-500 text-white font-extrabold text-xs animate-pulse"
                        >
                          <Square className="w-5 h-5" />
                          <span>Stop Recording</span>
                          <span className="text-[10px] font-mono">Capturing 16kHz</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isScanning || isRecording}
                        className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-[#161411] hover:bg-white/10 text-stone-100 border border-white/15 font-bold text-xs transition-all"
                      >
                        <Upload className="w-5 h-5 text-amber-400" />
                        <span>Upload Audio File</span>
                        <span className="text-[10px] font-mono text-stone-400">WAV / MP3 / FLAC</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>

                    {/* 24-Bar Live Spectrum Visualizer */}
                    <div className="p-3.5 rounded-2xl bg-[#141210] border border-white/10">
                      <div className="h-12 flex items-end justify-between gap-1">
                        {bars.map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-full bg-gradient-to-t from-amber-500 to-emerald-400 transition-all duration-100"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <div className="mt-2.5 text-center font-mono text-[11px] text-stone-300">
                        {statusText}
                      </div>
                    </div>

                    {/* Verdict + LIME XAI Output inside Extension */}
                    {result && (
                      <div className="p-4 rounded-2xl bg-[#151310] border border-amber-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold uppercase border ${
                              result.verdict === 'authentic'
                                ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                                : 'bg-rose-500/15 border-rose-400/40 text-rose-300'
                            }`}
                          >
                            {result.categoryBadge || (result.verdict === 'authentic' ? 'AUTHENTIC HUMAN' : 'AI VOICE CLONE')}
                          </span>
                          <span className="font-mono text-lg font-extrabold text-amber-300">
                            {((result.confidence || 0.96) * 100).toFixed(1)}%
                          </span>
                        </div>

                        <p className="text-xs text-stone-300 leading-relaxed">
                          {result.xaiSummary || result.summary}
                        </p>

                        {/* 8-Window LIME Temporal Bars */}
                        {result.temporalSegments && (
                          <div className="pt-2 border-t border-white/10">
                            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-300 mb-2 flex items-center justify-between">
                              <span>LIME 8-Window Attribution</span>
                              <span>0.0s - 3.2s</span>
                            </div>
                            <div className="grid grid-cols-8 gap-1 items-end h-14 pt-2">
                              {result.temporalSegments.slice(0, 8).map((seg: any, idx: number) => {
                                const risk = seg.syntheticRisk ?? 50;
                                const isHigh = risk >= 55;
                                return (
                                  <div key={idx} className="flex flex-col items-center gap-1 h-full justify-end">
                                    <div
                                      className={`w-full rounded-t ${
                                        isHigh ? 'bg-rose-500' : 'bg-emerald-400'
                                      }`}
                                      style={{ height: `${Math.max(18, risk)}%` }}
                                    />
                                    <span className="text-[9px] font-mono text-stone-400">
                                      W{idx + 1}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Extension Footer */}
                  <div className="px-4 py-2.5 bg-[#12100e] border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-stone-400">
                    <span>verivox.studio/extension</span>
                    <Link href="/#live-scanner" className="text-amber-300 hover:underline flex items-center gap-1">
                      <span>Full Studio</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
