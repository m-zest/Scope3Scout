// PDF Report Generation - Professional CSRD Compliance Report
// Uses jsPDF + AutoTable with visual risk bars, color coding, and executive layout

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Supplier, Violation, SimulationOutput } from '@/types';

const BRAND_GREEN: [number, number, number] = [34, 87, 60];
const CRITICAL_RED: [number, number, number] = [220, 50, 50];
const HIGH_ORANGE: [number, number, number] = [230, 130, 40];
const MEDIUM_YELLOW: [number, number, number] = [200, 170, 30];
const LOW_GREEN: [number, number, number] = [40, 180, 100];

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
}

function getRiskColor(level: string): readonly [number, number, number] {
  switch (level) {
    case 'critical': return CRITICAL_RED;
    case 'high': return HIGH_ORANGE;
    case 'medium': return MEDIUM_YELLOW;
    default: return LOW_GREEN;
  }
}

function drawRiskBar(doc: jsPDF, x: number, y: number, width: number, height: number, score: number) {
  // Background
  doc.setFillColor(230, 230, 230);
  doc.rect(x, y, width, height, 'F');
  // Filled portion
  const fillWidth = (score / 100) * width;
  const color = score >= 60 ? CRITICAL_RED : score >= 40 ? HIGH_ORANGE : LOW_GREEN;
  doc.setFillColor(...color);
  doc.rect(x, y, fillWidth, height, 'F');
  // Score text
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(`${score}/100`, x + width + 3, y + height - 1);
}

function drawProbabilityBar(doc: jsPDF, x: number, y: number, width: number, height: number, probability: number) {
  doc.setFillColor(230, 230, 230);
  doc.rect(x, y, width, height, 'F');
  const fillWidth = probability * width;
  const color = probability >= 0.7 ? CRITICAL_RED : probability >= 0.4 ? HIGH_ORANGE : LOW_GREEN;
  doc.setFillColor(...color);
  doc.rect(x, y, fillWidth, height, 'F');
}

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const date = formatDate(new Date().toISOString());

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, pageHeight - 25, pageWidth - 14, pageHeight - 25);
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 140);
    doc.text('Scope3Scout - AI-Powered Supply Chain Risk Intelligence', 14, pageHeight - 20);
    doc.text(`Generated: ${date} | Classification: Confidential - For Compliance Use Only`, 14, pageHeight - 16);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 16, { align: 'right' });
    doc.setTextColor(0, 0, 0);
  }
}

export function generateSupplierReport(
  supplier: Supplier,
  violations: Violation[],
  simulation: SimulationOutput | null
): jsPDF {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const generatedDate = formatDate(new Date().toISOString());

  // ══════════════════════════════════════════════════════
  // PAGE 1: COVER & EXECUTIVE SUMMARY
  // ══════════════════════════════════════════════════════

  // Header banner
  doc.setFillColor(...BRAND_GREEN);
  doc.rect(0, 0, pw, 40, 'F');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('SCOPE3SCOUT', 14, 18);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Supplier Risk & Compliance Report', 14, 27);
  doc.setFontSize(8);
  doc.text(`Generated: ${generatedDate} | CSRD/CSDDD Compliance Audit`, 14, 35);

  // Classification banner
  const riskColor = getRiskColor(supplier.risk_level);
  doc.setFillColor(...riskColor);
  doc.rect(0, 42, pw, 8, 'F');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text(`RISK CLASSIFICATION: ${supplier.risk_level.toUpperCase()} | SCORE: ${supplier.risk_score}/100`, pw / 2, 47.5, { align: 'center' });

  // Supplier Details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Supplier Overview', 14, 62);

  autoTable(doc, {
    startY: 66,
    theme: 'grid',
    headStyles: { fillColor: [...BRAND_GREEN], textColor: [255, 255, 255], fontStyle: 'bold' },
    head: [['Field', 'Value']],
    body: [
      ['Supplier Name', supplier.name],
      ['Country', supplier.country || 'N/A'],
      ['Industry', supplier.industry || 'N/A'],
      ['Website', supplier.website || 'N/A'],
      ['Status', supplier.status.toUpperCase()],
      ['Last Scanned', formatDate(supplier.last_scanned_at)],
    ],
    columnStyles: { 0: { cellWidth: 45, fontStyle: 'bold' } },
    margin: { bottom: 30 },
  });

  // Executive Summary Box
  let y = ((doc as unknown as Record<string, Record<string, number>>).lastAutoTable)?.finalY ?? 120;
  y += 8;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Executive Summary', 14, y);
  y += 6;

  // Risk score bar
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Risk Score:', 14, y + 5);
  drawRiskBar(doc, 50, y + 1, 80, 5, supplier.risk_score);
  y += 12;

  // Key metrics row
  const metrics = [
    { label: 'Risk Level', value: supplier.risk_level.toUpperCase(), color: riskColor },
    { label: 'Violations', value: violations.length.toString(), color: violations.length > 0 ? CRITICAL_RED : LOW_GREEN },
    { label: 'CSRD Compliant', value: simulation?.csrd_compliant ? 'YES' : 'NO', color: simulation?.csrd_compliant ? LOW_GREEN : CRITICAL_RED },
    { label: 'Exposure', value: simulation ? `EUR ${simulation.financial_exposure_eur.toLocaleString()}` : 'N/A', color: (simulation?.financial_exposure_eur ?? 0) > 0 ? CRITICAL_RED : LOW_GREEN },
  ];

  const metricWidth = (pw - 28) / 4;
  metrics.forEach((m, i) => {
    const mx = 14 + i * metricWidth;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(mx, y, metricWidth - 4, 20, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text(m.label, mx + (metricWidth - 4) / 2, y + 6, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...m.color);
    doc.text(m.value, mx + (metricWidth - 4) / 2, y + 15, { align: 'center' });
  });
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  y += 28;

  // Recommended action
  if (simulation?.recommended_action) {
    doc.setFillColor(255, 248, 230);
    doc.setDrawColor(...HIGH_ORANGE);
    doc.roundedRect(14, y, pw - 28, 18, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HIGH_ORANGE);
    doc.text('RECOMMENDED ACTION:', 18, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 60, 20);
    doc.setFontSize(9);
    const actionLines = doc.splitTextToSize(simulation.recommended_action, pw - 40);
    doc.text(actionLines, 18, y + 12);
  }

  // ══════════════════════════════════════════════════════
  // PAGE 2: VIOLATIONS & EVIDENCE
  // ══════════════════════════════════════════════════════

  doc.addPage();
  doc.setFillColor(...BRAND_GREEN);
  doc.rect(0, 0, pw, 12, 'F');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('SCOPE3SCOUT - Supplier Risk & Compliance Report', 14, 8);
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(14);
  doc.text('3. Violations & Evidence Record', 14, 24);

  if (violations.length > 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(`${violations.length} violation(s) detected during autonomous agent scan`, 14, 30);
    doc.setTextColor(0, 0, 0);

    // Violations summary table with severity colors
    const sevColor = (s: string) => s === 'critical' ? [...CRITICAL_RED] : s === 'high' ? [...HIGH_ORANGE] : [...MEDIUM_YELLOW];

    autoTable(doc, {
      startY: 34,
      theme: 'grid',
      headStyles: { fillColor: [...BRAND_GREEN], textColor: [255, 255, 255], fontStyle: 'bold' },
      head: [['#', 'Type', 'Severity', 'Description', 'Fine (EUR)', 'Source']],
      body: violations.map((v, i) => [
        `${i + 1}`,
        v.type.charAt(0).toUpperCase() + v.type.slice(1),
        v.severity.toUpperCase(),
        v.description.length > 80 ? v.description.substring(0, 80) + '...' : v.description,
        v.fine_amount_eur > 0 ? v.fine_amount_eur.toLocaleString() : '-',
        v.source_name || 'Public record',
      ]),
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { cellWidth: 25 },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 22, halign: 'right' },
        5: { cellWidth: 30 },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 2) {
          const severity = (data.cell.raw as string).toLowerCase();
          data.cell.styles.textColor = sevColor(severity) as [number, number, number];
          data.cell.styles.fontStyle = 'bold';
        }
      },
      margin: { bottom: 30 },
    });

    // Evidence details
    let ey = ((doc as unknown as Record<string, Record<string, number>>).lastAutoTable)?.finalY ?? 80;
    ey += 10;

    violations.forEach((v, i) => {
      if (ey > 240) { doc.addPage(); ey = 20; }
      if (v.source_excerpt) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(80, 80, 80);
        doc.text(`Evidence #${i + 1} (${v.source_name || 'Public Record'}):`, 14, ey);
        ey += 4;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        const excerptLines = doc.splitTextToSize(`"${v.source_excerpt}"`, pw - 32);
        doc.text(excerptLines, 18, ey);
        ey += excerptLines.length * 4 + 4;
        if (v.source_url) {
          doc.setTextColor(50, 80, 150);
          doc.setFont('helvetica', 'normal');
          doc.text(v.source_url, 18, ey);
          ey += 6;
        }
      }
    });
  } else {
    doc.setFontSize(10);
    doc.text('No violations found on record for this supplier.', 14, 34);
  }

  // ══════════════════════════════════════════════════════
  // PAGE 3: RISK PREDICTION & ANALYSIS
  // ══════════════════════════════════════════════════════

  if (simulation) {
    doc.addPage();
    doc.setFillColor(...BRAND_GREEN);
    doc.rect(0, 0, pw, 12, 'F');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('SCOPE3SCOUT - Supplier Risk & Compliance Report', 14, 8);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(14);
    doc.text('4. Risk Prediction Analysis', 14, 24);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('AI-powered stakeholder response predictions generated by autonomous agents', 14, 30);
    doc.setTextColor(0, 0, 0);

    // Prediction table with visual probability bars
    if (simulation.predictions && simulation.predictions.length > 0) {
      autoTable(doc, {
        startY: 36,
        theme: 'grid',
        headStyles: { fillColor: [...BRAND_GREEN], textColor: [255, 255, 255], fontStyle: 'bold' },
        head: [['Agent', 'Prediction', 'Probability', 'Timeline']],
        body: simulation.predictions.map((p) => [
          p.agent_type.charAt(0).toUpperCase() + p.agent_type.slice(1),
          p.prediction,
          `${Math.round(p.probability * 100)}%`,
          `${p.timeline_days} days`,
        ]),
        columnStyles: {
          0: { cellWidth: 25, fontStyle: 'bold' },
          2: { cellWidth: 22, halign: 'center' },
          3: { cellWidth: 22, halign: 'center' },
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 2) {
            const pctStr = data.cell.raw as string;
            const pct = parseInt(pctStr) / 100;
            data.cell.styles.textColor = pct >= 0.7 ? [...CRITICAL_RED] as [number, number, number] : pct >= 0.4 ? [...HIGH_ORANGE] as [number, number, number] : [...LOW_GREEN] as [number, number, number];
            data.cell.styles.fontStyle = 'bold';
          }
        },
        margin: { bottom: 30 },
      });

      // Visual probability bars
      let by = ((doc as unknown as Record<string, Record<string, number>>).lastAutoTable)?.finalY ?? 80;
      by += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Probability Distribution', 14, by);
      by += 8;

      simulation.predictions.forEach((p) => {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(`${p.agent_type.charAt(0).toUpperCase() + p.agent_type.slice(1)}:`, 14, by + 4);
        drawProbabilityBar(doc, 50, by, 100, 5, p.probability);
        doc.setTextColor(60, 60, 60);
        doc.text(`${Math.round(p.probability * 100)}% (${p.timeline_days}d)`, 155, by + 4);
        by += 10;
      });

      by += 8;

      // Financial exposure highlight
      if (simulation.financial_exposure_eur > 0) {
        doc.setFillColor(255, 235, 235);
        doc.setDrawColor(...CRITICAL_RED);
        doc.roundedRect(14, by, pw - 28, 20, 2, 2, 'FD');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...CRITICAL_RED);
        doc.text('TOTAL FINANCIAL EXPOSURE', 20, by + 8);
        doc.setFontSize(14);
        doc.text(`EUR ${simulation.financial_exposure_eur.toLocaleString()}`, 20, by + 16);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(150, 80, 80);
        doc.text('Estimated regulatory penalties, contract termination costs, and reputational damage', pw / 2, by + 16, { align: 'center' });
      }
    }

    // CSRD compliance status
    let cy = ((doc as unknown as Record<string, Record<string, number>>).lastAutoTable)?.finalY ?? 120;
    cy = Math.max(cy, 200);
    if (cy > 250) { doc.addPage(); cy = 20; }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('CSRD Compliance Status', 14, cy);
    cy += 6;

    const csrdColor = simulation.csrd_compliant ? LOW_GREEN : CRITICAL_RED;
    doc.setFillColor(...csrdColor);
    doc.roundedRect(14, cy, pw - 28, 12, 2, 2, 'F');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(
      simulation.csrd_compliant
        ? 'COMPLIANT - Supplier meets EU CSRD due diligence requirements'
        : 'NON-COMPLIANT - Immediate action required under EU CSRD Article 29a',
      pw / 2, cy + 8, { align: 'center' }
    );
  }

  // ── Add footer to all pages ──
  addFooter(doc);

  return doc;
}
