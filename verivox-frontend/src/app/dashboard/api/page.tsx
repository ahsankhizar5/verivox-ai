'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Alert, Input } from '@/components/ui';
import { Key, Copy, RefreshCw, Terminal, AlertCircle, Eye, EyeOff, ArrowUpRight } from 'lucide-react';

export default function ApiAccessPage() {
  const [apiKey, setApiKey] = useState('');
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    fetchApiKey();
    fetchUsage();
  }, []);

  const fetchApiKey = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/api-key', {
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();

      if (response.ok) {
        setApiKey(data.data.apiKey);
      }
    } catch (err) {
      console.error('Failed to fetch API key:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsage = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/api-key/usage', {
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();

      if (response.ok) {
        setUsage(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    }
  };

  const handleRegenerateKey = async () => {
    if (!confirm('Regenerate API key? This immediately invalidates your existing key.')) {
      return;
    }

    setRegenerating(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/api-key/regenerate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();

      if (response.ok) {
        setApiKey(data.data.apiKey);
      }
    } catch (err) {
      alert('Failed to regenerate API key');
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopyKey = () => {
    if (!apiKey) return;
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const usagePercentage = usage ? (usage.usageCount / (usage.limit || 10000)) * 100 : 0;

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200/80">
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-primary-600 font-semibold mb-1">
              <Terminal className="w-3.5 h-3.5 text-primary-600" />
              DEVELOPER INTEGRATION
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-950 tracking-tight">
              API Keys &amp; Endpoints
            </h1>
            <p className="text-sm text-secondary-600 mt-0.5">
              Manage your API credentials and integrate VeriVox voice verification into your own apps.
            </p>
          </div>
          <Badge variant="info" size="md">
            REST API
          </Badge>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:px-8 max-w-6xl mx-auto space-y-6">
        {/* API Key Card */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Key className="w-4 h-4 text-primary-600" />
                <CardTitle>API Key</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerateKey}
                isLoading={regenerating}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Rotate Key
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Alert variant="warning">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="text-xs sm:text-sm">
                    <strong>Keep this key secret.</strong> Do not expose your API key in public repositories or client-side code.
                  </div>
                </div>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type={showKey ? 'text' : 'password'}
                    value={loading ? 'Loading key...' : apiKey || 'No key generated yet. Click Rotate Key.'}
                    readOnly
                    className="font-mono text-xs sm:text-sm"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowKey(!showKey)}
                        className="text-secondary-400 hover:text-secondary-700 transition-colors"
                      >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                </div>
                <Button
                  variant={copied ? 'secondary' : 'primary'}
                  size="md"
                  onClick={handleCopyKey}
                  disabled={!apiKey}
                >
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied' : 'Copy Key'}
                </Button>
              </div>

              <p className="text-xs font-mono text-secondary-500">
                HEADER FORMAT: <code className="bg-primary-50 text-primary-900 px-2 py-0.5 rounded border border-primary-200">X-API-Key: &lt;YOUR_KEY&gt;</code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Telemetry / Quota */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>API Usage &amp; Quota</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-secondary-500">
                    MONTHLY REQUEST VOLUME
                  </span>
                  <span className="font-mono text-xl font-bold text-secondary-950 tabular-nums">
                    {usage?.usageCount || 0} / {usage?.limit || 10000}
                  </span>
                </div>
                <div className="h-2.5 bg-primary-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usagePercentage > 80 ? 'bg-danger-600' : 'bg-primary-600'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs font-mono text-secondary-500 mt-2">
                  {(usage?.limit || 10000) - (usage?.usageCount || 0)} calls remaining in current cycle
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-secondary-200/80">
                <div className="p-3.5 rounded-xl bg-primary-50/40 border border-primary-100">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-secondary-500 mb-1">
                    AUDIO SAMPLE RATE
                  </p>
                  <p className="font-mono text-sm font-bold text-primary-800">16 kHz Mono</p>
                </div>
                <div className="p-3.5 rounded-xl bg-primary-50/40 border border-primary-100">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-secondary-500 mb-1">
                    LAST REQUEST
                  </p>
                  <p className="font-mono text-sm font-bold text-primary-800">
                    {usage?.lastUsed ? new Date(usage.lastUsed).toLocaleDateString() : 'No calls recorded'}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-primary-50/40 border border-primary-100">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-secondary-500 mb-1">
                    QUOTA RESET DATE
                  </p>
                  <p className="font-mono text-sm font-bold text-primary-800">
                    {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reference Payloads */}
        <Card variant="default" padding="lg">
          <CardHeader>
            <CardTitle>Quickstart Examples</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-semibold text-secondary-900">
                    1. Fast Voice Detection (/predict)
                  </span>
                  <Badge variant="default" size="sm">POST multipart/form-data</Badge>
                </div>
                <pre className="bg-[#0d111d] text-primary-100 p-4 rounded-xl overflow-x-auto font-mono text-xs leading-relaxed border border-primary-800">
{`curl -X POST https://verivox.tech/api/upload \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -F "file=@sample_voice.wav"

# Response:
{
  "predicted_label": "spoof",
  "confidence": "99.15%",
  "confidence_level": "high",
  "spoof_score": "99.15%",
  "bonafide_score": "0.85%"
}`}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-semibold text-secondary-900">
                    2. Visual Heatmap Report (/analyze)
                  </span>
                  <Badge variant="info" size="sm">LIME HEATMAP</Badge>
                </div>
                <pre className="bg-[#0d111d] text-primary-100 p-4 rounded-xl overflow-x-auto font-mono text-xs leading-relaxed border border-primary-800">
{`curl -X POST https://verivox.tech/api/results/<ID>/analyze \\
  -H "Authorization: Bearer YOUR_TOKEN"

# Returns visual heatmap + narrative:
{
  "predicted_label": "spoof",
  "confidence": "99.15%",
  "explanation": "Synthetic voice artifacts detected...",
  "visualization_b64": "iVBORw0KGgoAAAANSUhEUg..."
}`}
                </pre>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-secondary-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-secondary-600">
                Need higher rate limits or custom webhook integrations for your team?
              </p>
              <Link href="/contact">
                <Button variant="outline" size="sm">
                  Contact Team
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
