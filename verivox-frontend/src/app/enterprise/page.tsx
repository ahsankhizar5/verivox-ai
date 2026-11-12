'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import {
  Terminal,
  Key,
  Copy,
  Check,
  Play,
  ShieldCheck,
  Cpu,
  Smartphone,
  Puzzle,
  ArrowRight,
  Sparkles,
  BarChart3,
  Globe,
} from 'lucide-react';

export default function EnterprisePage() {
  const [apiKey, setApiKey] = useState(
    'vv_live_9f8a7d6c5b4e3f2a1d0c9b8a7f6e5d4c'
  );
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<
    'ai_clone' | 'human_mic' | 'voice_mimic'
  >('ai_clone');
  const [activeLang, setActiveLang] = useState<'curl' | 'python' | 'node'>('curl');
  const [isTesting, setIsTesting] = useState(false);
  const [apiResponse, setApiResponse] = useState<Record<string, any> | null>(null);

  const regenerateKey = () => {
    const chars = '0123456789abcdef';
    let next = 'vv_live_';
    for (let i = 0; i < 32; i++) {
      next += chars[Math.floor(Math.random() * chars.length)];
    }
    setApiKey(next);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const getSnippet = () => {
    if (activeLang === 'curl') {
      return `curl -X POST https://www.verivox.studio/api/v1/verify \\
  -H "Authorization: Bearer ${apiKey}" \\
  -F "file=@recording.wav" \\
  -F "captureMode=file_upload"`;
    }
    if (activeLang === 'python') {
      return `import requests

url = "https://www.verivox.studio/api/v1/verify"
headers = {"Authorization": f"Bearer ${apiKey}"}

with open("recording.wav", "rb") as audio_file:
    response = requests.post(
        url,
        headers=headers,
        files={"file": ("recording.wav", audio_file, "audio/wav")},
        data={"captureMode": "file_upload"}
    )

result = response.json()
print("Verdict:", result["data"]["verdict"])
print("XAI Summary:", result["data"]["xaiSummary"])`;
    }
    return `const form = new FormData();
form.append("file", audioFileBlob, "recording.wav");
form.append("captureMode", "file_upload");

const response = await fetch("https://www.verivox.studio/api/v1/verify", {
  method: "POST",
  headers: {
    Authorization: "Bearer ${apiKey}",
  },
  body: form,
});

const { data } = await response.json();
console.log(data.verdict, data.confidence, data.temporalSegments);`;
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(getSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRunLiveTest = async () => {
    setIsTesting(true);
    try {
      const res = await fetch('/api/v1/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ preset: selectedPreset }),
      });
      const json = await res.json();
      setApiResponse(json);
    } catch (err: any) {
      setApiResponse({ success: false, error: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0b0a09] text-stone-100">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-14 pb-16 border-b border-white/10 overflow-hidden">
          <div className="pointer-events-none absolute -top-24 left-1/3 w-[500px] h-[500px] rounded-full bg-amber-500/15 blur-[140px]" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 w-[440px] h-[440px] rounded-full bg-emerald-500/10 blur-[140px]" />

          <div className="relative max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-mono uppercase tracking-wider mb-6">
                <Globe className="w-3.5 h-3.5" />
                <span>Enterprise Access Point &amp; Browser Extension Hub</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.06] text-white mb-5">
                Deploy Real-Time Voice Verification Across{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-emerald-300">
                  API, Browser &amp; Mobile.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-stone-300 leading-relaxed mb-8">
                Integrate VeriVox directly into call centers, financial KYC pipelines, and media workflows using our low-latency REST API (`POST /api/v1/verify`), Chrome &amp; Edge Browser Extension, and native Android APK.
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#api-sandbox"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-stone-950 hover:brightness-110 transition-all shadow-lg shadow-amber-500/20"
                >
                  <Terminal className="w-4 h-4" />
                  Test Live Enterprise API
                </a>
                <a
                  href="/extension"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 transition-all"
                >
                  <Puzzle className="w-4 h-4" />
                  Launch Chrome/Edge Extension
                </a>
                <a
                  href="/VeriVox-Native-v2.2.apk"
                  download="VeriVox-Native-v2.2.apk"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all"
                >
                  <Smartphone className="w-4 h-4 text-amber-300" />
                  Download Android APK
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Enterprise API Sandbox */}
        <section id="api-sandbox" className="py-16 bg-[#11100e] border-b border-white/10 scroll-mt-20">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Key Generator + SDK Snippets */}
              <div className="lg:col-span-6 space-y-6">
                <div className="p-6 rounded-3xl bg-[#171512] border border-amber-500/25 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold uppercase">
                      <Key className="w-4 h-4" />
                      <span>1. Instant Enterprise Sandbox Key</span>
                    </div>
                    <button
                      type="button"
                      onClick={regenerateKey}
                      className="text-xs font-mono text-stone-300 hover:text-amber-300 underline"
                    >
                      Generate New Key
                    </button>
                  </div>

                  <div className="flex items-center gap-2 bg-black/60 border border-white/10 rounded-xl p-3">
                    <code className="font-mono text-xs text-emerald-300 truncate flex-1">
                      {apiKey}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyKey}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 text-stone-950 font-bold text-xs hover:brightness-110"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedKey ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <div className="text-xs text-stone-400 font-mono">
                    Endpoint: <span className="text-stone-200">POST https://www.verivox.studio/api/v1/verify</span>
                  </div>
                </div>

                {/* Code Snippets */}
                <div className="p-6 rounded-3xl bg-[#171512] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-wider text-stone-300 font-bold">
                      2. Integration SDK Snippets
                    </span>
                    <div className="flex gap-1.5">
                      {(['curl', 'python', 'node'] as const).map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setActiveLang(lang)}
                          className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold uppercase transition-all ${
                            activeLang === lang
                              ? 'bg-amber-400 text-stone-950'
                              : 'bg-white/5 text-stone-300 hover:bg-white/10'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative rounded-2xl bg-black/70 border border-white/10 p-4 overflow-x-auto">
                    <button
                      type="button"
                      onClick={handleCopySnippet}
                      className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-stone-200"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCode ? 'Copied' : 'Copy'}
                    </button>
                    <pre className="font-mono text-xs text-stone-200 leading-relaxed pr-16">
                      {getSnippet()}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Interactive Endpoint Runner */}
              <div className="lg:col-span-6 p-6 sm:p-7 rounded-3xl bg-[#171512] border border-amber-500/25 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-bold">
                      3. Live Endpoint Playground
                    </div>
                    <h3 className="text-xl font-bold text-white mt-0.5">
                      Execute Live `/api/v1/verify` Request
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
                    200 OK LIVE
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ai_clone', label: 'AI Voice Clone' },
                    { id: 'human_mic', label: 'Live Human Mic' },
                    { id: 'voice_mimic', label: 'RVC Mimicry' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedPreset(item.id as any)}
                      className={`px-3 py-2.5 rounded-xl font-mono text-xs font-bold border transition-all ${
                        selectedPreset === item.id
                          ? 'bg-amber-400 text-stone-950 border-amber-300'
                          : 'bg-black/40 text-stone-300 border-white/10 hover:bg-white/5'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleRunLiveTest}
                  disabled={isTesting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-400 to-teal-400 text-stone-950 hover:brightness-110 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Play className="w-4 h-4 fill-current" />
                  {isTesting
                    ? 'Executing POST /api/v1/verify...'
                    : 'Send Live Enterprise API Request'}
                </button>

                <div className="rounded-2xl bg-black/80 border border-white/10 p-4 max-h-[340px] overflow-y-auto">
                  <div className="flex items-center justify-between text-xs font-mono text-stone-400 pb-2 mb-2 border-b border-white/10">
                    <span>JSON Response Payload (with LIME XAI Attribution)</span>
                    {apiResponse?.latencyMs && (
                      <span className="text-emerald-400">{apiResponse.latencyMs} ms</span>
                    )}
                  </div>
                  <pre className="font-mono text-xs text-emerald-300 leading-relaxed whitespace-pre-wrap">
                    {apiResponse
                      ? JSON.stringify(apiResponse, null, 2)
                      : '// Click "Send Live Enterprise API Request" above to inspect the live JSON response from /api/v1/verify'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Browser Extension & Mobile APK Deployment Cards */}
        <section className="py-20 bg-[#0b0a09]">
          <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Chrome / Edge Extension Card */}
              <div className="p-8 rounded-3xl bg-[#161411] border border-amber-500/25 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold">
                    <Puzzle className="w-3.5 h-3.5" />
                    <span>CHROME &amp; EDGE EXTENSION (MANIFEST V3)</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    VeriVox Browser Extension
                  </h3>
                  <p className="text-sm text-stone-300 leading-relaxed">
                    Capture live audio directly from any active YouTube, WhatsApp Web, TikTok, or Google Meet tab without leaving the page. Includes a built-in 20-bar spectrum analyzer and 4-window LIME attribution popup.
                  </p>
                  <ol className="text-xs text-stone-300 space-y-1.5 font-mono bg-black/40 p-4 rounded-2xl border border-white/10">
                    <li>1. Download <strong className="text-amber-300">VeriVox-Extension.zip</strong> below and unzip it.</li>
                    <li>2. Open <strong className="text-amber-300">chrome://extensions</strong> and enable Developer Mode.</li>
                    <li>3. Click <strong className="text-amber-300">Load unpacked</strong> and select the unzipped folder.</li>
                  </ol>
                </div>

                <div>
                  <a
                    href="/extension"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-stone-950 hover:brightness-110 transition-all"
                  >
                    <Puzzle className="w-4 h-4" />
                    Download Launch Browser Extension
                  </a>
                </div>
              </div>

              {/* Native Android APK Card */}
              <div className="p-8 rounded-3xl bg-[#161411] border border-emerald-500/25 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-mono font-bold">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>ANDROID MOBILE STUDIO (Native APK v2.2)</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white">
                    VeriVox Native Android App
                  </h3>
                  <p className="text-sm text-stone-300 leading-relaxed">
                    Install the signed Android APK directly from `verivox.studio` to record live microphone speech, upload WhatsApp voice notes from your phone storage, and export A4 XAI PDF certificates on mobile.
                  </p>
                  <div className="text-xs text-stone-300 space-y-1.5 font-mono bg-black/40 p-4 rounded-2xl border border-white/10">
                    <div>• Package ID: <span className="text-emerald-300">tech.verivox.app</span></div>
                    <div>• Signing: <span className="text-emerald-300">v1 JAR + v2 Full APK Signature</span></div>
                    <div>• Size: <span className="text-emerald-300">2.39 MB (Direct Edge Download)</span></div>
                  </div>
                </div>

                <div>
                  <a
                    href="/VeriVox-Native-v2.2.apk"
                    download="VeriVox-Native-v2.2.apk"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-400 to-teal-400 text-stone-950 hover:brightness-110 transition-all"
                  >
                    <Smartphone className="w-4 h-4" />
                    Direct Download Android APK (2.4 MB)
                  </a>
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
