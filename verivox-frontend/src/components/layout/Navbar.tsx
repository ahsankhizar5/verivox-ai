'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui';
import { Menu, X, ArrowRight, Smartphone } from 'lucide-react';

export const BrandLogo: React.FC<{ darkText?: boolean }> = ({ darkText = true }) => (
  <div className="inline-flex items-center gap-2.5 select-none">
    <svg
      viewBox="0 0 64 64"
      className="w-9 h-9 flex-shrink-0"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="vv-nav-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#090d16" />
          <stop offset="100%" stopColor="#1b1433" />
        </linearGradient>
        <linearGradient id="vv-nav-wave" x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill="url(#vv-nav-bg)" />
      <rect x="7" y="28" width="4" height="8" rx="2" fill="url(#vv-nav-wave)" />
      <rect x="13" y="22" width="4" height="20" rx="2" fill="url(#vv-nav-wave)" />
      <rect x="19" y="16" width="4" height="32" rx="2" fill="url(#vv-nav-wave)" />
      <rect x="25" y="11" width="4" height="42" rx="2" fill="url(#vv-nav-wave)" />
      <rect x="31" y="6" width="4" height="52" rx="2" fill="url(#vv-nav-wave)" />
      <rect x="37" y="11" width="4" height="42" rx="2" fill="url(#vv-nav-wave)" />
      <rect x="43" y="16" width="4" height="32" rx="2" fill="url(#vv-nav-wave)" />
      <rect x="49" y="22" width="4" height="20" rx="2" fill="url(#vv-nav-wave)" />
      <rect x="55" y="28" width="4" height="8" rx="2" fill="url(#vv-nav-wave)" />
    </svg>
    <span
      className={`text-xl font-extrabold tracking-tight ${
        darkText ? 'text-secondary-950' : 'text-white'
      }`}
    >
      VERI<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-violet-500 to-rose-500">VOX</span>
    </span>
  </div>
);

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-[#090d16]/95 backdrop-blur-md border-b border-white/10 text-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16 sm:h-18">
          <Link href="/" className="flex items-center gap-3 group">
            <BrandLogo darkText={false} />
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <Link
              href="/#live-scanner"
              className="text-sm font-medium text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              Live Mic Scanner
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/security"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Security
            </Link>
            <a
              href="https://github.com/ahsankhizar5/verivox-ai/releases/latest/download/VeriVox.apk"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-violet-200 transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              Android APK
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button variant="primary" size="md">
                  Open Console
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="md" className="text-slate-200 hover:text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="md">
                    Try Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-200 hover:bg-white/10 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-slide-down">
            <div className="flex flex-col gap-1">
              <Link
                href="/#live-scanner"
                className="text-sm font-medium text-emerald-300 px-3 py-2.5 rounded-lg hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Live Mic Scanner
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-slate-200 px-3 py-2.5 rounded-lg hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="/pricing"
                className="text-sm font-medium text-slate-200 px-3 py-2.5 rounded-lg hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/security"
                className="text-sm font-medium text-slate-200 px-3 py-2.5 rounded-lg hover:bg-white/10"
                onClick={() => setMobileMenuOpen(false)}
              >
                Security
              </Link>
              <a
                href="https://github.com/ahsankhizar5/verivox-ai/releases/latest/download/VeriVox.apk"
                className="text-sm font-medium text-violet-300 px-3 py-2.5 rounded-lg hover:bg-white/10 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Download Android APK
              </a>
              <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-white/10">
                {isAuthenticated ? (
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="md" fullWidth>
                      Open Console
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="md" fullWidth className="border-white/20 text-white hover:bg-white/10">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" size="md" fullWidth>
                        Try Free
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
