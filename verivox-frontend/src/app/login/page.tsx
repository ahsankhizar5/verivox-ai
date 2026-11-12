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
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address', 'Invalid Email');
      return;
    }

    if (!formData.password) {
      toast.error('Please enter your password', 'Password Required');
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email.trim().toLowerCase(), formData.password);
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

  const handleInstantDemoLogin = async () => {
    setIsDemoLoading(true);
    try {
      await login('demo@verivox.studio', 'VeriVox2026!');
      toast.success('Signed in with Expo Judge Demo Account!', 'Welcome to VeriVox');
    } catch (err: any) {
      toast.error(err.message || 'Demo login failed', 'Login Error');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left Side: Dark Studio Brand Panel */}
      <div className="hidden lg:flex lg:col-span-6 bg-[#0b0a09] text-white flex-col justify-between p-12 xl:p-16 border-r border-stone-800">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo darkText={false} />
          </Link>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300">
            Voice Verification Studio
          </span>
        </div>

        <div className="max-w-lg space-y-7 my-auto py-10">
          <div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-4">
              Verify live speech &amp; AI voice clones in seconds.
            </h1>
            <p className="text-base text-stone-300 leading-relaxed">
              Sign in to record live microphone speech, capture screen audio, inspect LIME explainability heatmaps, and export A4 PDF certificates.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/10">
              <Activity className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-white">
                  Live Mic, Screen &amp; File Scanning
                </div>
                <div className="text-xs text-stone-300 mt-0.5">
                  Verify real human voices vs. AI voice clones, mimicry, and system audio streams.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/10">
              <Layers className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-white">
                  LIME Explainability &amp; PDF Certificates
                </div>
                <div className="text-xs text-stone-300 mt-0.5">
                  See which exact time windows and frequency bands triggered the verdict.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-400 pt-6 border-t border-white/10">
          <span>verivox.studio</span>
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
            className="inline-flex items-center gap-2 text-xs font-semibold text-secondary-600 hover:text-secondary-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link href="/" className="lg:hidden">
            <BrandLogo darkText={true} />
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-secondary-950 tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-sm text-secondary-600">
              Sign in to your VeriVox studio account or use 1-Click Judge Demo Access.
            </p>
          </div>

          {/* 1-Click Judge / Demo Access Button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              disabled={isDemoLoading || isLoading}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-white border border-amber-500/40 hover:border-amber-400 transition-all shadow-md group"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                    Instant Expo &amp; Judge Access
                  </div>
                  <div className="text-xs text-stone-300">
                    1-Click Sign In (demo@verivox.studio)
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="relative flex py-2 items-center mb-5">
            <div className="flex-grow border-t border-secondary-200" />
            <span className="flex-shrink mx-3 text-xs font-mono uppercase text-secondary-400">
              or sign in with email
            </span>
            <div className="flex-grow border-t border-secondary-200" />
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-secondary-200 shadow-soft">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="ahsan@verivox.studio"
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
          50 free audio scans daily • verivox.studio
        </div>
      </div>
    </div>
  );
}
