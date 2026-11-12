'use client';

import React, { useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  Key,
  Copy,
  Check,
  Terminal,
  Play,
  RefreshCw,
  Puzzle,
  Smartphone,
} from 'lucide-react';

export default function DashboardApiPage() {
  const [apiKey, setApiKey] = useState(
    'vv_live_9f8a7d6c5b4e3f2a1d0c9b8a7f6e5d4c'
  );
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeLang, setActiveLang] = useState<'curl' | 'python' | 'node'>('curl');
  const [selectedPreset, setSelectedPreset] = useState<
    'ai_clone' | 'human_mic' | 'voice_mimic'
  >('ai_clone');
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

  const getSnippet = () => {
    if (activeLang === 'curl') {
      return `curl -X POST https://www.verivox.studio/api/v1/verify \\
  -H "Authorization: Bearer ${apiKey}" \\
  -F "file=@recording.wav" \\
  -F "captureMode=file_upload"`;
    }
    if (activeLang === 'python') {
      return `import requests

response = requests.post(
    "https://www.verivox.studio/api/v1/verify",
    headers={"Authorization": "Bearer ${apiKey}"},
    files={"file": ("recording.wav", open("recording.wav", "rb"), "audio/wav")},
    data={"captureMode": "file_upload"}
)
print(response.json())`;
    }
    return `const form = new FormData();
form.append("file", audioBlob, "recording.wav");

const res = await fetch("https://www.verivox.studio/api/v1/verify", {
  method: "POST",
  headers: { Authorization: "Bearer ${apiKey}" },
  body: form,
});
console.log(await res.json());`;
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
    <div className="min-h-[100dvh] bg-secondary-50">
      <div className="bg-white border-b border-secondary-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="font-mono text-xs text-primary-600 uppercase tracking-wider mb-1 font-semibold">
              ENTERPRISE API &amp; EXTENSION HUB
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-950 tracking-tight">
              REST API Keys, Sandbox &amp; Browser Extension
            </h1>
            <p className="text-sm text-secondary-600 mt-0.5">
              Integrate `POST /api/v1/verify` into your applications or download the Chrome Extension and Android APK.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a
              href="/VeriVox-Extension.zip"
              download="VeriVox-Extension.zip"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary-950 text-amber-300 font-bold text-xs border border-amber-500/30 hover:bg-secondary-900"
            >
              <Puzzle className="w-4 h-4" />
              Chrome Extension (.zip)
            </a>
            <a
              href="/VeriVox.apk"
              download="VeriVox.apk"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
            >
              <Smartphone className="w-4 h-4" />
              Android APK
            </a>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* API Key + Snippets */}
          <div className="lg:col-span-6 space-y-6">
            <Card variant="default" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-base text-secondary-950">
                    Active Enterprise API Key
                  </h3>
                </div>
                <Badge variant="success" size="sm">
                  ACTIVE
                </Badge>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-secondary-950 text-emerald-300 font-mono text-xs mb-4">
                <span className="truncate flex-1">{apiKey}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(apiKey);
                    setCopiedKey(true);
                    setTimeout(() => setCopiedKey(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-400 text-stone-950 font-bold text-xs"
                >
                  {copiedKey ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-secondary-500">
                  Endpoint: POST /api/v1/verify
                </span>
                <Button variant="outline" size="sm" onClick={regenerateKey}>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Rotate Key
                </Button>
              </div>
            </Card>

            <Card variant="default" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-base text-secondary-950">
                    Quickstart Integration Code
                  </h3>
                </div>
                <div className="flex gap-1">
                  {(['curl', 'python', 'node'] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveLang(lang)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold uppercase ${
                        activeLang === lang
                          ? 'bg-secondary-950 text-amber-300'
                          : 'bg-secondary-100 text-secondary-700'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative rounded-xl bg-secondary-950 text-stone-100 p-4 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getSnippet());
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="absolute top-3 right-3 px-2.5 py-1 rounded bg-white/10 text-xs font-mono text-amber-300"
                >
                  {copiedCode ? 'Copied' : 'Copy'}
                </button>
                <pre className="font-mono text-xs leading-relaxed pr-16">
                  {getSnippet()}
                </pre>
              </div>
            </Card>
          </div>

          {/* Live API Tester */}
          <div className="lg:col-span-6">
            <Card variant="default" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base text-secondary-950">
                    Live `/api/v1/verify` Sandbox Tester
                  </h3>
                  <p className="text-xs text-secondary-600">
                    Execute a real request against the enterprise endpoint and inspect the LIME XAI response.
                  </p>
                </div>
                <Badge variant="primary" size="sm">
                  v2.1 XAI
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { id: 'ai_clone', label: 'AI Voice Clone' },
                  { id: 'human_mic', label: 'Live Human Mic' },
                  { id: 'voice_mimic', label: 'RVC Mimicry' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedPreset(item.id as any)}
                    className={`px-3 py-2 rounded-xl font-mono text-xs font-bold border transition-all ${
                      selectedPreset === item.id
                        ? 'bg-secondary-950 text-amber-300 border-secondary-950'
                        : 'bg-secondary-50 text-secondary-700 border-secondary-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleRunLiveTest}
                isLoading={isTesting}
              >
                <Play className="w-4 h-4" />
                Send Live Enterprise API Request
              </Button>

              <div className="mt-4 rounded-xl bg-secondary-950 text-emerald-300 p-4 max-h-[320px] overflow-y-auto font-mono text-xs">
                <pre className="whitespace-pre-wrap">
                  {apiResponse
                    ? JSON.stringify(apiResponse, null, 2)
                    : '# Click "Send Live Enterprise API Request" to inspect the live JSON payload'}
                </pre>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
