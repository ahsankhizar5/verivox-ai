'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui';
import {
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ArrowRight,
  Smartphone,
} from 'lucide-react';

export const BrandLogo: React.FC<{ darkText?: boolean }> = ({ darkText = true }) => (
  <span className="inline-flex items-center gap-2.5 group">
    <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#141210] via-[#1c1917] to-[#292524] border border-amber-400/30 flex items-center justify-center shadow-md relative overflow-hidden">
      <svg
        viewBox="0 0 32 32"
        className="w-5 h-5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="vvGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>
        <rect x="3" y="12" width="3.2" height="8" rx="1.6" fill="url(#vvGrad)" />
        <rect x="8.5" y="7" width="3.2" height="18" rx="1.6" fill="url(#vvGrad)" />
        <rect x="14" y="3.5" width="3.5" height="25" rx="1.75" fill="url(#vvGrad)" />
        <rect x="19.8" y="8" width="3.2" height="16" rx="1.6" fill="url(#vvGrad)" />
        <rect x="25.2" y="11.5" width="3.2" height="9" rx="1.6" fill="url(#vvGrad)" />
      </svg>
    </span>
    <span
      className={`text-lg font-extrabold tracking-tight ${
        darkText ? 'text-secondary-950' : 'text-white'
      }`}
    >
      Veri<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-400">Vox</span>
    </span>
  </span>
);

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/#live-scanner', label: 'Live Scanner' },
    { href: '/research', label: 'Research & XAI' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/security', label: 'Security' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-[#0b0a09]/95 backdrop-blur-md border-b border-white/10 text-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <BrandLogo darkText={false} />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-stone-300 hover:text-amber-300 transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons + Direct APK Download */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/VeriVox.apk"
              download="VeriVox.apk"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-400/30 text-xs font-semibold transition-all"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Android APK</span>
            </a>

            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="!text-stone-200 hover:!bg-white/10">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-3 pl-3 border-l border-white/15">
                  <span className="text-xs font-mono text-stone-300">
                    {user?.firstName || user?.email}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="!bg-transparent !text-stone-200 !border-white/20 hover:!bg-white/10"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="!text-stone-200 hover:!bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-stone-950 hover:brightness-110 transition-all shadow-sm"
                  >
                    Try Free
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-stone-200 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 animate-slide-down">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-stone-200 hover:text-amber-300 transition-colors px-2 py-1.5"
                >
                  {link.label}
                </Link>
              ))}
              <a
                href="/VeriVox.apk"
                download="VeriVox.apk"
                className="flex items-center gap-2 text-sm font-semibold text-amber-300 px-2 py-1.5"
              >
                <Smartphone className="w-4 h-4" />
                Download Android APK (2.3 MB)
              </a>
              <div className="pt-3 border-t border-white/10 flex flex-col space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="md" fullWidth>
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="ghost" size="md" fullWidth onClick={logout}>
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="md" fullWidth>
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
