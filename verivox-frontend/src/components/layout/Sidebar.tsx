'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { BrandLogo } from './Navbar';
import {
  LayoutDashboard,
  Upload,
  History,
  FileText,
  Key,
  CreditCard,
  Settings,
  LogOut,
  X,
  Smartphone,
  Puzzle,
} from 'lucide-react';

interface SidebarProps {
  userRole?: 'free' | 'pro' | 'enterprise' | string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/upload', label: 'Live Voice Scanner', icon: Upload },
    { href: '/dashboard/history', label: 'Scan History', icon: History },
    { href: '/dashboard/reports', label: 'PDF Certificates', icon: FileText },
    { href: '/dashboard/api', label: 'Enterprise API & Keys', icon: Key },
    { href: '/dashboard/billing', label: 'Plan & Quotas', icon: CreditCard },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside
      className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-[#0b0a09] text-white
        transform transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col border-r border-white/10
      `}
    >
      {/* Logo & Close Button */}
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center" onClick={handleLinkClick}>
          <BrandLogo darkText={false} />
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-stone-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-white/10 bg-[#141210]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-400 via-amber-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm text-stone-950 shadow-sm">
            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email}
            </p>
            <p className="text-xs font-mono text-amber-300 uppercase tracking-wider">
              {user?.plan || 'Free'} Plan
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={`
                flex items-center gap-3 px-3.5 py-2.5 rounded-xl
                transition-all duration-150 text-sm
                ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-stone-950 font-bold shadow-sm'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white font-medium'
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* APK, Extension & Logout */}
      <div className="p-3.5 border-t border-white/10 space-y-2">
        <a
          href="/VeriVox.apk"
          download="VeriVox.apk"
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs font-semibold transition-colors border border-amber-400/30"
        >
          <Smartphone className="w-4 h-4 text-amber-400" />
          <span>Download Android APK</span>
        </a>
        <a
          href="/VeriVox-Extension.zip"
          download="VeriVox-Extension.zip"
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold transition-colors border border-emerald-400/30"
        >
          <Puzzle className="w-4 h-4 text-emerald-400" />
          <span>Browser Extension (.zip)</span>
        </a>
        <button
          onClick={() => {
            handleLinkClick();
            logout();
          }}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-stone-300 hover:bg-white/10 hover:text-white transition-all duration-150 w-full text-sm"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
