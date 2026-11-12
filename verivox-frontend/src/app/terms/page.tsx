import React from 'react';
import { Navbar, Footer } from '@/components/layout';
import { Card } from '@/components/ui';

export default function TermsPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-secondary-50 text-secondary-900">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-primary-100 bg-gradient-to-b from-primary-50/70 via-white to-white py-16 sm:py-20">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 border border-primary-200 font-semibold text-xs text-primary-700 mb-6">
                <span>Terms of Use</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-secondary-950 tracking-tight mb-4">
                Terms & Conditions
              </h1>
              <p className="font-mono text-xs text-secondary-500 uppercase tracking-wider">
                Effective for verivox.tech • Updated 2026
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 space-y-6">
            <Card padding="lg">
              <h2 className="text-xl font-bold text-secondary-950 mb-3">1. Acceptance of Terms</h2>
              <p className="text-sm sm:text-base text-secondary-600 leading-relaxed">
                By accessing or using VeriVox (verivox.tech), you agree to be bound by these Terms & Conditions. VeriVox provides AI-powered voice verification and deepfake audio detection software.
              </p>
            </Card>

            <Card padding="lg">
              <h2 className="text-xl font-bold text-secondary-950 mb-3">2. Acceptable Use & Uploaded Content</h2>
              <ul className="list-disc pl-5 text-sm sm:text-base text-secondary-600 space-y-2 leading-relaxed">
                <li>You retain ownership of the audio recordings you upload for analysis.</li>
                <li>You must have the lawful right or permission to upload and analyze the audio files you submit.</li>
                <li>You agree not to abuse rate limits, attempt to disrupt the service, or use the platform for unlawful activities.</li>
              </ul>
            </Card>

            <Card padding="lg">
              <h2 className="text-xl font-bold text-secondary-950 mb-3">3. Probabilistic Nature of AI Detection</h2>
              <p className="text-sm sm:text-base text-secondary-600 leading-relaxed">
                VeriVox uses statistical machine learning models and explainability analysis to estimate the probability that an audio recording is synthetic or authentic. Because background noise, microphone characteristics, and audio compression can affect acoustic signals, results are probabilistic and should be used as one component of a broader verification workflow rather than sole legal proof.
              </p>
            </Card>

            <Card padding="lg">
              <h2 className="text-xl font-bold text-secondary-950 mb-3">4. Contact</h2>
              <p className="text-sm sm:text-base text-secondary-600 leading-relaxed">
                Questions regarding these Terms may be directed to{' '}
                <a
                  href="mailto:verivoxofficial@gmail.com"
                  className="text-primary-600 underline font-mono"
                >
                  verivoxofficial@gmail.com
                </a>
                .
              </p>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
