'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Input, Button } from '@/components/ui';
import { BrandLogo } from '@/components/layout/Navbar';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  X,
  Activity,
  Layers,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    return { checks, score };
  };

  const passwordStrength = getPasswordStrength(formData.password);

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

  const handleConfirmPasswordBlur = () => {
    if (
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: 'Passwords do not match',
      }));
    } else {
      setValidationErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: typeof validationErrors = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      toast.error(
        'You must agree to the Terms & Conditions and Privacy Policy',
        'Agreement Required'
      );
      return;
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      toast.error('Please fix the errors in the form', 'Validation Error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      toast.success(
        'Your account has been created successfully!',
        'Welcome to VeriVox'
      );

      await refreshUser();
      window.location.href = '/dashboard';
    } catch (err: any) {
      toast.error(
        err.message || 'An error occurred during signup. Please try again.',
        'Signup Failed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] grid grid-cols-1 lg:grid-cols-12 bg-white">
      {/* Left Side: Dark Slate Brand Panel */}
      <div className="hidden lg:flex lg:col-span-6 bg-gradient-to-br from-[#0b0a09] via-[#161411] to-[#1c1917] text-white flex-col justify-between p-12 xl:p-16">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center">
            <BrandLogo darkText={false} />
          </Link>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">
            Free Starter Plan
          </span>
        </div>

        <div className="max-w-lg space-y-7 my-auto py-10">
          <div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-4">
              Verify live speech &amp; audio clips in seconds.
            </h1>
            <p className="text-base text-slate-300 leading-relaxed">
              Create your free account to record live microphone speech, capture screen audio, and export A4 PDF reports.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xs">
              <Activity className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-white">
                  Real-Time Browser &amp; Mobile Studio
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Record live voice, capture tab audio, or upload WAV, MP3, FLAC, and M4A files.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-white/5 border border-white/15 backdrop-blur-xs">
              <Layers className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-white">
                  Private &amp; Secure Storage
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Your uploaded clips and reports stay private to your workspace and can be deleted anytime.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-white/15">
          <span>verivox.studio</span>
          <span className="flex items-center gap-1.5 text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            No Credit Card Required
          </span>
        </div>
      </div>

      {/* Right Side: Sign Up Form */}
      <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 xl:p-14 bg-secondary-50/40 overflow-y-auto">
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

        <div className="w-full max-w-md mx-auto my-auto py-6">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-secondary-950 tracking-tight mb-1.5">
              Create your free account
            </h2>
            <p className="text-sm text-secondary-600">
              Get instant access to the VeriVox audio detection studio.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-secondary-200 shadow-soft">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  placeholder="Alex"
                  value={formData.firstName}
                  onChange={(e) => {
                    setFormData({ ...formData, firstName: e.target.value });
                    if (validationErrors.firstName) {
                      setValidationErrors((prev) => ({
                        ...prev,
                        firstName: undefined,
                      }));
                    }
                  }}
                  icon={<User className="w-4 h-4" />}
                  error={validationErrors.firstName}
                  required
                />
                <Input
                  label="Last Name"
                  type="text"
                  placeholder="Rivera"
                  value={formData.lastName}
                  onChange={(e) => {
                    setFormData({ ...formData, lastName: e.target.value });
                    if (validationErrors.lastName) {
                      setValidationErrors((prev) => ({
                        ...prev,
                        lastName: undefined,
                      }));
                    }
                  }}
                  icon={<User className="w-4 h-4" />}
                  error={validationErrors.lastName}
                  required
                />
              </div>

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

              <div>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                    if (validationErrors.password) {
                      setValidationErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
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
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  }
                />

                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            level <= passwordStrength.score
                              ? passwordStrength.score <= 2
                                ? 'bg-danger-500'
                                : passwordStrength.score <= 3
                                ? 'bg-warning-500'
                                : 'bg-success-500'
                              : 'bg-secondary-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <div
                        className={`flex items-center gap-1.5 ${
                          passwordStrength.checks.length
                            ? 'text-success-600'
                            : 'text-secondary-400'
                        }`}
                      >
                        {passwordStrength.checks.length ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                        <span>8+ characters</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 ${
                          passwordStrength.checks.uppercase
                            ? 'text-success-600'
                            : 'text-secondary-400'
                        }`}
                      >
                        {passwordStrength.checks.uppercase ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                        <span>Uppercase</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 ${
                          passwordStrength.checks.number
                            ? 'text-success-600'
                            : 'text-secondary-400'
                        }`}
                      >
                        {passwordStrength.checks.number ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                        <span>Number</span>
                      </div>
                      <div
                        className={`flex items-center gap-1.5 ${
                          passwordStrength.checks.special
                            ? 'text-success-600'
                            : 'text-secondary-400'
                        }`}
                      >
                        {passwordStrength.checks.special ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                        <span>Symbol</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  if (validationErrors.confirmPassword) {
                    setValidationErrors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                    }));
                  }
                }}
                onBlur={handleConfirmPasswordBlur}
                icon={<Lock className="w-4 h-4" />}
                error={validationErrors.confirmPassword}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-secondary-400 hover:text-secondary-700 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                }
              />

              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) =>
                      setFormData({ ...formData, agreeToTerms: e.target.checked })
                    }
                    className="w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-600 cursor-pointer mt-0.5"
                    required
                  />
                  <span className="text-xs text-secondary-600 leading-relaxed">
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      className="text-primary-600 font-semibold underline hover:text-primary-700"
                      target="_blank"
                    >
                      Terms of Use
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      className="text-primary-600 font-semibold underline hover:text-primary-700"
                      target="_blank"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
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
                    Create Free Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-secondary-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary-600 font-semibold hover:text-primary-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-secondary-400">
          VeriVox • verivox.studio
        </div>
      </div>
    </div>
  );
}
