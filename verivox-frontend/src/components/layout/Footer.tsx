import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './Navbar';
import { Smartphone, ShieldCheck, ArrowUpRight, Puzzle } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#080706] text-stone-400 border-t border-white/10 relative overflow-hidden">
      {/* Main Footer Grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand & Startup Brief Column */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center">
              <BrandLogo darkText={false} />
            </Link>
            <p className="text-sm text-stone-300 max-w-md leading-relaxed">
              VeriVox Studio is an Explainable AI (XAI) audio authenticity and voice forensics platform built to verify live microphone speech, system audio streams, and unseen voice recordings in real time.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>verivox.studio • All XAI Nodes Online</span>
              </div>
              <a
                href="/VeriVox.apk"
                download="VeriVox.apk"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 text-xs font-semibold transition-colors"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android APK</span>
              </a>
              <a
                href="/VeriVox-Extension.zip"
                download="VeriVox-Extension.zip"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-stone-200 text-xs font-semibold transition-colors"
              >
                <Puzzle className="w-3.5 h-3.5 text-amber-300" />
                <span>Browser Extension</span>
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider mb-4">
              Platform
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/#live-scanner" className="hover:text-amber-300 transition-colors">
                  Live Voice Scanner
                </Link>
              </li>
              <li>
                <Link href="/enterprise" className="hover:text-amber-300 transition-colors">
                  Enterprise &amp; API
                </Link>
              </li>
              <li>
                <Link href="/research" className="hover:text-amber-300 transition-colors">
                  Research &amp; XAI
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-amber-300 transition-colors">
                  Plans &amp; Quotas
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Research */}
          <div className="md:col-span-2">
            <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="hover:text-amber-300 transition-colors">
                  About VeriVox
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-amber-300 transition-colors">
                  Security &amp; Privacy
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-amber-300 transition-colors">
                  Join the Team
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-300 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Apps & Legal */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider mb-4">
              Downloads &amp; Legal
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="/VeriVox.apk"
                  download="VeriVox.apk"
                  className="inline-flex items-center gap-1 text-amber-300 hover:text-amber-200 font-medium transition-colors"
                >
                  <span>Direct Android APK Download</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <a
                  href="/VeriVox-Extension.zip"
                  download="VeriVox-Extension.zip"
                  className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200 font-medium transition-colors"
                >
                  <span>Chrome &amp; Edge Extension (.zip)</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-amber-300 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-amber-300 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Brief Sub-bar */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-stone-400">
          <p>
            &copy; {currentYear} VeriVox Studio (verivox.studio). Independent AI Voice Forensics &amp; Acoustic Verification Startup.
          </p>
          <div className="flex items-center gap-4 font-mono">
            <span className="flex items-center gap-1.5 text-stone-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              16 kHz PCM + LIME XAI Engine
            </span>
          </div>
        </div>
      </div>

      {/* Modern Startup Oversized Monument Wordmark & Brief at Very Bottom */}
      <div className="border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.02] pt-6 pb-8 px-4 sm:px-6 lg:px-10 select-none">
        <div className="max-w-[1400px] mx-auto text-center">
          <div className="text-[13vw] sm:text-[11vw] lg:text-[9.5rem] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-amber-200/20 via-white/10 to-white/[0.02]">
            VERIVOX.STUDIO
          </div>
          <p className="text-xs font-mono uppercase tracking-[0.22em] text-stone-400 mt-3">
            REAL-TIME VOICE AUTHENTICITY • EXPLAINABLE AI ATTRIBUTION • BUILT FOR LIVE VERIFICATION
          </p>
        </div>
      </div>
    </footer>
  );
};
