import React from 'react';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { Button, Card, Badge } from '@/components/ui';
import { Check, X, ArrowRight, Sparkles, Zap, Building2 } from 'lucide-react';
import { cn } from '@/utils/helpers';

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter Free',
      tag: 'Available Now',
      price: '$0',
      period: '/forever',
      description: 'Everything you need to test audio clips and export PDF reports.',
      icon: Sparkles,
      features: [
        { text: '5 audio scans per day', included: true },
        { text: 'WAV, MP3, and FLAC files up to 4 MB', included: true },
        { text: 'Instant AI voice clone score', included: true },
        { text: 'Visual waveform heatmap & summary', included: true },
        { text: 'Downloadable A4 PDF reports', included: true },
        { text: '7 day scan history', included: true },
        { text: 'Developer API keys', included: false },
      ],
      cta: 'Start Free Now',
      href: '/signup',
      highlighted: true,
    },
    {
      name: 'Pro Studio',
      tag: 'Early Access',
      price: '$49',
      period: '/month',
      description: 'Built for journalists, creators, and analysts scanning audio daily.',
      icon: Zap,
      features: [
        { text: 'Unlimited daily audio scans', included: true },
        { text: 'Priority heatmap generation', included: true },
        { text: 'Unlimited history storage', included: true },
        { text: 'Batch PDF report exports', included: true },
        { text: 'Larger audio file uploads', included: true },
        { text: 'API access (1,000 scans / month)', included: true },
        { text: 'Custom team integrations', included: false },
      ],
      cta: 'Request Early Access',
      href: '/contact',
      highlighted: false,
    },
    {
      name: 'Enterprise API',
      tag: 'Partner Plan',
      price: '$299',
      period: '/month',
      description: 'High volume API integration for security and media platforms.',
      icon: Building2,
      features: [
        { text: 'Everything in Pro Studio', included: true },
        { text: '10,000 API scans per month', included: true },
        { text: 'Direct REST API endpoints', included: true },
        { text: 'Custom threshold calibration', included: true },
        { text: 'Dedicated cloud storage bucket', included: true },
        { text: 'Direct engineering support', included: true },
        { text: 'Private container deployment', included: true },
      ],
      cta: 'Contact Team',
      href: '/contact',
      highlighted: false,
    },
  ];

  const faqs = [
    {
      q: 'What is included in the Starter Free plan?',
      a: 'Every user gets 5 free audio scans per day, complete with authenticity scores, visual waveform heatmaps, and downloadable PDF reports.',
    },
    {
      q: 'Which audio formats can I upload?',
      a: 'You can upload WAV, MP3, and FLAC files between 1 and 30 seconds long (up to 4 MB per file).',
    },
    {
      q: 'How do I unlock Pro Studio or Enterprise API?',
      a: 'While we are showcasing our public launch, you can use the Starter plan for free and contact our team directly to enable higher daily volume or API keys.',
    },
    {
      q: 'Can I download a report to share with my team?',
      a: 'Yes. Every completed scan lets you export a formatted A4 PDF report with confidence bars and visual waveform proof.',
    },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#141210] text-stone-100">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-amber-500/20 bg-gradient-to-b from-[#141210] via-[#0e0d0b] to-[#0b0a09] py-14 sm:py-20">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="max-w-2xl">
              <Badge variant="primary" size="md" className="mb-4">
                Simple Pricing
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
                Start scanning audio for free today
              </h1>
              <p className="text-base sm:text-lg text-stone-300 leading-relaxed">
                Get full access to our detection studio for free, or reach out for high volume team and API plans.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 sm:py-20 bg-[#141210] border-b border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              {plans.map((plan) => {
                const IconComponent = plan.icon;
                return (
                  <Card
                    key={plan.name}
                    variant="default"
                    padding="none"
                    className={cn(
                      'flex flex-col justify-between rounded-2xl overflow-hidden transition-all',
                      plan.highlighted
                        ? 'border-2 border-amber-400 shadow-xl shadow-primary-600/10'
                        : 'border border-white/10 bg-[#12100e]'
                    )}
                  >
                    <div className="p-6 sm:p-8 flex-1 flex flex-col">
                      <div className="flex items-center justify-between gap-2 mb-5">
                        <Badge
                          variant={plan.highlighted ? 'info' : 'default'}
                          size="sm"
                        >
                          {plan.tag}
                        </Badge>
                        <IconComponent className="w-5 h-5 text-amber-400" />
                      </div>

                      <h2 className="text-2xl font-bold text-white mb-2">
                        {plan.name}
                      </h2>
                      <p className="text-sm text-stone-300 leading-relaxed mb-6">
                        {plan.description}
                      </p>

                      <div className="mb-6 pb-6 border-b border-white/10 flex items-baseline gap-1">
                        <span className="text-4xl sm:text-5xl font-bold text-white">
                          {plan.price}
                        </span>
                        <span className="text-sm text-stone-400">
                          {plan.period}
                        </span>
                      </div>

                      <div className="mb-8 flex-1">
                        <ul className="space-y-3">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3 text-sm">
                              {feature.included ? (
                                <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                              ) : (
                                <X className="w-4 h-4 text-stone-600 flex-shrink-0 mt-0.5" />
                              )}
                              <span
                                className={
                                  feature.included
                                    ? 'text-stone-200'
                                    : 'text-stone-400 line-through'
                                }
                              >
                                {feature.text}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Link href={plan.href}>
                        <Button
                          variant={plan.highlighted ? 'primary' : 'outline'}
                          size="lg"
                          fullWidth
                        >
                          {plan.cta}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 sm:py-20 bg-[#12100e]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="max-w-2xl mb-10">
              <Badge variant="primary" size="md" className="mb-3">
                Common Questions
              </Badge>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Quick answers about plans and features
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {faqs.map((item, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#141210] border border-white/10 shadow-soft"
                >
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                    {item.q}
                  </h3>
                  <p className="text-sm text-stone-300 leading-relaxed">{item.a}</p>
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
