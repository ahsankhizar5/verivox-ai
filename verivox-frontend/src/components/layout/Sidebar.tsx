'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Upload,
  History,
  CreditCard,
  Key,
  Settings,
  LogOut,
  FileText,
  X,
  Smartphone,
} from 'lucide-react';
import { UserRole } from '@/types';
import { useAuth } from '@/lib/auth/AuthContext';
import { BrandLogo } from './Navbar';

interface SidebarProps {
  userRole?: UserRole;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userRole = 'free',
  isOpen = false,
  onClose,
}) => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const userNavItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/upload', label: 'Live & File Scanner', icon: Upload },
    { href: '/dashboard/history', label: 'Scan History', icon: History },
    { href: '/dashboard/reports', label: 'PDF Reports', icon: FileText },
    { href: '/dashboard/billing', label: 'Plan & Quota', icon: CreditCard },
    ...(userRole === 'enterprise'
      ? [{ href: '/dashboard/api', label: 'API Keys', icon: Key }]
      : []),
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`w-64 bg-[#090d16] text-white min-h-[100dvh] fixed left-0 top-0 flex flex-col border-r border-white/10 z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" onClick={handleLinkClick}>
            <BrandLogo darkText={false} />
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-300"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="mb-2 px-3 text-[11px] font-mono uppercase tracking-wider text-slate-400">
            Workspace
          </div>
          <ul className="space-y-1">
            {userNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500/20 via-violet-500/20 to-rose-500/20 text-white font-semibold border border-emerald-400/30 shadow-sm'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-emerald-400' : ''}`} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <a
            href="/VeriVox.apk"
            download="VeriVox.apk"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-300 text-xs font-semibold transition-colors border border-white/10"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Download Android APK</span>
          </a>
          <button
            onClick={() => {
              handleLinkClick();
              logout();
            }}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-150 w-full text-sm"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
