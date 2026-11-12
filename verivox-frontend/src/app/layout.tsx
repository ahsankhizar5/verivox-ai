import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import '@/styles/globals.css';
import { AuthProvider } from '@/lib/auth/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VeriVox | Real-Time AI Voice & Deepfake Audio Detection',
  description:
    'Verify live microphone speech, screen audio, voice mimicry, and AI voice clones in seconds with multi-model acoustic detection.',
  keywords: [
    'deepfake audio detection',
    'AI voice clone detector',
    'real-time voice verification',
    'voice mimicry detection',
    'VeriVox',
  ],
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans bg-secondary-50 text-secondary-900 antialiased selection:bg-violet-500 selection:text-white">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
