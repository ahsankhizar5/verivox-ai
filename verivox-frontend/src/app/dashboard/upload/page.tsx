'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components/ui';
import { ScannerStudio } from '@/components/ScannerStudio';
import { Cpu, Layers, ShieldCheck, ArrowRight } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const [savedJobId, setSavedJobId] = useState<string | null>(null);

  return (
    <div className="min-h-[100dvh] bg-[#0b0a09]">
      {/* Header */}
      <div className="bg-[#141210] border-b border-white/10">
        <div className="px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="font-mono text-xs text-amber-400 uppercase tracking-wider mb-1 font-semibold">
              REAL-TIME VOICE &amp; FILE SCANNER
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Record Live Mic, Screen Audio, or Upload File
            </h1>
            <p className="text-sm text-stone-300 mt-0.5">
              Test live microphone speech, capture browser tab audio, or upload any recording. Every scan is automatically saved to your history.
            </p>
          </div>

          {savedJobId && (
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push(`/dashboard/results/${savedJobId}`)}
            >
              Open Full LIME Report
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <ScannerStudio
            mode="dashboard"
            onDashboardSaved={(jobId) => setSavedJobId(jobId)}
          />

          {/* Pipeline Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="default" padding="md">
              <div className="flex items-start gap-3">
                <Cpu className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-white mb-1">
                    Multi-Model Unseen Audio Engine
                  </h4>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Combines Wav2Vec2-XLSR transformers, LIME temporal attribution, and vocal cord biometrics to detect unseen AI voices and live speech.
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="default" padding="md">
              <div className="flex items-start gap-3">
                <Layers className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-white mb-1">
                    Visual LIME Heatmaps &amp; PDF
                  </h4>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Download an instant A4 PDF report or open the full LIME time-segment heatmap from your scan history.
                  </p>
                </div>
              </div>
            </Card>

            <Card variant="default" padding="md">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-white mb-1">
                    16 kHz Studio Normalization
                  </h4>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Automatically converts live mic, screen captures, and uploaded files into peak-normalized 16 kHz mono WAV.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
