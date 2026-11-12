import React from 'react';
import { Navbar, Footer } from '@/components/layout';
import { Card } from '@/components/ui';

export default function PrivacyPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0b0a09] text-stone-100">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-amber-500/20 bg-gradient-to-b from-[#141210] via-[#0e0d0b] to-[#0b0a09] py-16 sm:py-20">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 font-semibold text-xs text-amber-300 mb-6">
                <span>Privacy Policy</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
                Privacy Policy
              </h1>
              <p className="font-mono text-xs text-stone-400 uppercase tracking-wider">
                Effective for verivox.studio • Updated 2026
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20 bg-[#141210]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10 space-y-6">
            <Card padding="lg">
              <h2 className="text-xl font-bold text-white mb-3">1. Overview</h2>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
                VeriVox operates the deepfake audio detection platform at verivox.studio. This policy outlines what data we collect when you create an account and upload audio recordings for verification, how that data is processed, and how you can delete it.
              </p>
            </Card>

            <Card padding="lg">
              <h2 className="text-xl font-bold text-white mb-3">2. Information We Collect</h2>
              <ul className="list-disc pl-5 text-sm sm:text-base text-stone-300 space-y-2 leading-relaxed">
                <li>
                  <strong className="text-stone-100">Account Credentials:</strong> Your first name, last name, email address, and encrypted password when you register.
                </li>
                <li>
                  <strong className="text-stone-100">Uploaded Audio Recordings:</strong> Audio files (`.wav`, `.flac`, `.mp3`) you submit for verification, along with basic file metadata (filename, size, duration).
                </li>
                <li>
                  <strong className="text-stone-100">Verification Reports:</strong> Authenticity scores, visual heatmaps, and summary reports linked to your detection history.
                </li>
              </ul>
            </Card>

            <Card padding="lg">
              <h2 className="text-xl font-bold text-white mb-3">3. How Audio Files Are Processed & Stored</h2>
              <ul className="list-disc pl-5 text-sm sm:text-base text-stone-300 space-y-2 leading-relaxed">
                <li>Uploaded audio files and generated reports are stored in private cloud storage buckets and accessed via temporary presigned URLs.</li>
                <li>Audio files are transmitted securely over HTTPS to our inference service solely to compute authenticity scores and visual reports.</li>
                <li>We do not sell your personal information or share your uploaded recordings with third parties.</li>
                <li>You may delete individual scan results or permanently delete your entire account at any time from your dashboard.</li>
              </ul>
            </Card>

            <Card padding="lg">
              <h2 className="text-xl font-bold text-white mb-3">4. Contact</h2>
              <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
                For privacy inquiries or data deletion requests, contact the VeriVox team at{' '}
                <a
                  href="mailto:verivoxofficial@gmail.com"
                  className="text-amber-400 underline font-mono"
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
