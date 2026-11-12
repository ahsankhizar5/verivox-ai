'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  Upload,
  FileAudio,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Activity,
  Sliders,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentDetections, setRecentDetections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    uploadsToday: 0,
    uploadsLimit: 5,
    totalDetections: 0,
    accuracy: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/results?page=1&limit=5', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const detections = data.data.detections || [];
        setRecentDetections(detections);

        const totalDetections = data.data.pagination?.total || detections.length;

        const avgConfidence =
          detections.length > 0
            ? detections.reduce(
                (sum: number, d: any) => sum + (d.confidence || 0),
                0
              ) / detections.length
            : 0;

        setStats({
          uploadsToday: detections.length,
          uploadsLimit: 5,
          totalDetections: totalDetections,
          accuracy: avgConfidence * 100,
        });
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const spoofCount = recentDetections.filter((d) => d.result === 'spoof').length;

  return (
    <div className="min-h-[100dvh] bg-secondary-50">
      {/* Top Console Header */}
      <div className="bg-white border-b border-secondary-200">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="font-mono text-xs text-primary-600 uppercase tracking-wider mb-1 font-semibold">
                WORKSPACE OVERVIEW
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-secondary-950 tracking-tight">
                Welcome back, {user?.firstName || 'Analyst'}
              </h1>
              <p className="text-sm text-secondary-600 mt-0.5">
                Track your daily scan quota and review your latest voice verifications.
              </p>
            </div>
            <Link href="/dashboard/upload">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                <Upload className="w-4 h-4" />
                Scan New Audio
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Quota Card */}
          <Card variant="default" padding="lg" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs uppercase tracking-wider text-secondary-500">
                  DAILY QUOTA
                </span>
                <Badge variant="primary" size="sm">
                  {user?.plan || 'free'}
                </Badge>
              </div>
              <div className="font-mono text-3xl font-bold text-secondary-950 mb-1">
                {stats.uploadsToday}
                <span className="text-lg font-normal text-secondary-400">
                  /{stats.uploadsLimit}
                </span>
              </div>
              <p className="text-xs text-secondary-600">Recent scans logged</p>
            </div>
            <div className="w-full bg-primary-100 rounded-full h-1.5 mt-4 overflow-hidden">
              <div
                className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    (stats.uploadsToday / stats.uploadsLimit) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </Card>

          {/* Total Detections Card */}
          <Card variant="default" padding="lg" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs uppercase tracking-wider text-secondary-500">
                  TOTAL SCANS
                </span>
                <FileAudio className="w-4 h-4 text-primary-600" />
              </div>
              <div className="font-mono text-3xl font-bold text-secondary-950 mb-1">
                {stats.totalDetections}
              </div>
              <p className="text-xs text-secondary-600">
                Total audio recordings verified
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-secondary-100 font-mono text-[11px] text-primary-600">
              Engine: AASIST 16 kHz
            </div>
          </Card>

          {/* Mean Confidence Card */}
          <Card variant="default" padding="lg" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs uppercase tracking-wider text-secondary-500">
                  AVG CONFIDENCE
                </span>
                <Activity className="w-4 h-4 text-primary-600" />
              </div>
              <div className="font-mono text-3xl font-bold text-secondary-950 mb-1">
                {stats.accuracy > 0 ? `${stats.accuracy.toFixed(1)}%` : 'N/A'}
              </div>
              <p className="text-xs text-secondary-600">
                Average score across recent scans
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-secondary-100 font-mono text-[11px] text-secondary-500">
              Multi-Window Scoring
            </div>
          </Card>

          {/* Spoofs Flagged Card */}
          <Card variant="default" padding="lg" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs uppercase tracking-wider text-secondary-500">
                  DEEPFAKES FLAGGED
                </span>
                <ShieldAlert className="w-4 h-4 text-danger-600" />
              </div>
              <div className="font-mono text-3xl font-bold text-secondary-950 mb-1">
                {spoofCount}
              </div>
              <p className="text-xs text-secondary-600">
                Synthetic voice clips in recent feed
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-secondary-100 font-mono text-[11px] text-secondary-500">
              Visual LIME Ready
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <Link href="/dashboard/upload" className="group">
            <Card
              variant="default"
              padding="lg"
              className="h-full hover:border-primary-400 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Upload className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-secondary-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-bold text-secondary-950 mt-4 mb-1">
                Upload & Scan Audio
              </h3>
              <p className="text-xs sm:text-sm text-secondary-600">
                Test WAV, FLAC, or MP3 recordings for AI voice cloning in seconds.
              </p>
            </Card>
          </Link>

          <Link href="/dashboard/history" className="group">
            <Card
              variant="default"
              padding="lg"
              className="h-full hover:border-primary-400 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-200 text-primary-600 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-secondary-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-bold text-secondary-950 mt-4 mb-1">
                Scan History & Reports
              </h3>
              <p className="text-xs sm:text-sm text-secondary-600">
                Review past verdicts, generate visual heatmaps, and download PDF reports.
              </p>
            </Card>
          </Link>

          <Link href="/dashboard/billing" className="group">
            <Card
              variant="default"
              padding="lg"
              className="h-full hover:border-primary-400 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-200 text-primary-600 flex items-center justify-center flex-shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-secondary-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="font-bold text-secondary-950 mt-4 mb-1">
                Plan & Quota
              </h3>
              <p className="text-xs sm:text-sm text-secondary-600">
                Check your daily scan allowance and upcoming Pro features.
              </p>
            </Card>
          </Link>
        </div>

        {/* Recent Detections Table/List */}
        <Card variant="default" padding="none" className="overflow-hidden">
          <div className="px-6 py-4 border-b border-secondary-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-primary-50/30">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-wider text-primary-600 font-semibold">
                RECENT ACTIVITY
              </div>
              <h2 className="text-lg font-bold text-secondary-950">
                Latest Audio Scans
              </h2>
            </div>
            <Link href="/dashboard/history">
              <Button variant="outline" size="sm">
                View All Scans
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-secondary-200">
            {loading ? (
              <div className="py-12 text-center font-mono text-xs text-secondary-500">
                Loading recent scans...
              </div>
            ) : recentDetections.length > 0 ? (
              recentDetections.map((detection) => {
                const isBonafide = detection.result === 'bona_fide';
                return (
                  <Link
                    key={detection._id}
                    href={`/dashboard/results/${detection._id}`}
                    className="block px-6 py-4 hover:bg-primary-50/40 transition-colors group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                            isBonafide
                              ? 'bg-success-50 border-success-200 text-success-600'
                              : 'bg-danger-50 border-danger-200 text-danger-600'
                          }`}
                        >
                          {isBonafide ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <XCircle className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-mono text-sm font-semibold text-secondary-950 truncate group-hover:text-primary-600 transition-colors">
                            {detection.fileName}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-secondary-500 mt-0.5">
                            <span>
                              {new Date(detection.createdAt).toLocaleString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }
                              )}
                            </span>
                            <span>•</span>
                            <span>
                              {((detection.confidence || 0) * 100).toFixed(1)}%
                              confidence
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <Badge
                          variant={isBonafide ? 'success' : 'danger'}
                          size="sm"
                        >
                          {isBonafide ? 'AUTHENTIC' : 'DEEPFAKE DETECTED'}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-secondary-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="py-14 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-200 flex items-center justify-center mx-auto mb-3">
                  <FileAudio className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="text-base font-bold text-secondary-950 mb-1">
                  No audio files scanned yet
                </h3>
                <p className="text-sm text-secondary-600 mb-6 max-w-sm mx-auto">
                  Upload a WAV, FLAC, or MP3 recording to run your first deepfake detection scan.
                </p>
                <Link href="/dashboard/upload">
                  <Button variant="primary" size="md">
                    <Upload className="w-4 h-4" />
                    Scan First Recording
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
