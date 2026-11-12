'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '@/components/layout';
import { Button } from '@/components/ui';
import { ScannerStudio } from '@/components/ScannerStudio';
import {
  ArrowRight,
  Mic,
  MonitorSpeaker,
  ShieldCheck,
  Sparkles,
  FileText,
  Smartphone,
  Cpu,
  Radio,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#090d16] text-white overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        {/* Hero + Live Interactive Scanner Section */}
        <section className="relative pt-12 pb-20 sm:pt-16 sm:pb-24 overflow-hidden border-b border-white/10">
          {/* Animated Emerald, Violet & Coral Ambient Orbs */}
          <motion.div
            animate={{
              scale: [1, 1.18, 1],
              opacity: [0.22, 0.38, 0.22],
              x: [0, 35, 0],
            }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute -top-24 -left-24 w-[460px] h-[460px] rounded-full bg-emerald-500/25 blur-[130px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.22, 1],
              opacity: [0.2, 0.36, 0.2],
              x: [0, -35, 0],
            }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute top-16 right-0 w-[520px] h-[520px] rounded-full bg-violet-600/25 blur-[140px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="pointer-events-none absolute bottom-0 left-1/3 w-[440px] h-[440px] rounded-full bg-rose-500/20 blur-[130px]"
          />

          <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            {/* Hero Headline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="text-center max-w-4xl mx-auto mb-12"
            >
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/15 text-emerald-300 text-xs font-semibold mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Real-Time Multi-Model Voice &amp; Deepfake Scanner</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.06] mb-5">
                Detect AI Voices, Mimicry &amp;{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-violet-400 to-rose-400">
                  Live Audio in Seconds.
                </span>
              </h1>

              <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-8">
                Record your microphone live, capture audio from any screen or browser tab, or drop an unseen voice file to verify if it is real human speech or synthetic AI.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <a href="#live-scanner">
                  <Button
                    variant="primary"
                    size="lg"
                    className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 !text-slate-950 font-bold shadow-lg shadow-emerald-500/20"
                  >
                    <Mic className="w-4 h-4" />
                    Test Live Microphone Now
                  </Button>
                </a>
                <a
                  href="https://github.com/ahsankhizar5/verivox-ai/releases/latest/download/VeriVox.apk"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all"
                >
                  <Smartphone className="w-4 h-4 text-violet-400" />
                  Download Android APK
                </a>
              </div>
            </motion.div>

            {/* Interactive Live Scanner Studio Embedded Directly on Homepage */}
            <motion.div
              id="live-scanner"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="max-w-5xl mx-auto scroll-mt-24"
            >
              <ScannerStudio mode="landing" />
            </motion.div>
          </div>
        </section>

        {/* 4 Audio Categories Detected */}
        <section className="py-20 bg-[#0d121f] border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-violet-500/15 border border-violet-400/30 text-violet-300 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Unseen Audio Generalization</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
                Built for Unheard Voices &amp; Live Testing
              </h2>
              <p className="text-slate-300 text-base">
                Combines self-supervised Wav2Vec2 transformers, AASIST graph attention, and vocal cord biometrics to classify any audio source.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  badge: 'LIVE MIC',
                  title: 'Real Human Microphone',
                  desc: 'Measures natural vocal cord micro-jitter and plosive dynamics so live voices are verified accurately.',
                  color: 'from-emerald-500/20 to-teal-500/5 border-emerald-500/30 text-emerald-300',
                  icon: Mic,
                },
                {
                  badge: 'AI VOICE CLONE',
                  title: 'Zero-Shot TTS & Clones',
                  desc: 'Detects ElevenLabs, OpenAI, XTTS, and unseen neural vocoders via pitch stabilization and phase artifacts.',
                  color: 'from-rose-500/20 to-orange-500/5 border-rose-500/30 text-rose-300',
                  icon: Cpu,
                },
                {
                  badge: 'VOICE MIMICRY',
                  title: 'RVC & Voice Conversion',
                  desc: 'Flags real-time voice changers and speech-to-speech mimicry by inspecting upper-formant discontinuities.',
                  color: 'from-violet-500/20 to-fuchsia-500/5 border-violet-500/30 text-violet-300',
                  icon: Radio,
                },
                {
                  badge: 'SCREEN AUDIO',
                  title: 'System & Tab Streams',
                  desc: 'Captures audio directly from YouTube, WhatsApp Web, or video calls to spot synthetic speech in media.',
                  color: 'from-amber-500/20 to-orange-500/5 border-amber-500/30 text-amber-300',
                  icon: MonitorSpeaker,
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.08 }}
                    className={`rounded-2xl p-6 bg-gradient-to-b ${item.color} border`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10">
                        {item.badge}
                      </span>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mobile APK + Web Workspace Section */}
        <section className="py-20 bg-[#090d16]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="rounded-3xl bg-gradient-to-r from-emerald-950/70 via-[#17112e] to-rose-950/60 border border-white/15 p-8 sm:p-14 flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-mono mb-4">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>ANDROID APK + WEB STUDIO</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                  Verify Voices Anywhere on Web or Android
                </h2>
                <p className="text-slate-300 text-base leading-relaxed mb-6">
                  Download the native Android APK to record and test voice clips on your phone, or create a free account to save scan history, visual LIME heatmaps, and A4 PDF reports.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://github.com/ahsankhizar5/verivox-ai/releases/latest/download/VeriVox.apk"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Smartphone className="w-4 h-4" />
                    Download Android APK
                  </a>
                  <Link href="/signup">
                    <Button variant="primary" size="lg">
                      Open Full Cloud Console
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                <div className="p-5 rounded-2xl bg-[#090d16]/80 border border-white/10">
                  <ShieldCheck className="w-6 h-6 text-emerald-400 mb-2" />
                  <div className="font-mono text-xl font-bold text-white">3 Modes</div>
                  <p className="text-xs text-slate-400 mt-1">
                    Live Mic, Screen Audio &amp; File Upload
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#090d16]/80 border border-white/10">
                  <FileText className="w-6 h-6 text-violet-400 mb-2" />
                  <div className="font-mono text-xl font-bold text-white">A4 PDF</div>
                  <p className="text-xs text-slate-400 mt-1">
                    Instant downloadable verification reports
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
