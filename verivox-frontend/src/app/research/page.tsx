'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { Button } from '@/components/ui';
import {
  Cpu,
  Layers,
  Activity,
  BarChart3,
  Radio,
  ShieldCheck,
  ArrowRight,
  Binary,
  Sparkles,
  FileText,
} from 'lucide-react';

export default function ResearchPage() {
  const architectureLayers = [
    {
      step: '01',
      title: '16 kHz Studio Resampling & Glottal Biometrics',
      tag: 'PREPROCESSING & DSP',
      description:
        'Incoming audio from live WebRTC microphones, browser tab streams, or uploaded files (.wav, .mp3, .flac, .m4a, .webm) is resampled to 16,000 Hz 16-bit mono PCM. A normalized autocorrelation pitch tracker measures fundamental frequency (F0) micro-jitter, dynamic crest factor, and syllable energy modulation.',
      metrics: ['16,000 Hz Mono PCM', '84 Hz - 333 Hz F0 Tracking', '25ms Frame Resolution'],
    },
    {
      step: '02',
      title: 'Self-Supervised Speech Transformer (Wav2Vec2-Large-XLSR)',
      tag: 'REPRESENTATION LEARNING',
      description:
        'Fine-tuned cross-lingual Wav2Vec2-Large-XLSR-53 representations capture subtle contextual phoneme transitions, breath pauses, and zero-shot neural vocoder phase artifacts across unseen languages and recording environments.',
      metrics: ['300M+ Parameters', 'Cross-Lingual Generalization', 'Zero-Shot TTS Detection'],
    },
    {
      step: '03',
      title: 'Spectro-Temporal Graph Attention (AASIST Research Core)',
      tag: 'GRAPH ATTENTION NETWORK',
      description:
        'Our proprietary spectro-temporal heterogeneous graph attention module models raw waveform features via SincNet-style filters and aligns temporal and spectral nodes to isolate sub-band voice conversion and replay anomalies.',
      metrics: ['64,600 Sample Windows', 'Heterogeneous Graph Pooling', 'Sub-Band Phase Inspection'],
    },
    {
      step: '04',
      title: 'LIME Temporal Perturbation & Multi-Band Attribution',
      tag: 'EXPLAINABLE AI (XAI)',
      description:
        'Local Interpretable Model-Agnostic Explanations (LIME) perturb contiguous time windows and frequency bands (80-320 Hz F0, 320-3200 Hz Formants, 3.2-8.0 kHz Vocoder Band) to prove exactly which segments triggered the verdict.',
      metrics: ['8-Window Temporal Map', '3-Band Spectral Weights', 'A4 Forensic Certificate'],
    },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0b0a09] text-stone-100">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-14 pb-20 border-b border-white/10 overflow-hidden">
          <div className="pointer-events-none absolute -top-24 left-1/4 w-[500px] h-[500px] rounded-full bg-amber-500/15 blur-[140px]" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 w-[450px] h-[450px] rounded-full bg-emerald-500/10 blur-[140px]" />

          <div className="relative max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-mono uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>VeriVox Acoustic Research &amp; Methodology</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.06] text-white mb-6">
                Hybrid Neural &amp; Biometric Architecture for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-emerald-300">
                  Unseen Audio Forensics.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-300 leading-relaxed mb-8">
                Traditional anti-spoofing models trained solely on studio datasets fail when tested on live microphones, compressed voice notes, or modern zero-shot TTS clones. VeriVox bridges research and real-world deployment through a domain-adaptive multi-model ensemble and LIME explainability.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/#live-scanner">
                  <Button
                    variant="primary"
                    size="lg"
                    className="bg-gradient-to-r from-amber-400 to-orange-500 !text-stone-950 font-bold"
                  >
                    Test Live Scanner Studio
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <a
                  href="/VeriVox.apk"
                  download="VeriVox.apk"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all"
                >
                  Download Android APK
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 4-Stage Architecture Pipeline */}
        <section className="py-20 bg-[#11100e] border-b border-white/10">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="max-w-2xl mb-14">
              <div className="font-mono text-xs uppercase tracking-wider text-amber-400 mb-2">
                4-STAGE INFERENCE PIPELINE
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
                How VeriVox Verifies Speech in Real Time
              </h2>
              <p className="text-stone-300 text-base">
                Every recording passes through four complementary analytical stages before producing an authenticity verdict and XAI attribution map.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {architectureLayers.map((layer) => (
                <div
                  key={layer.step}
                  className="p-7 rounded-3xl bg-[#181613] border border-white/10 hover:border-amber-400/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-5">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/25">
                        {layer.tag}
                      </span>
                      <span className="font-mono text-2xl font-bold text-stone-500">
                        {layer.step}
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
                      {layer.title}
                    </h3>
                    <p className="text-sm text-stone-300 leading-relaxed mb-6">
                      {layer.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                    {layer.metrics.map((m) => (
                      <span
                        key={m}
                        className="font-mono text-xs px-2.5 py-1 rounded-lg bg-black/50 text-emerald-300 border border-white/10"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Acoustic Biomarkers vs Synthetic Artifacts Comparison */}
        <section className="py-20 bg-[#0b0a09] border-b border-white/10">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5">
                <div className="font-mono text-xs uppercase tracking-wider text-emerald-400 mb-2">
                  ACOUSTIC FORENSICS
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight mb-4">
                  Physical Vocal Tract Dynamics vs. Neural Vocoders
                </h2>
                <p className="text-sm sm:text-base text-stone-300 leading-relaxed mb-6">
                  Human speech is produced by physical airflow through the glottis and vocal tract, creating natural micro-instabilities in pitch (jitter) and amplitude (shimmer). Neural TTS and RVC voice conversion models optimize for smooth loss functions, leaving behind measurable mathematical signatures.
                </p>

                <div className="p-5 rounded-2xl bg-[#161412] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2.5 text-amber-300 font-mono text-xs font-bold uppercase">
                    <BarChart3 className="w-4 h-4" />
                    <span>Explainable AI (XAI) Output</span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Every VeriVox scan generates an 8-segment temporal perturbation chart and a 3-band spectral attribution table that can be exported directly as an A4 PDF certificate.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="p-6 rounded-2xl bg-emerald-950/25 border border-emerald-500/30 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    AUTHENTIC HUMAN SPEECH
                  </div>
                  <ul className="space-y-3 text-xs sm:text-sm text-stone-200">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>
                        <strong>Pitch Micro-Jitter (1.1% – 8.5%):</strong> Natural cycle-to-cycle glottal fold variation in voiced vowels.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>
                        <strong>Plosive Crest Factor (&gt; 2.1x):</strong> Uncompressed dynamic bursts during /p/, /t/, and /k/ consonants.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>
                        <strong>Organic Formant Decay:</strong> Smooth high-frequency roll-off without phase grid artifacts.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 rounded-2xl bg-rose-950/25 border border-rose-500/30 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-mono font-bold">
                    <Cpu className="w-4 h-4" />
                    SYNTHETIC TTS &amp; VOICE MIMICRY
                  </div>
                  <ul className="space-y-3 text-xs sm:text-sm text-stone-200">
                    <li className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>
                        <strong>Over-Stabilized F0 (&lt; 0.9% Jitter):</strong> Diffusion and autoregressive TTS models over-smooth fundamental pitch.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>
                        <strong>Vocoder Phase Periodicity:</strong> HiFi-GAN and BigVGAN upsamplers introduce subtle 3.2–8.0 kHz spectral grids.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>
                        <strong>RVC Formant Jumps:</strong> Pitch-extraction discontinuities during fast consonant-to-vowel transitions.
                      </span>
                    </li>
                  </ul>
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
