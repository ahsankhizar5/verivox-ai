'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Button, Badge, Loading, Select, Input } from '@/components/ui';
import { FileAudio, Search, Clock, CheckCircle, XCircle, ArrowRight, Activity } from 'lucide-react';

export default function HistoryPage() {
  const [detections, setDetections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDetections();
  }, [page, filter]);

  const fetchDetections = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filter && { result: filter }),
      });

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`/api/results?${params}`, {
        credentials: 'include',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await response.json();

      if (response.ok) {
        setDetections(data.data.detections);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (err) {
      console.error('Failed to fetch detections:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDetections = detections.filter((detection) =>
    detection.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: detections.length,
    authentic: detections.filter((d) => d.result === 'bona_fide').length,
    spoofs: detections.filter((d) => d.result === 'spoof').length,
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200/80">
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-primary-600 font-semibold mb-1">
              <Activity className="w-3.5 h-3.5 text-primary-600" />
              SCAN ARCHIVE
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary-950 tracking-tight">
              Detection History
            </h1>
            <p className="text-sm text-secondary-600 mt-0.5">
              Review past voice verifications, confidence scores, and downloadable reports.
            </p>
          </div>
          <Link href="/dashboard/upload">
            <Button variant="primary" size="md">
              <FileAudio className="w-4 h-4" />
              New Audio Scan
            </Button>
          </Link>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
        {/* Stats Overview */}
        {!loading && detections.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card variant="default" padding="md">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-secondary-500">
                  SCANS IN VIEW
                </span>
                <div className="w-8 h-8 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center">
                  <FileAudio className="w-4 h-4 text-primary-600" />
                </div>
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-secondary-950 tabular-nums">
                {stats.total}
              </div>
              <p className="text-xs text-secondary-500 mt-1">Records loaded on this page</p>
            </Card>

            <Card variant="default" padding="md">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-secondary-500">
                  AUTHENTIC (HUMAN)
                </span>
                <div className="w-8 h-8 rounded-lg bg-success-50 border border-success-200 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-success-600" />
                </div>
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-success-700 tabular-nums">
                {stats.authentic}
              </div>
              <p className="text-xs text-secondary-500 mt-1">Verified real human recordings</p>
            </Card>

            <Card variant="default" padding="md">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-secondary-500">
                  DEEPFAKES FLAGGED
                </span>
                <div className="w-8 h-8 rounded-lg bg-danger-50 border border-danger-200 flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-danger-600" />
                </div>
              </div>
              <div className="font-mono text-2xl sm:text-3xl font-bold text-danger-700 tabular-nums">
                {stats.spoofs}
              </div>
              <p className="text-xs text-secondary-500 mt-1">Flagged synthetic or cloned audio</p>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card variant="default" padding="md">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by audio filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full md:w-64">
              <Select
                options={[
                  { value: '', label: 'All Verdicts' },
                  { value: 'bona_fide', label: 'Authentic (Human)' },
                  { value: 'spoof', label: 'Deepfake (Synthetic)' },
                ]}
                value={filter}
                onChange={(value) => {
                  setFilter(value);
                  setPage(1);
                }}
                placeholder="Filter by verdict"
              />
            </div>
          </div>
        </Card>

        {/* Results */}
        {loading ? (
          <Card variant="default" padding="lg">
            <div className="flex justify-center py-12">
              <Loading text="Loading scan history..." />
            </div>
          </Card>
        ) : filteredDetections.length > 0 ? (
          <Card variant="default" padding="none" className="overflow-hidden">
            <div className="px-6 py-3.5 border-b border-secondary-200/80 bg-primary-50/30 flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wider text-secondary-500">
                AUDIO RECORDING
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-secondary-500">
                VERDICT &amp; CONFIDENCE
              </span>
            </div>
            <div className="divide-y divide-secondary-200/70">
              {filteredDetections.map((detection) => {
                const isBonafide = detection.result === 'bona_fide';
                return (
                  <Link
                    key={detection._id}
                    href={`/dashboard/results/${detection._id}`}
                    className="block px-6 py-4 hover:bg-primary-50/40 transition-colors group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                          <h3 className="text-sm sm:text-base font-semibold text-secondary-950 truncate group-hover:text-primary-600 transition-colors">
                            {detection.fileName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-secondary-500 mt-1">
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(detection.createdAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            <span>•</span>
                            <span>{(detection.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                            {detection.duration > 0 && (
                              <>
                                <span>•</span>
                                <span>{detection.duration.toFixed(1)}s</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 pl-14 sm:pl-0 flex-shrink-0">
                        <div className="text-left sm:text-right">
                          <Badge variant={isBonafide ? 'success' : 'danger'} size="sm">
                            {isBonafide ? 'AUTHENTIC' : 'DEEPFAKE'}
                          </Badge>
                          <div className="font-mono text-xs text-secondary-600 mt-1 tabular-nums">
                            {(detection.confidence * 100).toFixed(2)}% conf
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-secondary-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>
        ) : (
          <Card variant="default" padding="lg">
            <div className="text-center py-14">
              <div className="w-12 h-12 bg-primary-50 border border-primary-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileAudio className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-lg font-bold text-secondary-950 mb-1">
                No matching scans found
              </h3>
              <p className="text-sm text-secondary-600 mb-6 max-w-md mx-auto">
                {searchTerm || filter
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Upload an audio recording to run your first deepfake detection scan.'}
              </p>
              <Link href="/dashboard/upload">
                <Button variant="primary" size="md">
                  <FileAudio className="w-4 h-4" />
                  Upload Audio File
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Card variant="default" padding="md">
            <div className="flex justify-between items-center gap-2">
              <span className="font-mono text-xs text-secondary-500">
                PAGE {page} OF {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === page ? 'primary' : 'ghost'}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className="min-w-[36px] font-mono"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
