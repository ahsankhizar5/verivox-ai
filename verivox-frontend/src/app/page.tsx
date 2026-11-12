'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '@/components/layout';
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
  BarChart3,
  Palette,
  Check,
} from 'lucide-react';

type PrototypeId = 'obsidian' | 'daylight' | 'crimson' | 'aurora';

interface PrototypeConfig {
  id: PrototypeId;
  number: string;
  name: string;
  subtitle: string;
  swatch: string[];
  pageBg: string;
  textPrimary: string;
  textMuted: string;
  sectionBg: string;
  cardBg: string;
  badgeStyle: string;
  headlineGradient: string;
  primaryBtn: string;
  secondaryBtn: string;
  orb1: string;
  orb2: string;
}

const PROTOTYPES: Record<PrototypeId, PrototypeConfig> = {
  obsidian: {
    id: 'obsidian',
    number: '01',
    name: 'Obsidian & Warm Gold',
    subtitle: 'Executive AI Studio (Warm Dark + Amber Gold + Emerald)',
    swatch: ['#0B0A09', '#F59E0B', '#10B981'],
    pageBg: 'bg-[#0b0a09] text-stone-100',
    textPrimary: 'text-white',
    textMuted: 'text-stone-300',
    sectionBg: 'bg-[#12100e] border-white/10',
    cardBg: 'bg-[#171512] border-amber-500/20 text-stone-100',
    badgeStyle: 'bg-amber-500/15 border-amber-400/30 text-amber-300',
    headlineGradient: 'from-amber-300 via-orange-300 to-emerald-300',
    primaryBtn:
      'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-stone-950 shadow-lg shadow-amber-500/20',
    secondaryBtn:
      'bg-white/10 hover:bg-white/15 text-white border border-white/15',
    orb1: 'bg-amber-500/20',
    orb2: 'bg-emerald-500/15',
  },
  daylight: {
    id: 'daylight',
    number: '02',
    name: 'Nordic Daylight & Emerald',
    subtitle: 'Editorial Swiss Light (Warm Alabaster + Forest Emerald + Coral)',
    swatch: ['#F7F6F2', '#059669', '#EA580C'],
    pageBg: 'bg-[#f7f6f2] text-stone-900',
    textPrimary: 'text-stone-950',
    textMuted: 'text-stone-600',
    sectionBg: 'bg-[#efede6] border-stone-300/80',
    cardBg: 'bg-white border-stone-200/90 text-stone-900 shadow-sm',
    badgeStyle: 'bg-emerald-950/10 border-emerald-700/30 text-emerald-800',
    headlineGradient: 'from-emerald-700 via-teal-700 to-orange-600',
    primaryBtn:
      'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/20',
    secondaryBtn:
      'bg-stone-900 hover:bg-stone-800 text-white border border-stone-800',
    orb1: 'bg-emerald-400/20',
    orb2: 'bg-amber-300/25',
  },
  crimson: {
    id: 'crimson',
    number: '03',
    name: 'Carbon & Crimson Pulse',
    subtitle: 'Acoustic Hardware Lab (Matte Carbon + Signal Crimson + Coral)',
    swatch: ['#0A0809', '#F43F5E', '#FB923C'],
    pageBg: 'bg-[#0a0809] text-zinc-100',
    textPrimary: 'text-white',
    textMuted: 'text-zinc-300',
    sectionBg: 'bg-[#120d10] border-white/10',
    cardBg: 'bg-[#181115] border-rose-500/20 text-zinc-100',
    badgeStyle: 'bg-rose-500/15 border-rose-400/30 text-rose-300',
    headlineGradient: 'from-rose-400 via-orange-400 to-amber-300',
    primaryBtn:
      'bg-gradient-to-r from-rose-500 via-pink-500 to-orange-500 text-white shadow-lg shadow-rose-500/25',
    secondaryBtn:
      'bg-white/10 hover:bg-white/15 text-white border border-white/15',
    orb1: 'bg-rose-500/20',
    orb2: 'bg-orange-500/15',
  },
  aurora: {
    id: 'aurora',
    number: '04',
    name: 'Midnight Emerald & Violet',
    subtitle: 'Modern Startup Launchpad (Dark Slate + Mint + Electric Violet)',
    swatch: ['#090D16', '#10B981', '#8B5CF6'],
    pageBg: 'bg-[#090d16] text-white',
    textPrimary: 'text-white',
    textMuted: 'text-slate-300',
    sectionBg: 'bg-[#0d121f] border-white/10',
    cardBg: 'bg-[#13192b] border-white/10 text-white',
    badgeStyle: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300',
    headlineGradient: 'from-emerald-400 via-violet-400 to-rose-400',
    primaryBtn:
      'bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20',
    secondaryBtn:
      'bg-white/10 hover:bg-white/15 text-white border border-white/15',
    orb1: 'bg-emerald-500/20',
    orb2: 'bg-violet-600/20',
  },
};

export default function HomePage() {
  const [activeProto, setActiveProto] = useState<PrototypeId>('obsidian');
  const proto = PROTOTYPES[activeProto];

  return (
    <div className={`min-h-[100dvh] flex flex-col overflow-x-hidden transition-colors duration-300 ${proto.pageBg}`}>
      <Navbar />

      {/* Live Interactive Design Prototype Switcher Bar */}
      <div className="bg-[#141210] border-b border-amber-500/25 py-2.5 px-4 sm:px-6 lg:px-10 text-white">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs">
            <Palette className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="font-mono uppercase tracking-wider text-amber-300 font-bold">
              Live Homepage Prototype Previewer:
            </span>
            <span className="text-stone-300 hidden sm:inline">
              Click any of the 4 prototypes below to preview its palette &amp; layout live
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {(Object.keys(PROTOTYPES) as PrototypeId[]).map((key) => {
              const p = PROTOTYPES[key];
              const isSelected = activeProto === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveProto(key)}
                  className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-amber-400 text-stone-950 border-amber-300 shadow-sm'
                      : 'bg-white/5 text-stone-200 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-mono text-xs opacity-75">{p.number}.</span>
                    <span className="truncate">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {p.swatch.map((hex) => (
                      <span
                        key={hex}
                        style={{ backgroundColor: hex }}
                        className="w-2.5 h-2.5 rounded-full border border-white/30"
                      />
                    ))}
                    {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-1">
        {/* Hero + Live Interactive Scanner Section */}
        <section className="relative pt-10 pb-20 sm:pt-14 sm:pb-24 overflow-hidden border-b border-current/10">
          {/* Ambient Orbs */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            className={`pointer-events-none absolute -top-24 -left-24 w-[460px] h-[460px] rounded-full blur-[130px] ${proto.orb1}`}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
            className={`pointer-events-none absolute top-16 right-0 w-[500px] h-[500px] rounded-full blur-[140px] ${proto.orb2}`}
          />

          <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            {/* Hero Header */}
            <motion.div
              key={activeProto}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center max-w-4xl mx-auto mb-10"
            >
              <div
                className={`inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border text-xs font-semibold mb-6 ${proto.badgeStyle}`}
              >
                <span className="w-2 h-2 rounded-full bg-current animate-ping" />
                <span>Real-Time Voice Authenticity &amp; LIME Explainable AI Studio</span>
              </div>

              <h1
                className={`text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-5 ${proto.textPrimary}`}
              >
                Verify Live Voices, Mimicry &amp;{' '}
                <span
                  className={`text-transparent bg-clip-text bg-gradient-to-r ${proto.headlineGradient}`}
                >
                  Unseen Audio in Seconds.
                </span>
              </h1>

              <p
                className={`text-base sm:text-xl max-w-2xl mx-auto leading-relaxed mb-8 ${proto.textMuted}`}
              >
                Record your microphone live, capture audio from any browser tab, or upload an unseen voice clip to get an instant authenticity verdict backed by LIME time-segment attribution.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#live-scanner"
                  className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all hover:brightness-110 ${proto.primaryBtn}`}
                >
                  <Mic className="w-4 h-4" />
                  Test Live Microphone Now
                </a>
                <a
                  href="/VeriVox.apk"
                  download="VeriVox.apk"
                  className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm sm:text-base transition-all ${proto.secondaryBtn}`}
                >
                  <Smartphone className="w-4 h-4" />
                  Download Android APK (2.3 MB)
                </a>
                <Link
                  href="/research"
                  className={`inline-flex items-center gap-1.5 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all ${proto.secondaryBtn}`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Research &amp; XAI Architecture
                </Link>
              </div>
            </motion.div>

            {/* Interactive Live Scanner Studio */}
            <div id="live-scanner" className="max-w-5xl mx-auto scroll-mt-24">
              <ScannerStudio mode="landing" themeVariant={activeProto} />
            </div>
          </div>
        </section>

        {/* 4 Audio Categories + Explainability Section */}
        <section className={`py-20 border-b ${proto.sectionBg}`}>
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-xs font-semibold mb-3 ${proto.badgeStyle}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Unseen Audio Generalization + LIME XAI</span>
              </div>
              <h2
                className={`text-3xl sm:text-4xl font-bold tracking-tight mb-3 ${proto.textPrimary}`}
              >
                Built for Live Judges &amp; Real-World Audio
              </h2>
              <p className={`text-base ${proto.textMuted}`}>
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
                    className={`rounded-2xl p-6 border transition-all ${proto.cardBg}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`font-mono text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${proto.badgeStyle}`}
                      >
                        {item.badge}
                      </span>
                      <Icon className="w-5 h-5 opacity-80" />
                    </div>
                    <h3 className={`text-lg font-bold mb-2 ${proto.textPrimary}`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm leading-relaxed ${proto.textMuted}`}>
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Mobile APK + Cloud Console Callout */}
        <section className="py-20">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="rounded-3xl bg-gradient-to-r from-[#141210] via-[#1c1814] to-[#121a16] border border-amber-500/25 p-8 sm:p-14 flex flex-col lg:flex-row items-center justify-between gap-10 text-white shadow-2xl">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-mono mb-4">
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>DIRECT ANDROID APK + CLOUD CONSOLE</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                  Verify Voices Anywhere on Web or Android
                </h2>
                <p className="text-stone-300 text-base leading-relaxed mb-6">
                  Download the signed Android APK directly from verivox.studio to test live voice recordings on your phone, or sign in to save scan history and export LIME XAI PDF certificates.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="/VeriVox.apk"
                    download="VeriVox.apk"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-orange-500 text-stone-950 hover:brightness-110 transition-all shadow-lg shadow-amber-500/20"
                  >
                    <Smartphone className="w-4 h-4" />
                    Direct Download Android APK
                  </a>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all"
                  >
                    <span>1-Click Judge Demo Login</span>
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
