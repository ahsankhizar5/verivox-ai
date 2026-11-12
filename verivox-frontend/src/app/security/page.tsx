import React from 'react';
import { Navbar, Footer } from '@/components/layout';
import { Badge } from '@/components/ui';
import { Shield, Lock, Server, Trash2, KeyRound } from 'lucide-react';

export default function SecurityPage() {
  const controls = [
    {
      icon: Lock,
      title: 'Encrypted Accounts & Sessions',
      description:
        'All traffic is encrypted over HTTPS. Passwords are protected with bcrypt hashing, and user sessions use secure HTTP only cookies.',
    },
    {
      icon: Server,
      title: 'Private Cloud Audio Storage',
      description:
        'Uploaded audio clips and visual reports are stored in private AWS S3 buckets and accessed only through short lived signed links.',
    },
    {
      icon: KeyRound,
      title: 'Protected AI Engine',
      description:
        'Your browser communicates only with our secure application server, keeping all backend analysis credentials completely private.',
    },
    {
      icon: Trash2,
      title: 'Full Data Deletion Control',
      description:
        'Delete any audio scan record or remove your entire account and stored files at any time from your dashboard settings.',
    },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-white text-secondary-900">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-primary-100 bg-gradient-to-b from-primary-50/70 via-white to-white py-14 sm:py-20">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="max-w-2xl">
              <Badge variant="primary" size="md" className="mb-4">
                Data Security
              </Badge>
              <h1 className="text-4xl sm:text-5xl font-bold text-secondary-950 tracking-tight mb-4">
                Built to keep your audio recordings private and secure
              </h1>
              <p className="text-base sm:text-lg text-secondary-600 leading-relaxed">
                How VeriVox protects your uploaded audio files, account credentials, and generated reports.
              </p>
            </div>
          </div>
        </section>

        {/* Controls Grid */}
        <section className="py-16 sm:py-20 bg-white border-b border-secondary-200/70">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {controls.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-7 rounded-2xl bg-secondary-50/60 border border-secondary-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-600 to-emerald-500 text-white flex items-center justify-center mb-5 shadow-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold text-secondary-950 mb-2">
                        {item.title}
                      </h2>
                      <p className="text-sm text-secondary-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Vulnerability Reporting */}
        <section className="py-16 sm:py-20 bg-secondary-50/60">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-[#090d16] to-primary-800 text-white max-w-4xl shadow-lg">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-3">
                <Shield className="w-4 h-4" />
                <span>Security Contact</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Report a security concern
              </h2>
              <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed">
                If you spot a security issue on VeriVox, email our team directly at{' '}
                <a
                  href="mailto:verivoxofficial@gmail.com"
                  className="text-white underline font-semibold"
                >
                  verivoxofficial@gmail.com
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
