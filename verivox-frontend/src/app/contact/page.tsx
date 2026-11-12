'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar, Footer } from '@/components/layout';
import { Card, Input, Button, Alert, Badge } from '@/components/ui';
import { Mail, Globe, Send, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setSubmitted(true);
      setIsLoading(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 6000);
    }, 600);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#141210] text-stone-100">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="border-b border-amber-500/20 bg-gradient-to-b from-[#141210] via-[#0e0d0b] to-[#0b0a09] py-14 sm:py-20">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="max-w-2xl">
              <Badge variant="primary" size="md" className="mb-4">
                Get in Touch
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
                Talk with the VeriVox team
              </h1>
              <p className="text-base sm:text-lg text-stone-300 leading-relaxed">
                Have questions about our voice detection software, API access, or partnerships? Send us a message below.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Grid */}
        <section className="py-16 sm:py-20 bg-[#141210]">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              {/* Left Column: Direct Channels */}
              <div className="lg:col-span-5 space-y-6">
                <div className="p-7 rounded-2xl bg-gradient-to-br from-[#0b0a09] to-[#161411] text-white space-y-6 shadow-lg">
                  <div>
                    <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                      Direct Contact
                    </span>
                    <h2 className="text-2xl font-bold text-white mt-1 mb-2">
                      Reach our team directly
                    </h2>
                    <p className="text-sm text-slate-200/80 leading-relaxed">
                      Every message goes straight to the builders behind VeriVox.
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/15 text-sm">
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-emerald-300/80">Email</div>
                        <a
                          href="mailto:verivoxofficial@gmail.com"
                          className="text-white hover:text-emerald-300 transition-colors font-medium"
                        >
                          verivoxofficial@gmail.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Globe className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-emerald-300/80">Website</div>
                        <a
                          href="https://verivox.studio"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-emerald-300 transition-colors font-medium"
                        >
                          verivox.studio
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Instant Access</span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Want to test the software right now?
                  </h3>
                  <p className="text-sm text-stone-300">
                    Create a free account and scan up to 5 audio clips per day with zero wait time.
                  </p>
                  <div className="pt-1">
                    <Link
                      href="/signup"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 hover:text-amber-300"
                    >
                      Open Free Studio
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: Message Form */}
              <div className="lg:col-span-7">
                <Card variant="default" padding="lg" className="border-white/10 shadow-soft">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      Send a Message
                    </h2>
                  </div>

                  {submitted && (
                    <Alert
                      variant="success"
                      dismissible
                      onDismiss={() => setSubmitted(false)}
                      className="mb-6"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Message received</p>
                          <p className="text-sm mt-1">
                            Thank you for reaching out. You can also email us at{' '}
                            <a
                              href="mailto:verivoxofficial@gmail.com"
                              className="underline font-semibold"
                            >
                              verivoxofficial@gmail.com
                            </a>
                            .
                          </p>
                        </div>
                      </div>
                    </Alert>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <Input
                        label="Your Name"
                        type="text"
                        placeholder="Alex Rivera"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />

                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="alex@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        icon={<Mail className="w-4 h-4" />}
                        required
                      />
                    </div>

                    <Input
                      label="Subject"
                      type="text"
                      placeholder="Pro Access / API Integration / General Question"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />

                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-stone-300 mb-2">
                        Message
                      </label>
                      <textarea
                        rows={5}
                        placeholder="How can we help your team?"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 hover:border-white/15 focus:outline-none focus:ring-2 focus:ring-primary-600/15 focus:border-amber-400 bg-[#141210] text-white text-sm placeholder:text-stone-400 transition-all"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      isLoading={isLoading}
                    >
                      <Send className="w-4 h-4" />
                      Send Message
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
