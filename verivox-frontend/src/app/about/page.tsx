import React from 'react';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { Button, Badge } from '@/components/ui';
import {
  Cpu,
  Shield,
  Layers,
  ArrowRight,
  Sliders,
  Sparkles,
} from 'lucide-react';

export default function AboutPage() {
  const pillars = [
    {
      icon: Cpu,
      title: 'Direct Audio Signal Scanning',
      description:
        'VeriVox inspects raw audio waveforms directly to catch subtle glitches left by voice cloning and text to speech tools.',
    },
    {
      icon: Layers,
      title: 'Visual Timeline Proof',
      description:
        'Instead of just giving you a single number, our software highlights the exact seconds of an audio clip that look manipulated.',
    },
    {
      icon: Sliders,
      title: 'Honest Quality Checks',
      description:
        'Heavy background noise or low quality recordings are clearly flagged as inconclusive so your team never makes a blind call.',
    },
    {
      icon: Shield,
      title: 'Private Cloud Workspace',
      description:
        'Your uploaded recordings and generated PDF reports stay isolated in private cloud storage under your control.',
    },
  ];

  const roadmap = [
    {
      phase: 'Stage 01',
      status: 'Completed',
      title: 'Core Voice Detection Engine',
      description:
        'Built and calibrated our deepfake voice detection engine to separate natural human speech from synthetic audio.',
    },
    {
      phase: 'Stage 02',
      status: 'Completed',
      title: 'Visual Heatmap & Summary Generator',
      description:
        'Added automatic silence removal, 20 slice waveform heatmaps, and plain English explanations.',
    },
    {
      phase: 'Stage 03',
      status: 'Live Now',
      title: 'VeriVox Web Studio & PDF Reports',
      description:
        'Launched the live web application at verivox.studio with browser audio preview and one click PDF report exports.',
    },
    {
      phase: 'Stage 04',
      status: 'Next Up',
      title: 'Team API & Social Media Audio',
      description:
        'Expanding support for compressed voice notes and opening developer API keys for media and security teams.',
    },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#141210] text-stone-100">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-amber-500/20 bg-gradient-to-b from-[#141210] via-[#0e0d0b] to-[#0b0a09] py-14 sm:py-20">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-xs font-semibold text-amber-300 mb-5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>About VeriVox</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-5">
                Software built to make audio verification fast, visual, and trustworthy.
              </h1>
              <p className="text-base sm:text-lg text-stone-300 leading-relaxed">
                As AI voice cloning becomes effortless, teams need a simple way to check if a recording is real. VeriVox turns complex audio analysis into an easy web studio anyone can use in seconds.
              </p>
            </div>
          </div>
        </section>

        {/* Product Capabilities */}
        <section className="py-16 sm:py-20 bg-[#141210] border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="max-w-2xl mb-12">
              <Badge variant="primary" size="md" className="mb-3">
                What Makes Us Different
              </Badge>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Clear visual answers instead of black box guesses
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pillars.map((pillar, idx) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={idx}
                    className="p-7 rounded-2xl bg-[#12100e] border border-white/10 hover:border-primary-300 transition-colors"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-600 to-emerald-500 text-white flex items-center justify-center mb-5 shadow-sm">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-stone-300 leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Product Roadmap */}
        <section className="py-16 sm:py-20 bg-[#12100e] border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="max-w-2xl mb-12">
              <Badge variant="primary" size="md" className="mb-3">
                Product Journey
              </Badge>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                What is live today and what is coming next
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roadmap.map((item) => (
                <div
                  key={item.phase}
                  className="p-6 rounded-2xl bg-[#141210] border border-white/10 shadow-soft flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="text-xs font-bold text-amber-400">
                        {item.phase}
                      </span>
                      <Badge
                        variant={
                          item.status === 'Live Now'
                            ? 'info'
                            : item.status === 'Completed'
                            ? 'success'
                            : 'default'
                        }
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20 bg-[#141210]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="rounded-3xl bg-gradient-to-r from-[#0b0a09] via-[#161411] to-[#1c1917] text-white p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 shadow-xl">
              <div className="max-w-xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Test VeriVox on your own audio files today
                </h2>
                <p className="text-sm sm:text-base text-slate-200/90">
                  Start scanning recordings for free with 5 daily uploads included.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto flex-shrink-0">
                <Link href="/signup">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-[#141210] text-amber-300 hover:bg-emerald-50 font-bold w-full sm:w-auto"
                  >
                    Try Free Now
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-white/10 text-white border-white/25 hover:bg-white/20 hover:text-white w-full sm:w-auto"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
