'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Alert, Loading } from '@/components/ui';
import { CreditCard, Check, Shield, Sparkles, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/subscription', {
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSubscription(data.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setProcessingAction(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal');
      }

      window.location.href = data.data.url;
    } catch (err: any) {
      setError(err.message);
      setProcessingAction(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) {
      return;
    }

    setProcessingAction(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      await fetchSubscription();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingAction(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-secondary-50">
        <Loading text="Loading plan details..." />
      </div>
    );
  }

  const currentPlan = subscription?.plan || 'free';
  const isActive = subscription?.status === 'active';

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200/80">
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-primary-600 font-semibold mb-1">
              <Shield className="w-3.5 h-3.5 text-primary-600" />
              ACCOUNT PLAN &amp; QUOTA
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-950 tracking-tight">
              Plan &amp; Quota Allocation
            </h1>
            <p className="text-sm text-secondary-600 mt-0.5">
              View your active scan allowance and explore upcoming Pro and Enterprise options.
            </p>
          </div>
          <Badge variant={currentPlan === 'free' ? 'info' : 'success'} size="md">
            PLAN: {currentPlan.toUpperCase()}
          </Badge>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        {error && (
          <Alert variant="danger" dismissible onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Current Allocation Card */}
        <Card variant="default" padding="lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-secondary-200/80">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="font-mono text-xs uppercase tracking-wider text-secondary-500">
                  ACTIVE WORKSPACE PLAN
                </span>
                <Badge variant="success" size="sm">
                  ACTIVE
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-secondary-950">
                {currentPlan === 'free' && 'Expo Preview Plan ($0 / month)'}
                {currentPlan === 'premium' && 'Pro Analyst Plan ($49 / month)'}
                {currentPlan === 'enterprise' && 'Enterprise API Plan ($299 / month)'}
              </h2>
              <p className="text-sm text-secondary-600 mt-1">
                {currentPlan === 'free' &&
                  'Includes 5 daily audio scans, instant deepfake detection scores, visual LIME heatmaps, and A4 PDF report downloads.'}
                {currentPlan === 'premium' && 'Expanded daily scan quota and priority visual report generation.'}
                {currentPlan === 'enterprise' && 'Dedicated REST API throughput and custom deployment options.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {currentPlan !== 'free' && isActive ? (
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleManageBilling}
                  isLoading={processingAction}
                >
                  <CreditCard className="w-4 h-4" />
                  Billing Portal
                </Button>
              ) : (
                <Link href="/contact">
                  <Button variant="outline" size="md">
                    Request Higher Quota
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Active Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div className="p-4 rounded-xl bg-primary-50/40 border border-primary-100">
              <div className="font-mono text-[11px] uppercase tracking-wider text-secondary-500 mb-1">
                DAILY QUOTA
              </div>
              <div className="font-mono text-lg font-bold text-primary-700">
                {currentPlan === 'free' ? '5 files / day' : 'Unlimited'}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-primary-50/40 border border-primary-100">
              <div className="font-mono text-[11px] uppercase tracking-wider text-secondary-500 mb-1">
                MAX FILE SIZE
              </div>
              <div className="font-mono text-lg font-bold text-primary-700">
                4.0 MB (30s)
              </div>
            </div>
            <div className="p-4 rounded-xl bg-primary-50/40 border border-primary-100">
              <div className="font-mono text-[11px] uppercase tracking-wider text-secondary-500 mb-1">
                EXPLAINABILITY
              </div>
              <div className="font-mono text-lg font-bold text-primary-700">
                Visual LIME
              </div>
            </div>
            <div className="p-4 rounded-xl bg-primary-50/40 border border-primary-100">
              <div className="font-mono text-[11px] uppercase tracking-wider text-secondary-500 mb-1">
                REPORT EXPORT
              </div>
              <div className="font-mono text-lg font-bold text-primary-700">
                A4 PDF Report
              </div>
            </div>
          </div>
        </Card>

        {/* Roadmap Tiers */}
        <div id="plans">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-secondary-950">
                Upcoming Commercial Plans
              </h2>
              <p className="text-xs text-secondary-600">
                VeriVox is currently free during our Expo showcase. Higher-volume plans below are available via early access.
              </p>
            </div>
            <Badge variant="warning" size="sm">ROADMAP</Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card variant="default" padding="lg" className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-secondary-950">Pro Analyst</h3>
                  <Badge variant="default" size="sm">WAITLIST</Badge>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-mono text-3xl font-bold text-secondary-950">$49</span>
                  <span className="text-sm text-secondary-500">/ month (planned)</span>
                </div>
                <p className="text-sm text-secondary-600 mb-6">
                  Built for journalists, security teams, and creators verifying high volumes of audio daily.
                </p>

                <ul className="space-y-2.5 mb-8 text-sm text-secondary-700">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span>Expanded daily upload quota and longer audio clips</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span>Priority queue for LIME visual heatmap generation</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span>Unlimited archive history for PDF verification reports</span>
                  </li>
                </ul>
              </div>

              <Link href="/contact">
                <Button variant="outline" size="md" fullWidth>
                  <Sparkles className="w-4 h-4" />
                  Join Pro Waitlist
                </Button>
              </Link>
            </Card>

            <Card variant="default" padding="lg" className="flex flex-col justify-between bg-gradient-to-br from-[#0d111d] to-primary-950 text-white border-primary-800">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white">Enterprise API</h3>
                  <span className="font-mono text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary-900/80 text-primary-200 border border-primary-700/60">
                    CUSTOM DEPLOYMENT
                  </span>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-mono text-3xl font-bold text-white">Custom</span>
                  <span className="text-sm text-primary-200/70">/ volume tier</span>
                </div>
                <p className="text-sm text-primary-100/80 mb-6">
                  Direct REST API integration for automated voice verification in call centers and media platforms.
                </p>

                <ul className="space-y-2.5 mb-8 text-sm text-primary-100/90">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Authenticated REST API keys with high concurrency</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Custom sensitivity calibration for telecom audio</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Private cloud or on-premise Docker deployment</span>
                  </li>
                </ul>
              </div>

              <Link href="/contact">
                <Button variant="primary" size="md" fullWidth>
                  Contact Team for API Access
                </Button>
              </Link>
            </Card>
          </div>
        </div>

        {/* Cancel Subscription if active paid */}
        {currentPlan !== 'free' && isActive && (
          <Card variant="bordered" padding="lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-secondary-950 mb-1">Cancel Subscription</h3>
                <p className="text-sm text-secondary-600">
                  Your workspace will remain active on the current tier until the end of the billing cycle.
                </p>
              </div>
              <Button
                variant="danger"
                size="md"
                onClick={handleCancelSubscription}
                isLoading={processingAction}
              >
                Cancel Plan
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
