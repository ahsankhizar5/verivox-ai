import React from 'react';
import Link from 'next/link';
import { BrandLogo } from './Navbar';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#090d16] text-slate-400 border-t border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
          <div className="md:col-span-5">
            <Link href="/" className="inline-block mb-4">
              <BrandLogo darkText={false} />
            </Link>
            <p className="text-slate-300/80 text-sm leading-relaxed max-w-sm mb-5">
              Real-time AI voice clone, mimicry, screen audio, and deepfake detection software for web and mobile.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MULTI-MODEL ENGINE ONLINE</span>
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-white font-semibold mb-4 text-xs font-mono uppercase tracking-wider">
              Product
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/#live-scanner" className="text-slate-300/80 hover:text-white transition-colors">
                  Live Mic &amp; Screen Scanner
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-slate-300/80 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-slate-300/80 hover:text-white transition-colors">
                  Plans &amp; Pricing
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/ahsankhizar5/verivox-ai/releases/latest/download/VeriVox.apk"
                  className="text-emerald-300 hover:text-emerald-200 transition-colors"
                >
                  Download Android APK
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-white font-semibold mb-4 text-xs font-mono uppercase tracking-wider">
              Company &amp; Legal
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/contact" className="text-slate-300/80 hover:text-white transition-colors">
                  Contact Team
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-300/80 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-300/80 hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <a
                  href="mailto:verivoxofficial@gmail.com"
                  className="font-mono text-xs text-violet-300 hover:text-white transition-colors"
                >
                  verivoxofficial@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© {currentYear} VeriVox. All rights reserved.</p>
          <p className="font-mono">verivox.tech • Web &amp; Android</p>
        </div>
      </div>
    </footer>
  );
};
