'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Input, Button } from '@/components/ui';
import { BrandLogo } from '@/components/layout/Navbar';
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Activity,
  Layers,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailBlur = () => {
    if (formData.email && !validateEmail(formData.email)) {
      setValidationErrors((prev) => ({
        ...prev,
        email: 'Please enter a valid email address',
      }));
    } else {
      setValidationErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordBlur = () => {
    if (formData.password && formData.password.length < 8) {
      setValidationErrors((prev) => ({
        ...prev,
        password: 'Password must be at least 8 characters',
      }));
    } else {
      setValidationErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address', 'Invalid Email');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters', 'Invalid Password');
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!', 'Login Successful');
    } catch (err: any) {
      toast.error(
        err.message || 'Invalid email or password. Please try again.',
        'Login Failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left Side: Dark Slate Brand Panel */}
      <div className="hidden lg:flex lg:col-span-6 bg-gradient-to-br from-[#090d16] via-[#17112e] to-primary-900 text-white flex-col justify-between p-12 xl:p-16">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo darkText={false} />
          </Link>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">
            Voice Verification Studio
          </span>
        </div>

        <div className="max-w-lg space-y-7 my-auto py-10">
          <div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-4">
              Detect AI voice clones &amp; live audio in seconds.
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Sign in to record live microphone speech, capture screen audio, inspect visual heatmaps, and export PDF reports.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xs">
              <Activity className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-white">
                  Live Mic, Screen &amp; File Scanning
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Verify real human voices vs. AI voice clones, mimicry, and system audio streams.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xs">
              <Layers className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-white">
                  Visual Proof &amp; PDF Reports
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  See which audio segments triggered the alert and export a clean A4 PDF report.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-white/15">
          <span>verivox.tech</span>
          <span className="flex items-center gap-1.5 text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Encrypted Session
          </span>
        </div>
      </div>

      {/* Right Side: Sign In Form */}
      <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-12 xl:p-16 bg-secondary-50/40">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-secondary-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link href="/" className="lg:hidden">
            <BrandLogo darkText={true} />
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="mb-7">
            <h2 className="text-3xl font-bold text-secondary-950 tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-sm text-secondary-600">
              Sign in to your VeriVox studio account.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-secondary-200 shadow-soft">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (validationErrors.email) {
                    setValidationErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                onBlur={handleEmailBlur}
                icon={<Mail className="w-4 h-4" />}
                error={validationErrors.email}
                required
              />

              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (validationErrors.password) {
                    setValidationErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                onBlur={handlePasswordBlur}
                icon={<Lock className="w-4 h-4" />}
                error={validationErrors.password}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-secondary-400 hover:text-secondary-700 transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
              />

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) =>
                      setFormData({ ...formData, rememberMe: e.target.checked })
                    }
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-600 cursor-pointer"
                  />
                  <span className="text-xs text-secondary-600">Keep me signed in</span>
                </label>
                <Link
                  href="/contact"
                  className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                >
                  Need help?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
              >
                {!isLoading && (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-600">
              Don&apos;t have an account yet?{' '}
              <Link
                href="/signup"
                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                Create free account
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-secondary-400">
          5 free audio scans daily • No credit card needed
        </div>
      </div>
    </div>
  );
}
