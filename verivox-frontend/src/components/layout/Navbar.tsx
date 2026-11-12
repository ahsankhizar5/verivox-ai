'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui';
import {
  Menu,
  X,
  User,
  LogOut,
  ArrowRight,
  Smartphone,
  Puzzle,
} from 'lucide-react';

export const BrandLogo: React.FC<{ darkText?: boolean }> = ({ darkText = false }) => (
  <span className="inline-flex items-center gap-2.5 group">
    <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#141210] via-[#1c1917] to-[#292524] border border-amber-400/35 flex items-center justify-center shadow-md relative overflow-hidden">
      <svg
        viewBox="0 0 32 32"
        className="w-5 h-5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="vvGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="55%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <rect x="3" y="12" width="3.2" height="8" rx="1.6" fill="url(#vvGrad)" />
        <rect x="8.5" y="7" width="3.2" height="18" rx="1.6" fill="url(#vvGrad)" />
        <rect x="14" y="3.5" width="3.5" height="25" rx="1.75" fill="url(#vvGrad)" />
        <rect x="19.8" y="8" width="3.2" height="16" rx="1.6" fill="url(#vvGrad)" />
        <rect x="25.3" y="12.5" width="3.2" height="7" rx="1.6" fill="url(#vvGrad)" />
      </svg>
    </span>
    <span
      className={`text-xl font-extrabold tracking-tight ${
        darkText ? 'text-white' : 'text-white'
      }`}
    >
      Veri<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-400">Vox</span>
    </span>
  </span>
);

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/#live-scanner', label: 'Live Scanner' },
    { href: '/enterprise', label: 'Enterprise & API' },
    { href: '/research', label: 'Research & XAI' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/security', label: 'Security' },
    { href: '/contact', label: 'Contact Us' },
  ];

  return (
    <nav className="bg-[#0b0a09]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center">
            <BrandLogo darkText={false} />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-stone-300 hover:text-amber-300 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons + Direct APK & Extension Links */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href="/extension"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 text-xs font-semibold transition-all"
            >
              <Puzzle className="w-3.5 h-3.5" />
              <span>Extension</span>
            </Link>

            <a
              href="/VeriVox-Native-v2.2.apk"
              download="VeriVox-Native-v2.2.apk"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-400/30 text-xs font-semibold transition-all"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android APK</span>
            </a>

            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-stone-200 hover:text-white hover:bg-white/10"
                  >
                    <User className="w-4 h-4" />
                    {user?.firstName || 'Studio'}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-stone-200 hover:text-white hover:bg-white/10"
                  >
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary" size="sm">
                    <span>Start Free</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-stone-200 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-2.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-stone-200 hover:text-amber-300 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="/VeriVox-Native-v2.2.apk"
                download="VeriVox-Native-v2.2.apk"
                className="flex items-center gap-2 text-sm font-semibold text-amber-300 px-2 py-1.5"
              >
                <Smartphone className="w-4 h-4" />
                Download Android APK (2.4 MB)
              </a>
              <Link
                href="/extension"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-semibold text-emerald-300 px-2 py-1.5"
              >
                <Puzzle className="w-4 h-4" />
                Launch Browser Extension
              </Link>
              <div className="pt-3 border-t border-white/10 flex flex-col space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="primary" size="sm" fullWidth>
                        <User className="w-4 h-4" />
                        Open Studio
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="outline" size="sm" fullWidth>
                        Log In
                      </Button>
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="primary" size="sm" fullWidth>
                        Start Free
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
