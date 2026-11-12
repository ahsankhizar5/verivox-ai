import React from 'react';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { Button, Badge } from '@/components/ui';
import { ArrowRight } from 'lucide-react';

export default function CareersPage() {
  const tracks = [
    {
      tag: 'Audio AI',
      title: 'Voice Clone & Codec Testing',
      type: 'Remote Collaboration',
      description:
        'Help test and improve detection accuracy across social media voice notes, phone calls, and new AI voice generators.',
    },
    {
      tag: 'Visual XAI',
      title: 'Fast Waveform Visualization',
      type: 'Remote Collaboration',
      description:
        'Work on faster visual heatmaps and clear audio timelines for real time verification.',
    },
    {
      tag: 'Product Engineering',
      title: 'Web Studio & API Engineering',
      type: 'Contributor Track',
      description:
        'Help scale our Next.js web studio, interactive audio players, and developer API endpoints.',
    },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white text-secondary-900">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-primary-100 bg-gradient-to-b from-primary-50/70 via-white to-white py-14 sm:py-20">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="max-w-2xl">
              <Badge variant="primary" size="md" className="mb-4">
                Collaborate With Us
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-secondary-950 tracking-tight mb-4">
                Build the future of voice verification with us
              </h1>
              <p className="text-base sm:text-lg text-secondary-600 leading-relaxed">
                VeriVox is a startup project built by engineers passionate about audio authenticity. We welcome collaborations with developers, creators, and media teams.
              </p>
            </div>
          </div>
        </section>

        {/* Tracks */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="space-y-4 max-w-4xl">
              {tracks.map((track, index) => (
                <div
                  key={index}
                  className="p-6 sm:p-8 rounded-2xl bg-secondary-50/60 border border-secondary-200 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <Badge variant="primary" size="sm">
                        {track.tag}
                      </Badge>
                      <span className="text-xs font-medium text-secondary-500">
                        {track.type}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-secondary-950">
                      {track.title}
                    </h3>
                    <p className="text-sm text-secondary-600 leading-relaxed">
                      {track.description}
                    </p>
                  </div>

                  <Link href="/contact" className="flex-shrink-0">
                    <Button variant="outline" size="md">
                      Get in Touch
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
