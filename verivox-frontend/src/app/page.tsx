'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '@/components/layout';
import { ScannerStudio } from '@/components/ScannerStudio';
import {
  ArrowRight,
  Mic,
  ShieldCheck,
  Sparkles,
  FileText,
  Smartphone,
  Cpu,
  Radio,
  BarChart3,
  Puzzle,
  Terminal,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col overflow-x-hidden bg-[#0b0a09] text-stone-100">
      <Navbar />

      <main className="flex-1">
        {/* Hero + Live Interactive Scanner Section */}
        <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-24 overflow-hidden border-b border-white/10">
          {/* Warm Gold & Emerald Ambient Orbs */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.22, 0.36, 0.22] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full bg-amber-500/20 blur-[140px]"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.16, 0.3, 0.16] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute top-16 right-0 w-[520px] h-[520px] rounded-full bg-emerald-500/15 blur-[140px]"
          />

          <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            {/* Hero Header */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="text-center max-w-4xl mx-auto mb-11"
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Real-Time Voice Authenticity &amp; LIME Explainable AI Studio</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] text-white mb-5">
                Verify Live Voices, Mimicry &amp;{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-emerald-300">
                  Unseen Audio in Seconds.
                </span>
              </h1>

              <p className="text-base sm:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed mb-8">
                Record your microphone live, capture audio from any browser tab, or upload an unseen voice clip to get an instant authenticity verdict backed by LIME time-segment attribution.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#live-scanner"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-stone-950 shadow-lg shadow-amber-500/20 hover:brightness-110 transition-all"
                >
                  <Mic className="w-4 h-4" />
                  Test Live Microphone Now
                </a>
                <a
                  href="/VeriVox.apk"
                  download="VeriVox.apk"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all"
                >
                  <Smartphone className="w-4 h-4 text-amber-300" />
                  Android APK (2.3 MB)
                </a>
                <a
                  href="/VeriVox-Extension.zip"
                  download="VeriVox-Extension.zip"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 transition-all"
                >
                  <Puzzle className="w-4 h-4" />
                  Chrome Extension
                </a>
                <Link
                  href="/enterprise"
                  className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-xl font-semibold text-sm bg-white/5 hover:bg-white/10 text-stone-200 border border-white/15 transition-all"
                >
                  <Terminal className="w-4 h-4 text-amber-300" />
                  Enterprise API
                </Link>
              </div>
            </motion.div>

            {/* Interactive Live Scanner Studio */}
            <div id="live-scanner" className="max-w-5xl mx-auto scroll-mt-24">
              <ScannerStudio mode="landing" themeVariant="obsidian" />
            </div>
          </div>
        </section>

        {/* 4 Audio Categories + Explainability Section */}
        <section className="py-20 border-b bg-[#12100e] border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Unseen Audio Generalization + LIME XAI</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3">
                Built for Live Judges &amp; Real-World Audio
              </h2>
              <p className="text-base text-stone-300">
                Combines self-supervised Wav2Vec2-XLSR representations, vocal cord micro-jitter biometrics, and 8-window LIME temporal attribution.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  badge: 'LIVE MIC',
                  title: 'Real Human Microphone',
                  desc: 'Measures natural vocal cord micro-jitter and plosive dynamics so live human speech is verified accurately.',
                  icon: Mic,
                },
                {
                  badge: 'AI VOICE CLONE',
                  title: 'Zero-Shot TTS & Clones',
                  desc: 'Detects ElevenLabs, OpenAI, XTTS, and unseen neural vocoders via F0 pitch stabilization and phase artifacts.',
                  icon: Cpu,
                },
                {
                  badge: 'VOICE MIMICRY',
                  title: 'RVC & Voice Conversion',
                  desc: 'Flags real-time voice changers and speech-to-speech mimicry by inspecting upper-formant discontinuities.',
                  icon: Radio,
                },
                {
                  badge: 'LIME XAI PROOF',
                  title: 'Time-Window Attribution',
                  desc: 'Highlights which exact timestamps and frequency bands triggered the detection in both the UI and PDF certificate.',
                  icon: BarChart3,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-2xl p-6 bg-[#171512] border border-amber-500/20 hover:border-amber-400/40 transition-all text-stone-100"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300">
                        {item.badge}
                      </span>
                      <Icon className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-stone-300">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mobile APK, Browser Extension & Enterprise API Hub */}
        <section className="py-20 bg-[#0b0a09]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="rounded-3xl bg-gradient-to-r from-[#141210] via-[#1c1814] to-[#121a16] border border-amber-500/25 p-8 sm:p-14 flex flex-col lg:flex-row items-center justify-between gap-10 text-white shadow-2xl">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-mono mb-4">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>ANDROID APK • CHROME EXTENSION • ENTERPRISE API</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                  Verify Voices Anywhere on Web, Extension or Android
                </h2>
                <p className="text-stone-300 text-base leading-relaxed mb-6">
                  Download the signed Android APK, install the Chrome &amp; Edge Browser Extension, or integrate our Enterprise REST API (`POST /api/v1/verify`) with full LIME XAI attribution.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/VeriVox.apk"
                    download="VeriVox.apk"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 hover:brightness-110 transition-all shadow-lg shadow-amber-500/20"
                  >
                    <Smartphone className="w-4 h-4" />
                    Download Android APK
                  </a>
                  <a
                    href="/VeriVox-Extension.zip"
                    download="VeriVox-Extension.zip"
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 transition-all"
                  >
                    <Puzzle className="w-4 h-4" />
                    Browser Extension (.zip)
                  </a>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all"
                  >
                    <span>1-Click Judge Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                <div className="p-5 rounded-2xl bg-black/50 border border-white/10">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
                  <div className="font-mono text-xl font-bold text-white">LIME XAI</div>
                  <p className="text-xs text-stone-400 mt-1">
                    8-window temporal &amp; 3-band spectral attribution
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-black/50 border border-white/10">
                  <FileText className="w-6 h-6 text-amber-400 mb-2" />
                  <div className="font-mono text-xl font-bold text-white">A4 PDF</div>
                  <p className="text-xs text-stone-400 mt-1">
                    Executive certificate with visual XAI charts
                  </p>
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
