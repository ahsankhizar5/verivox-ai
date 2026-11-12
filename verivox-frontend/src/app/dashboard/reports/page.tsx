'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, Badge, Loading } from '@/components/ui';
import { FileText, ArrowRight, Calendar, CheckCircle, XCircle, FileAudio } from 'lucide-react';

export default function ReportsPage() {
  const [detections, setDetections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedDetections();
  }, []);

  const fetchCompletedDetections = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/results?page=1&limit=20', {
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();
      if (response.ok && data?.data?.detections) {
        setDetections(data.data.detections.filter((d: any) => d.status === 'completed'));
      }
    } catch (err) {
      console.error('Failed to load report records:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-secondary-50">
        <Loading text="Loading PDF reports..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200/80">
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-primary-600 font-semibold mb-1">
              <FileText className="w-3.5 h-3.5 text-primary-600" />
              EXPORT ARCHIVE
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-950 tracking-tight">
              PDF Verification Reports
            </h1>
            <p className="text-sm text-secondary-600 mt-0.5">
              Open any verified recording below to download a formatted A4 PDF report with visual heatmaps.
            </p>
          </div>
          <Badge variant="info" size="md">
            INSTANT A4 PDF EXPORT
          </Badge>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:px-8 max-w-6xl mx-auto">
        {detections.length > 0 ? (
          <Card variant="default" padding="none" className="overflow-hidden">
            <div className="px-6 py-3.5 border-b border-secondary-200/80 bg-primary-50/30 flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-secondary-500">
                VERIFIED AUDIO RECORD
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-secondary-500">
                REPORT ACTION
              </span>
            </div>
            <div className="divide-y divide-secondary-200/70">
              {detections.map((item) => {
                const isBonafide = item.result === 'bona_fide';
                const hasXai = Boolean(item.analysis?.explanation || item.analysis?.spectrogramUrl);
                return (
                  <div
                    key={item._id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-primary-50/40 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-4 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${
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
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-sm sm:text-base font-semibold text-secondary-950 truncate">
                            {item.fileName}
                          </h3>
                          <Badge variant={isBonafide ? 'success' : 'danger'} size="sm">
                            {isBonafide ? 'AUTHENTIC' : 'DEEPFAKE'}
                          </Badge>
                          {hasXai && (
                            <Badge variant="info" size="sm">
                              VISUAL HEATMAP READY
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono text-secondary-500 mt-1">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(item.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span>•</span>
                          <span>{(item.confidence * 100).toFixed(2)}% confidence</span>
                          <span>•</span>
                          <span>{(item.fileSize / 1024).toFixed(0)} KB</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pl-14 sm:pl-0 flex-shrink-0">
                      <Link href={`/dashboard/results/${item._id}`}>
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4" />
                          Open &amp; Export PDF
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : (
          <Card variant="default" padding="lg">
            <div className="text-center py-14">
              <div className="w-12 h-12 bg-primary-50 border border-primary-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-secondary-950 mb-1">
                No completed reports yet
              </h3>
              <p className="text-sm text-secondary-600 mb-6 max-w-md mx-auto">
                Scan an audio recording first. Every completed scan automatically unlocks A4 PDF report downloads.
              </p>
              <Link href="/dashboard/upload">
                <Button variant="primary" size="md">
                  <FileAudio className="w-4 h-4" />
                  Scan Audio File
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
