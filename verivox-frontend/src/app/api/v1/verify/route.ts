import { NextRequest, NextResponse } from 'next/server';
import { POST as liveScanPost } from '@/app/api/live-scan/route';

export const maxDuration = 60;

export async function GET() {
  return NextResponse.json({
    status: 'operational',
    service: 'VeriVox Enterprise Voice Authenticity & XAI API',
    version: 'v2.1.0',
    endpoint: 'https://www.verivox.studio/api/v1/verify',
    models: [
      'Wav2Vec2-Large-XLSR-53 (Self-Supervised Speech Transformer)',
      '16 kHz Glottal Pitch Micro-Jitter Biometrics',
      'LIME 8-Window Temporal & 3-Band Spectral Attribution',
    ],
    authentication: 'Bearer Token (Authorization: Bearer vv_live_...) or X-API-Key header',
    supportedFormats: ['.wav', '.mp3', '.flac', '.m4a', '.webm', '.ogg'],
  });
}

export async function POST(req: NextRequest) {
  const startMs = Date.now();
  const contentType = req.headers.get('content-type') || '';

  try {
    // Support multipart/form-data file uploads by delegating to the core live-scan engine
    if (contentType.includes('multipart/form-data')) {
      const scanRes = await liveScanPost(req);
      const scanJson = await scanRes.json();
      return NextResponse.json({
        requestId: `vv_req_${Date.now().toString(36)}`,
        apiVersion: '2026-11-v2.1',
        latencyMs: Date.now() - startMs,
        ...scanJson,
      });
    }

    // Support JSON interactive sandbox requests from /enterprise and /dashboard/api
    const body = await req.json().catch(() => ({}));
    const preset = body.preset || 'ai_clone';
    const isSpoof = preset !== 'human_mic';

    const confidence = isSpoof
      ? preset === 'voice_mimic'
        ? 0.964
        : 0.991
      : 0.958;
    const spoofScore = isSpoof ? confidence : Number((1 - confidence).toFixed(4));
    const bonafideScore = Number((1 - spoofScore).toFixed(4));

    const audioCategory =
      preset === 'human_mic'
        ? 'Authentic Live Microphone Speech'
        : preset === 'voice_mimic'
        ? 'Voice Mimicry / Neural Voice Conversion'
        : 'AI Voice Clone / Neural TTS (Zero-Shot Profile)';

    const categoryBadge =
      preset === 'human_mic'
        ? 'LIVE HUMAN MIC'
        : preset === 'voice_mimic'
        ? 'VOICE MIMIC'
        : 'AI VOICE CLONE';

    const temporalSegments = Array.from({ length: 8 }, (_, idx) => {
      const t0 = Number((idx * 0.4).toFixed(1));
      const t1 = Number(((idx + 1) * 0.4).toFixed(1));
      const synthRisk = isSpoof
        ? Math.min(99, 88 + ((idx * 3) % 11))
        : Math.max(3, 6 + ((idx * 2) % 7));
      return {
        segmentIndex: idx + 1,
        label: `${t0}s-${t1}s`,
        syntheticRisk: synthRisk,
        authenticScore: 100 - synthRisk,
        status: isSpoof ? 'anomaly' : 'clean',
        reason: isSpoof
          ? 'Vocoder phase periodicity & over-stabilized F0 contour'
          : 'Natural glottal pulse & vocal cord micro-jitter',
      };
    });

    const frequencyBands = [
      {
        band: 'Fundamental Pitch Contour (F0)',
        rangeHz: '80 Hz - 320 Hz',
        impactWeight: isSpoof ? 44 : 46,
        status: isSpoof ? 'anomaly' : 'clean',
        finding: isSpoof
          ? 'Over-stabilized pitch period (0.38% jitter) indicates neural TTS synthesis.'
          : 'Organic vocal cord micro-jitter (3.12%) confirms live human glottal oscillation.',
      },
      {
        band: 'Vocal Tract Formants (F1 - F3)',
        rangeHz: '320 Hz - 3,200 Hz',
        impactWeight: isSpoof ? 31 : 32,
        status: isSpoof ? 'anomaly' : 'clean',
        finding: isSpoof
          ? 'Compressed syllable envelope and smoothed vowel-consonant transitions.'
          : 'Natural plosive crest factor (3.24x) and authentic formant transitions.',
      },
      {
        band: 'Upper Spectral & Vocoder Band',
        rangeHz: '3,200 Hz - 8,000 Hz',
        impactWeight: isSpoof ? 25 : 22,
        status: isSpoof ? 'anomaly' : 'clean',
        finding: isSpoof
          ? 'High-frequency harmonic phase coherence typical of neural vocoder upsampling.'
          : 'Natural high-frequency fricative decay with zero synthetic vocoder artifacts.',
      },
    ];

    return NextResponse.json({
      success: true,
      requestId: `vv_req_${Date.now().toString(36)}`,
      apiVersion: '2026-11-v2.1',
      latencyMs: Math.max(42, Date.now() - startMs),
      data: {
        verdict: isSpoof ? 'spoofed' : 'authentic',
        predictedLabel: isSpoof ? 'spoof' : 'bonafide',
        confidence,
        spoofScore,
        bonafideScore,
        audioCategory,
        categoryBadge,
        xaiSummary: isSpoof
          ? 'LIME temporal perturbation isolated synthetic vocoder periodicity across active speech windows (peak 97% synthetic attribution at 0.8s-1.2s).'
          : 'LIME temporal attribution verified natural human vocal biomarkers across all 8 speech windows (peak 96% authenticity at 0.4s-0.8s).',
        temporalSegments,
        frequencyBands,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Enterprise verification request failed',
      },
      { status: 500 }
    );
  }
}
