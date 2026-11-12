'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, Button, Badge, Alert, Spinner } from '@/components/ui';
import {
  Download,
  Trash2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Image as ImageIcon,
  Cpu,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import type { AnalysisResult } from '@/types';
import jsPDF from 'jspdf';

export default function ResultDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState('');
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [processingSeconds, setProcessingSeconds] = useState(0);
  const [generatingForensic, setGeneratingForensic] = useState(false);

  useEffect(() => {
    fetchResult();
  }, [params.id]);

  const fetchResult = async () => {
    try {
      const response = await fetch(`/api/results/${params.id}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch result');
      }

      if (data.data.status === 'processing') {
        setProcessing(true);
        setProcessingSeconds((prev) => prev + 5);
        setTimeout(fetchResult, 5000);
      } else if (data.data.status === 'failed') {
        setFailed(true);
        setProcessing(false);
        setError(
          data.data.errorMessage ||
            'Analysis failed. Please try uploading your file again.'
        );
      } else {
        setResult(data.data);
        setProcessing(false);
        setFailed(false);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this result?')) return;

    try {
      const response = await fetch(`/api/results/${params.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete result');
      }

      router.push('/dashboard/history');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDownloadPDF = async () => {
    if (!result) return;

    try {
      setGeneratingPdf(true);

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const m = 18;
      const isSpoof = result.verdict === 'spoofed';
      const accentR = isSpoof ? 220 : 16;
      const accentG = isSpoof ? 38 : 185;
      const accentB = isSpoof ? 38 : 129;

      const loadImgBase64 = async (url: string): Promise<string | null> => {
        try {
          const fetchUrl = url.startsWith('http')
            ? `/api/proxy-image?url=${encodeURIComponent(url)}`
            : url;
          const r = await fetch(fetchUrl);
          if (!r.ok) return null;
          const blob = await r.blob();
          return new Promise((res) => {
            const fr = new FileReader();
            fr.onloadend = () => res(fr.result as string);
            fr.onerror = () => res(null);
            fr.readAsDataURL(blob);
          });
        } catch {
          return null;
        }
      };

      const logoData = await loadImgBase64('/logo.png');

      const addWatermark = async () => {
        if (!logoData) return;
        try {
          doc.setFontSize(60);
          doc.setTextColor(235, 238, 245);
          doc.setFont('helvetica', 'bold');
          doc.text('VERIVOX', W / 2, H / 2, { align: 'center', angle: 45 });
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
        } catch {
          /* skip */
        }
      };

      const addHeader = async () => {
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, W, 30, 'F');

        doc.setFillColor(2, 132, 199);
        doc.rect(0, 30, W, 1.5, 'F');

        if (logoData) {
          try {
            const img = new Image();
            await new Promise<void>((resolve, reject) => {
              img.onload = () => resolve();
              img.onerror = () => reject();
              img.src = logoData;
            });
            const lw = 22,
              lh = lw * (img.height / img.width);
            doc.addImage(
              logoData,
              'PNG',
              m,
              (30 - lh) / 2,
              lw,
              lh,
              undefined,
              'FAST'
            );
          } catch {
            /* skip */
          }
        }

        doc.setFontSize(15);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(7, 25, 54);
        doc.text('VeriVox', W - m, 13, { align: 'right' });

        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(
          'AI Voice Verification Report',
          W - m,
          21,
          { align: 'right' }
        );

        doc.setTextColor(0, 0, 0);
      };

      const addFooter = (pageNum: number, total: number) => {
        doc.setDrawColor(228, 228, 231);
        doc.setLineWidth(0.3);
        doc.line(m, H - 14, W - m, H - 14);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(113, 113, 122);
        doc.text('verivox.studio | verivoxofficial@gmail.com', m, H - 8);
        doc.text(
          `Page ${pageNum} / ${total}  •  Generated ${new Date().toLocaleDateString()}`,
          W - m,
          H - 8,
          { align: 'right' }
        );
        doc.setTextColor(0, 0, 0);
      };

      let yPos = 42;
      const bodyBottom = H - 20;

      const write = async (
        text: string,
        size = 10,
        bold = false,
        color: [number, number, number] = [24, 24, 27],
        indent = 0
      ) => {
        doc.setFontSize(size);
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(text, W - 2 * m - indent);
        const h = lines.length * size * 0.38 + 3;
        if (yPos + h > bodyBottom) {
          doc.addPage();
          await addWatermark();
          await addHeader();
          yPos = 42;
        }
        doc.text(lines, m + indent, yPos);
        yPos += h;
        doc.setTextColor(0, 0, 0);
      };

      const gap = (mm = 4) => {
        yPos += mm;
      };

      await addWatermark();
      await addHeader();
      yPos = 42;

      doc.setFillColor(accentR, accentG, accentB);
      doc.roundedRect(m, yPos, W - 2 * m, 18, 2, 2, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      const confidencePct = (result.confidence * 100).toFixed(2);
      doc.text(
        `${
          isSpoof ? 'DEEPFAKE / SYNTHETIC AUDIO DETECTED' : 'AUTHENTIC HUMAN VOICE'
        }  |  ${confidencePct}% Confidence`,
        m + 6,
        yPos + 11.5
      );
      doc.setTextColor(0, 0, 0);
      yPos += 26;

      const gridH = 28,
        col1 = m,
        col2 = W / 2 + 2;
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(m, yPos, W - 2 * m, gridH, 2, 2, 'F');
      doc.setDrawColor(228, 228, 231);
      doc.setLineWidth(0.3);
      doc.roundedRect(m, yPos, W - 2 * m, gridH, 2, 2, 'S');

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(113, 113, 122);
      doc.text('FILE NAME', col1 + 4, yPos + 6);
      doc.text('ANALYZED', col2, yPos + 6);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(24, 24, 27);
      doc.setFontSize(9);
      doc.text(result.metadata?.fileName || 'Unknown', col1 + 4, yPos + 11);
      doc.text(new Date(result.createdAt).toLocaleString(), col2, yPos + 11);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(113, 113, 122);
      doc.text('FILE SIZE', col1 + 4, yPos + 19);
      doc.text('DURATION', col2, yPos + 19);

      doc.setDrawColor(228, 228, 231);
      doc.line(W / 2, yPos + 2, W / 2, yPos + gridH - 2);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(24, 24, 27);
      doc.setFontSize(9);
      const sizeMB = result.metadata?.fileSize
        ? (result.metadata.fileSize / 1024 / 1024).toFixed(2) + ' MB'
        : 'N/A';
      const dur =
        result.metadata?.duration && result.metadata.duration > 0
          ? result.metadata.duration.toFixed(1) + 's'
          : 'N/A';
      doc.text(sizeMB, col1 + 4, yPos + 24);
      doc.text(dur, col2, yPos + 24);

      yPos += gridH + 6;

      gap(2);
      await write('Confidence Breakdown', 11, true, [24, 24, 27]);
      gap(1);

      const barW = W - 2 * m;
      const barH2 = 7;

      const spoofVal = result.xai.confidenceBreakdown.spoof ?? 0;
      const bfVal = result.xai.confidenceBreakdown.bona_fide ?? 0;

      doc.setFillColor(244, 244, 245);
      doc.roundedRect(m, yPos, barW, barH2, 1.5, 1.5, 'F');
      doc.setFillColor(220, 38, 38);
      doc.roundedRect(m, yPos, barW * spoofVal, barH2, 1.5, 1.5, 'F');
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      if (spoofVal > 0.15)
        doc.text(`Deepfake  ${(spoofVal * 100).toFixed(2)}%`, m + 4, yPos + 5);
      yPos += barH2 + 3;

      doc.setFillColor(244, 244, 245);
      doc.roundedRect(m, yPos, barW, barH2, 1.5, 1.5, 'F');
      doc.setFillColor(16, 185, 129);
      doc.roundedRect(m, yPos, barW * bfVal, barH2, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      if (bfVal > 0.15)
        doc.text(`Authentic  ${(bfVal * 100).toFixed(2)}%`, m + 4, yPos + 5);
      yPos += barH2 + 6;
      doc.setTextColor(0, 0, 0);

      await write('Verification Summary', 11, true, [24, 24, 27]);
      gap(1);
      await write(result.xai.summary, 10, false, [63, 63, 70]);
      gap(3);

      await write('Detailed Findings', 11, true, [24, 24, 27]);
      gap(1);
      await write(
        result.xai.explanation || 'Analysis details not available.',
        10,
        false,
        [63, 63, 70]
      );
      gap(3);

      if (result.xai.importantRegions?.length > 0) {
        await write('Key Frequency Findings', 11, true, [24, 24, 27]);
        gap(1);
        for (let i = 0; i < result.xai.importantRegions.length; i++) {
          const reg = result.xai.importantRegions[i];
          const tagColor: [number, number, number] =
            reg.importance === 'high'
              ? [220, 38, 38]
              : reg.importance === 'medium'
              ? [217, 119, 6]
              : [113, 113, 122];
          await write(
            `[${reg.importance.toUpperCase()}]  ${reg.frequencyRange}`,
            9.5,
            true,
            tagColor
          );
          await write(reg.reason, 9.5, false, [63, 63, 70], 4);
          gap(2);
        }
      }

      if (result.visuals.spectrogramUrl) {
        doc.addPage();
        await addWatermark();
        await addHeader();
        yPos = 42;

        await write('LIME Visual Attribution Heatmap', 13, true, [24, 24, 27]);
        gap(1);
        await write(
          'Highlighted time segments indicate regions with stronger synthetic voice signals.',
          9,
          false,
          [113, 113, 122]
        );
        gap(3);

        const imgData = await loadImgBase64(result.visuals.spectrogramUrl);
        if (imgData) {
          const imgW = W - 2 * m;
          const imgH = (imgW * 9) / 16;
          if (yPos + imgH > bodyBottom) {
            doc.addPage();
            await addWatermark();
            await addHeader();
            yPos = 42;
          }
          try {
            doc.addImage(imgData, 'PNG', m, yPos, imgW, imgH);
            yPos += imgH + 6;
          } catch {
            await write('[LIME graph image unavailable]', 9.5);
          }
        } else {
          await write('[LIME graph image unavailable]', 9.5);
        }
      }

      const total = doc.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        addFooter(i, total);
      }

      doc.save(
        `verivox-report-${result.metadata?.fileName || 'analysis'}-${Date.now()}.pdf`
      );
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleGenerateForensic = async () => {
    try {
      setGeneratingForensic(true);
      const response = await fetch(`/api/results/${params.id}/analyze`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || 'Failed to start visual analysis');
      await fetchResult();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setGeneratingForensic(false);
    }
  };

  if (loading || processing) {
    const estSeconds = processingSeconds;
    const mins = Math.floor(estSeconds / 60);
    const secs = estSeconds % 60;
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <Card variant="default">
            <CardContent padding="xl">
              <div className="text-center py-12">
                <Spinner size="lg" className="mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  {processing
                    ? 'Scanning Audio with VeriVox AI...'
                    : 'Loading Verification Report...'}
                </h3>
                <p className="text-sm text-stone-300 mb-2">
                  {processing
                    ? 'Evaluating voice authenticity across active speech windows.'
                    : 'Loading scan details'}
                </p>
                {processing && estSeconds > 0 && (
                  <p className="font-mono text-xs text-stone-400 mt-2">
                    ELAPSED: {timeStr}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <Alert variant="danger" className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-5 h-5" />
              Scan Failed
            </div>
            <div className="text-sm">
              {error.includes('<!DOCTYPE html>') || error.includes('<html') ? (
                <p>
                  The AI analysis service encountered a temporary error. Please ensure your file is a valid audio format and try again.
                </p>
              ) : (
                <p>{error}</p>
              )}
            </div>
          </Alert>
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/history')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Scan History
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const isSpoof = result.verdict === 'spoofed';
  const confidencePercent = Math.round(result.confidence * 100);
  const isUncertain = result.isUncertain;

  return (
    <div className="min-h-[100dvh] bg-[#0b0a09]">
      {/* Dossier Header */}
      <div className="bg-[#141210] border-b border-white/10">
        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
          <Link
            href="/dashboard/history"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-amber-400 hover:text-primary-800 mb-4 transition-colors font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Scan History
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl border flex-shrink-0 ${
                  isUncertain
                    ? 'bg-warning-50 border-warning-200 text-warning-600'
                    : isSpoof
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                }`}
              >
                {isUncertain ? (
                  <AlertTriangle className="w-7 h-7" />
                ) : isSpoof ? (
                  <XCircle className="w-7 h-7" />
                ) : (
                  <CheckCircle className="w-7 h-7" />
                )}
              </div>
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1">
                  SCAN REPORT #{params.id.slice(-8).toUpperCase()}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-1.5">
                  {isUncertain
                    ? 'Inconclusive / Borderline Audio'
                    : isSpoof
                    ? 'Deepfake / Synthetic Voice Detected'
                    : 'Authentic Human Voice'}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge
                    variant={
                      isUncertain ? 'warning' : isSpoof ? 'danger' : 'success'
                    }
                    size="md"
                  >
                    {confidencePercent}% CONFIDENCE
                  </Badge>
                  <span className="font-mono text-xs text-stone-400">
                    Scanned {new Date(result.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={handleDownloadPDF}
                disabled={generatingPdf}
              >
                <Download className="w-4 h-4" />
                {generatingPdf ? 'Building PDF...' : 'Download PDF Report'}
              </Button>
              <Button variant="outline" size="md" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 text-rose-400" />
                Delete Scan
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Uncertainty Guardrail Warning */}
        {isUncertain && result.warning && (
          <Alert variant="warning">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-sm mb-1">
                  Borderline Confidence Notice
                </div>
                <p className="text-xs sm:text-sm leading-relaxed">
                  {result.warning}
                </p>
              </div>
            </div>
          </Alert>
        )}

        {/* File Telemetry Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#141210] border border-white/10">
            <div className="font-mono text-[11px] uppercase tracking-wider text-stone-400 mb-1">
              FILE NAME
            </div>
            <div className="font-mono text-sm font-semibold text-white break-all">
              {result.metadata?.fileName || 'Unknown'}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#141210] border border-white/10">
            <div className="font-mono text-[11px] uppercase tracking-wider text-stone-400 mb-1">
              FILE SIZE
            </div>
            <div className="font-mono text-sm font-semibold text-white">
              {result.metadata?.fileSize
                ? (result.metadata.fileSize / 1024 / 1024).toFixed(2)
                : 'N/A'}{' '}
              MB
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#141210] border border-white/10">
            <div className="font-mono text-[11px] uppercase tracking-wider text-stone-400 mb-1">
              DURATION
            </div>
            <div className="font-mono text-sm font-semibold text-white">
              {result.metadata?.duration?.toFixed(1) || 'N/A'}s
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#141210] border border-white/10">
            <div className="font-mono text-[11px] uppercase tracking-wider text-stone-400 mb-1">
              AUDIO FORMAT
            </div>
            <div className="font-mono text-sm font-semibold text-amber-300">
              {result.metadata?.fileName?.split('.').pop()?.toUpperCase() ||
                'AUDIO'}{' '}
              • 16 kHz
            </div>
          </div>
        </div>

        {/* Confidence Breakdown & Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Confidence Breakdown */}
          <Card variant="default" padding="lg" className="lg:col-span-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-amber-400 font-semibold">
                  DETECTION SCORES
                </div>
                <h3 className="text-lg font-bold text-white">
                  Probability Breakdown
                </h3>
              </div>
              <Cpu className="w-5 h-5 text-amber-400" />
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30">
                <div className="flex items-center justify-between mb-2 font-mono text-xs">
                  <span className="font-semibold text-rose-200 uppercase">
                    DEEPFAKE (SYNTHETIC / CLONED)
                  </span>
                  <span className="text-lg font-bold text-rose-300">
                    {Math.round(
                      (result.xai.confidenceBreakdown.spoof || 0) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="h-2.5 bg-rose-500/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-danger-600 rounded-full transition-all"
                    style={{
                      width: `${
                        (result.xai.confidenceBreakdown.spoof || 0) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/15/60 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-2 font-mono text-xs">
                  <span className="font-semibold text-success-800 uppercase">
                    AUTHENTIC (REAL HUMAN)
                  </span>
                  <span className="text-lg font-bold text-emerald-300">
                    {Math.round(
                      (result.xai.confidenceBreakdown.bona_fide || 0) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="h-2.5 bg-success-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success-600 rounded-full transition-all"
                    style={{
                      width: `${
                        (result.xai.confidenceBreakdown.bona_fide || 0) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* XAI Summary & Explanation */}
          <Card variant="default" padding="lg" className="lg:col-span-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider text-amber-400 font-semibold">
                    AI EXPLANATION
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Summary &amp; Key Findings
                  </h3>
                </div>
                <Layers className="w-5 h-5 text-amber-400" />
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/15/50 border border-amber-500/20 mb-4">
                <p className="text-sm font-medium text-stone-100">
                  {result.xai.summary}
                </p>
              </div>

              <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-line">
                {result.xai.explanation ||
                  'Click "Generate Visual Heatmap" below to run LIME time-segment analysis and generate a detailed breakdown of this recording.'}
              </p>
            </div>
          </Card>
        </div>

        {/* Visual Analysis Section */}
        <Card variant="default" padding="none" className="overflow-hidden">
          <div className="bg-gradient-to-r from-[#0d111d] to-primary-950 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-500/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-900/80 border border-primary-700 rounded-xl flex items-center justify-center">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="font-mono text-[11px] text-emerald-400 uppercase tracking-wider font-semibold">
                  VISUAL EXPLAINABILITY
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  LIME Time-Segment Heatmap
                </h3>
              </div>
            </div>

            {!result.visuals.spectrogramUrl && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerateForensic}
                disabled={generatingForensic}
              >
                {generatingForensic
                  ? 'Generating Heatmap...'
                  : 'Generate Visual Heatmap'}
              </Button>
            )}
          </div>

          <div className="p-6">
            {result.visuals.spectrogramUrl ? (
              <div className="bg-[#0d111d] rounded-xl flex items-center justify-center overflow-hidden border border-amber-500/30">
                <img
                  src={result.visuals.spectrogramUrl}
                  alt="LIME Analysis Graph"
                  className="w-full h-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent && !parent.querySelector('.error-msg')) {
                      const msg = document.createElement('div');
                      msg.className =
                        'error-msg text-primary-200 font-mono text-xs text-center p-8';
                      msg.textContent = 'LIME attribution graph image unavailable';
                      parent.appendChild(msg);
                    }
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-12 px-4 rounded-xl bg-amber-500/10 border border-dashed border-amber-500/30">
                <p className="font-mono text-xs uppercase tracking-wider text-amber-300 font-semibold mb-2">
                  VISUAL HEATMAP ON DEMAND
                </p>
                <p className="text-sm text-stone-300 max-w-md mx-auto mb-5">
                  Your instant voice scan is complete. Click below to generate a visual time-segment heatmap showing exactly which moments influenced the verdict.
                </p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleGenerateForensic}
                  disabled={generatingForensic}
                >
                  {generatingForensic
                    ? 'Generating Heatmap...'
                    : 'Generate Visual Heatmap'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
