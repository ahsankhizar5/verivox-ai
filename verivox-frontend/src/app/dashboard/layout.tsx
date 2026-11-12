'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout';
import { BrandLogo } from '@/components/layout/Navbar';
import { useAuth } from '@/lib/auth/AuthContext';
import { Spinner } from '@/components/ui';
import { Menu } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const [showContent, setShowContent] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowContent(true);
    }, 1500);

    if (!isLoading) {
      setShowContent(true);
      clearTimeout(timeout);
    }

    return () => clearTimeout(timeout);
  }, [isLoading]);

  if (isLoading && !showContent) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-secondary-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 font-mono text-xs uppercase tracking-wider text-secondary-500">
            Loading Workspace...
          </p>
        </div>
      </div>
    );
  }

  const userRole = user?.role || 'free';

  return (
    <div className="min-h-[100dvh] bg-secondary-50 text-secondary-900">
      <Sidebar
        userRole={userRole as any}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#090d16] text-white border-b border-white/10 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-200"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <BrandLogo darkText={false} />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">
          CONSOLE
        </span>
      </div>

      <main className="lg:ml-64 min-h-[100dvh] pt-16 lg:pt-0">{children}</main>
    </div>
  );
}
