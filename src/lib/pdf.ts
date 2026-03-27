// PDF Report Generation - Professional CSRD Compliance Report
// Uses jsPDF + AutoTable with visual risk bars, color coding, and executive layout

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Supplier, Violation, SimulationOutput } from '@/types';

// ── Brand & Color Palette ──

const BRAND = {
  darkGreen: [34, 87, 60] as [number, number, number],
  mediumGreen: [46, 125, 80] as [number, number, number],
  lightGreen: [220, 240, 228] as [number, number, number],
  red: [190, 30, 30] as [number, number, number],
  lightRed: [255, 235, 235] as [number, number, number],
  amber: [210, 120, 20] as [number, number, number],
  lightAmber: [255, 245, 225] as [number, number, number],
  darkGray: [50, 50, 55] as [number, number, number],
  mediumGray: [120, 120, 125] as [number, number, number],
  lightGray: [235, 235, 238] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  black: [30, 30, 30] as [number, number, number],
};

const PAGE_MARGIN = 14;
const CONTENT_WIDTH = 182; // 210 - 2*14

// ── Utility Helpers ──

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function severityColor(severity: string): [number, number, number] {
  switch (severity) {
    case 'critical':
      return BRAND.red;
    case 'high':
      return BRAND.amber;
    case 'medium':
      return [180, 160, 40];
    default:
      return BRAND.mediumGreen;
  }
}

function riskBarColor(score: number): [number, number, number] {
  if (score < 40) return BRAND.mediumGreen;
  if (score <= 60) return BRAND.amber;
  return BRAND.red;
}

function getAutoTableFinalY(doc: jsPDF): number {
  return (
    ((doc as unknown as Record<string, Record<string, number>>).lastAutoTable)
      ?.finalY ?? 0
  );
}

/** Add a new page if not enough vertical space remains. Returns usable Y. */
function ensureSpace(doc: jsPDF, currentY: number, needed: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (currentY + needed > pageHeight - 40) {
    doc.addPage();
    return 28;
  }
  return currentY;
}

// ── Footer (applied to every page at the end) ──

function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const retrievedDate = new Date().toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Footer background band
    doc.setFillColor(...BRAND.lightGray);
    doc.rect(0, pageHeight - 28, pageWidth, 28, 'F');

    // Green accent line at top of footer
    doc.setDrawColor(...BRAND.darkGreen);
    doc.setLineWidth(0.6);
    doc.line(PAGE_MARGIN, pageHeight - 28, pageWidth - PAGE_MARGIN, pageHeight - 28);

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...BRAND.mediumGray);
    doc.text(
      'SCOPE3SCOUT  |  CSRD Compliance Report',
      PAGE_MARGIN,
      pageHeight - 21,
    );
    doc.text(
      `Generated: ${retrievedDate}  |  Classification: CONFIDENTIAL \u2014 For Compliance Use Only`,
      PAGE_MARGIN,
      pageHeight - 16,
    );
    doc.text(
      'Disclaimer: This report is auto-generated from publicly available data and AI analysis. It does not constitute legal advice.',
      PAGE_MARGIN,
      pageHeight - 11,
    );
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - PAGE_MARGIN,
      pageHeight - 11,
      { align: 'right' },
    );

    doc.setTextColor(...BRAND.black);
    doc.setLineWidth(0.2);
  }
}

// ── Drawing Primitives ──

/** Section heading with a green left-accent bar */
function drawSectionHeading(doc: jsPDF, y: number, label: string): number {
  doc.setFillColor(...BRAND.darkGreen);
  doc.rect(PAGE_MARGIN, y, 3, 8, 'F');

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND.darkGreen);
  doc.text(label, PAGE_MARGIN + 7, y + 6);
  doc.setTextColor(...BRAND.black);
  doc.setFont('helvetica', 'normal');
  return y + 14;
}

/** Thin horizontal separator */
function drawSeparator(doc: jsPDF, y: number): number {
  doc.setDrawColor(...BRAND.lightGray);
  doc.setLineWidth(0.4);
  doc.line(PAGE_MARGIN, y, PAGE_MARGIN + CONTENT_WIDTH, y);
  return y + 6;
}

/** KPI card (large value on top, small label below) */
function drawKpiCard(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  value: string,
  label: string,
  valueColor: [number, number, number] = BRAND.black,
  bgColor: [number, number, number] = BRAND.white,
) {
  doc.setFillColor(...bgColor);
  doc.roundedRect(x, y, w, h, 2, 2, 'F');

  doc.setDrawColor(...BRAND.lightGray);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 2, 2, 'S');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...valueColor);
  doc.text(value, x + w / 2, y + h / 2 - 1, { align: 'center' });

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BRAND.mediumGray);
  doc.text(label, x + w / 2, y + h / 2 + 7, { align: 'center' });

  doc.setTextColor(...BRAND.black);
  doc.setFont('helvetica', 'normal');
}

/** Horizontal risk score bar (0-100) with zone coloring and tick marks */
function drawRiskBar(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  score: number,
) {
  const clamped = Math.max(0, Math.min(100, score));
  const fillWidth = (clamped / 100) * width;
  const color = riskBarColor(clamped);

  // Track background
  doc.setFillColor(...BRAND.lightGray);
  doc.roundedRect(x, y, width, height, height / 2, height / 2, 'F');

  // Filled portion
  if (fillWidth > 0) {
    doc.setFillColor(...color);
    doc.roundedRect(
      x,
      y,
      Math.max(fillWidth, height),
      height,
      height / 2,
      height / 2,
      'F',
    );
  }

  // Score label inside bar
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND.white);
  if (fillWidth > 20) {
    doc.text(`${clamped}`, x + fillWidth - 4, y + height / 2 + 1.5, {
      align: 'right',
    });
  }

  // Scale labels
  doc.setFontSize(6);
  doc.setTextColor(...BRAND.mediumGray);
  doc.setFont('helvetica', 'normal');
  doc.text('0', x, y + height + 5);
  doc.text('100', x + width, y + height + 5, { align: 'right' });

  // Zone tick marks at 40 and 60
  doc.setDrawColor(...BRAND.mediumGray);
  doc.setLineWidth(0.2);
  const mark40 = x + width * 0.4;
  const mark60 = x + width * 0.6;
  doc.line(mark40, y + height + 1, mark40, y + height + 3);
  doc.line(mark60, y + height + 1, mark60, y + height + 3);
  doc.text('40', mark40, y + height + 7, { align: 'center' });
  doc.text('60', mark60, y + height + 7, { align: 'center' });

  doc.setTextColor(...BRAND.black);
}

/** Text box with colored background and optional left accent stripe */
function drawHighlightBox(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  text: string,
  bgColor: [number, number, number],
  textColor: [number, number, number] = BRAND.black,
  accentColor?: [number, number, number],
): number {
  doc.setFontSize(9);
  const lines = doc.splitTextToSize(text, width - 14);
  const lineHeight = 4.5;
  const boxHeight = lines.length * lineHeight + 10;

  doc.setFillColor(...bgColor);
  doc.roundedRect(x, y, width, boxHeight, 2, 2, 'F');

  if (accentColor) {
    doc.setFillColor(...accentColor);
    doc.rect(x, y, 3, boxHeight, 'F');
  }

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...textColor);
  doc.text(lines, x + 8, y + 7);

  doc.setTextColor(...BRAND.black);
  return y + boxHeight;
}

/** Inline probability bar (filled rectangle) */
function drawProbabilityBar(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  height: number,
  probability: number,
) {
  const pct = Math.max(0, Math.min(1, probability));
  doc.setFillColor(...BRAND.lightGray);
  doc.rect(x, y, width, height, 'F');
  const color =
    pct > 0.7 ? BRAND.red : pct > 0.4 ? BRAND.amber : BRAND.mediumGreen;
  doc.setFillColor(...color);
  doc.rect(x, y, width * pct, height, 'F');
}

// ══════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ══════════════════════════════════════════════════════════════════

export function generateSupplierReport(
  supplier: Supplier,
  violations: Violation[],
  simulation: SimulationOutput | null,
): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const generatedDate = formatDate(new Date().toISOString());

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  PAGE 1 -- Cover / Executive Summary
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Classification banner at very top
  doc.setFillColor(...BRAND.red);
  doc.rect(0, 0, pageWidth, 7, 'F');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND.white);
  doc.text(
    'CONFIDENTIAL  \u2014  FOR COMPLIANCE USE ONLY',
    pageWidth / 2,
    4.8,
    { align: 'center' },
  );

  // Header bar with branding
  doc.setFillColor(...BRAND.darkGreen);
  doc.rect(0, 7, pageWidth, 28, 'F');

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND.white);
  doc.text('SCOPE3SCOUT', PAGE_MARGIN, 23);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 230, 210);
  doc.text('CSRD Supplier Risk & Compliance Report', PAGE_MARGIN, 30);

  doc.setFontSize(8);
  doc.text(`Generated: ${generatedDate}`, pageWidth - PAGE_MARGIN, 30, {
    align: 'right',
  });

  // Supplier identity strip
  let y = 42;
  doc.setFillColor(...BRAND.lightGreen);
  doc.rect(0, y - 4, pageWidth, 18, 'F');

  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND.darkGreen);
  doc.text(supplier.name, PAGE_MARGIN, y + 4);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...BRAND.mediumGray);
  const metaParts = [
    supplier.country || 'Unknown Country',
    supplier.industry || 'Unknown Industry',
    supplier.website || '',
  ].filter(Boolean);
  doc.text(metaParts.join('  |  '), PAGE_MARGIN, y + 10);

  // ── Executive Summary ──
  y = 66;
  y = drawSectionHeading(doc, y, 'Executive Summary');

  // KPI Cards row
  const riskScore = simulation?.risk_score ?? supplier.risk_score;
  const riskLevel = simulation?.risk_level ?? supplier.risk_level;
  const csrdCompliant = simulation?.csrd_compliant ?? false;
  const financialExposure = simulation?.financial_exposure_eur ?? 0;

  const cardW = 42;
  const cardH = 28;
  const cardGap = 4;
  const cardStartX = PAGE_MARGIN;

  drawKpiCard(
    doc,
    cardStartX,
    y,
    cardW,
    cardH,
    `${riskScore}`,
    'RISK SCORE',
    riskBarColor(riskScore),
  );
  drawKpiCard(
    doc,
    cardStartX + cardW + cardGap,
    y,
    cardW,
    cardH,
    riskLevel.toUpperCase(),
    'RISK LEVEL',
    severityColor(riskLevel),
  );
  drawKpiCard(
    doc,
    cardStartX + (cardW + cardGap) * 2,
    y,
    cardW,
    cardH,
    csrdCompliant ? 'PASS' : 'FAIL',
    'CSRD STATUS',
    csrdCompliant ? BRAND.mediumGreen : BRAND.red,
    csrdCompliant ? BRAND.lightGreen : BRAND.lightRed,
  );
  drawKpiCard(
    doc,
    cardStartX + (cardW + cardGap) * 3,
    y,
    cardW + 8,
    cardH,
    `\u20AC ${financialExposure.toLocaleString()}`,
    'FINANCIAL EXPOSURE',
    BRAND.red,
  );

  y += cardH + 12;

  // ── Risk Score Bar ──
  y = drawSectionHeading(doc, y, 'Risk Score Assessment');

  doc.setFontSize(8);
  doc.setTextColor(...BRAND.mediumGray);
  doc.text(
    'Risk score on a 0\u2013100 scale (Green < 40  |  Amber 40\u201360  |  Red > 60)',
    PAGE_MARGIN + 7,
    y,
  );
  y += 6;

  drawRiskBar(doc, PAGE_MARGIN, y, CONTENT_WIDTH, 8, riskScore);
  y += 22;

  // ── Supplier Details Table ──
  y = drawSectionHeading(doc, y, 'Supplier Details');

  autoTable(doc, {
    startY: y,
    theme: 'striped',
    headStyles: {
      fillColor: BRAND.darkGreen,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [245, 250, 247] },
    head: [['Field', 'Value']],
    body: [
      ['Supplier Name', supplier.name],
      ['Country', supplier.country || 'N/A'],
      ['Industry', supplier.industry || 'N/A'],
      ['Website', supplier.website || 'N/A'],
      ['Current Status', supplier.status.toUpperCase()],
      ['Risk Score', `${supplier.risk_score} / 100`],
      ['Risk Level', supplier.risk_level.toUpperCase()],
      ['Last Scanned', formatDate(supplier.last_scanned_at)],
    ],
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 35 },
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  VIOLATIONS & EVIDENCE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  doc.addPage();
  y = 16;

  y = drawSectionHeading(doc, y, 'Violations & Evidence Record');

  if (violations.length === 0) {
    y += 2;
    y = drawHighlightBox(
      doc,
      PAGE_MARGIN,
      y,
      CONTENT_WIDTH,
      'No violations found on record for this supplier.',
      BRAND.lightGreen,
      BRAND.darkGreen,
      BRAND.mediumGreen,
    );
  } else {
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.mediumGray);
    doc.text(
      `${violations.length} violation(s) detected during autonomous agent scan`,
      PAGE_MARGIN + 7,
      y,
    );
    y += 6;

    // Determine worst severity for header color
    const worstSeverity = violations.reduce((worst, v) => {
      const order = ['low', 'medium', 'high', 'critical'];
      return order.indexOf(v.severity) > order.indexOf(worst) ? v.severity : worst;
    }, 'low');

    const headerColor = (sev: string): [number, number, number] => {
      if (sev === 'critical') return BRAND.red;
      if (sev === 'high') return BRAND.amber;
      return BRAND.darkGreen;
    };

    // Summary table
    autoTable(doc, {
      startY: y,
      theme: 'grid',
      headStyles: {
        fillColor: headerColor(worstSeverity),
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: { fontSize: 7.5 },
      head: [['#', 'Type', 'Severity', 'Description', 'Fine (EUR)', 'Date']],
      body: violations.map((v, i) => [
        `${i + 1}`,
        v.type.charAt(0).toUpperCase() + v.type.slice(1),
        v.severity.toUpperCase(),
        v.description.length > 80
          ? v.description.substring(0, 80) + '\u2026'
          : v.description,
        v.fine_amount_eur > 0
          ? `\u20AC ${v.fine_amount_eur.toLocaleString()}`
          : '\u2014',
        formatDate(v.found_at),
      ]),
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 25 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 25, halign: 'right' },
        5: { cellWidth: 28 },
      },
      didParseCell(data) {
        if (data.section === 'body' && data.column.index === 2) {
          const val = String(data.cell.raw).toLowerCase();
          if (val === 'critical') {
            data.cell.styles.textColor = BRAND.red;
            data.cell.styles.fontStyle = 'bold';
          } else if (val === 'high') {
            data.cell.styles.textColor = BRAND.amber;
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 35 },
    });

    y = getAutoTableFinalY(doc) + 10;

    // Detailed evidence per violation
    violations.forEach((v, index) => {
      y = ensureSpace(doc, y, 55);

      // Violation sub-header badge
      const sevCol = severityColor(v.severity);
      doc.setFillColor(...sevCol);
      doc.roundedRect(PAGE_MARGIN, y, CONTENT_WIDTH, 8, 1, 1, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...BRAND.white);
      doc.text(
        `VIOLATION #${index + 1}  \u2014  ${v.type.toUpperCase()}  |  ${v.severity.toUpperCase()}`,
        PAGE_MARGIN + 4,
        y + 5.5,
      );
      doc.setTextColor(...BRAND.black);
      doc.setFont('helvetica', 'normal');
      y += 12;

      // Description
      doc.setFontSize(8);
      const descLines = doc.splitTextToSize(v.description, CONTENT_WIDTH - 10);
      doc.text(descLines, PAGE_MARGIN + 4, y);
      y += descLines.length * 4 + 4;

      // Fine amount
      if (v.fine_amount_eur > 0) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BRAND.red);
        doc.text(
          `Fine: \u20AC ${v.fine_amount_eur.toLocaleString()}`,
          PAGE_MARGIN + 4,
          y,
        );
        doc.setTextColor(...BRAND.black);
        doc.setFont('helvetica', 'normal');
        y += 6;
      }

      // Evidence block
      if (v.source_url || v.source_name || v.source_excerpt) {
        y = ensureSpace(doc, y, 30);

        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BRAND.mediumGray);
        doc.text('EVIDENCE', PAGE_MARGIN + 4, y);
        doc.setFont('helvetica', 'normal');
        y += 4;

        if (v.source_name) {
          doc.text(`Source: ${v.source_name}`, PAGE_MARGIN + 4, y);
          y += 3.5;
        }
        if (v.source_url) {
          doc.setTextColor(40, 80, 160);
          doc.text(`URL: ${v.source_url}`, PAGE_MARGIN + 4, y);
          doc.setTextColor(...BRAND.mediumGray);
          y += 3.5;
        }
        if (v.source_excerpt) {
          const excerpt =
            v.source_excerpt.length > 200
              ? v.source_excerpt.substring(0, 200) + '\u2026'
              : v.source_excerpt;
          doc.setTextColor(...BRAND.darkGray);
          const excerptLines = doc.splitTextToSize(
            `"${excerpt}"`,
            CONTENT_WIDTH - 14,
          );
          doc.text(excerptLines, PAGE_MARGIN + 4, y);
          y += excerptLines.length * 3.5 + 2;
        }
        doc.setTextColor(...BRAND.black);
      }

      y = drawSeparator(doc, y + 4);
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  RISK ASSESSMENT (Simulation)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (simulation) {
    doc.addPage();
    y = 16;

    y = drawSectionHeading(doc, y, 'AI Risk Assessment');

    // ── Financial Exposure callout ──
    const expBg =
      simulation.financial_exposure_eur > 0 ? BRAND.lightRed : BRAND.lightGreen;
    const expAccent =
      simulation.financial_exposure_eur > 0 ? BRAND.red : BRAND.mediumGreen;

    doc.setFillColor(...expBg);
    doc.roundedRect(PAGE_MARGIN, y, CONTENT_WIDTH, 22, 2, 2, 'F');
    doc.setFillColor(...expAccent);
    doc.rect(PAGE_MARGIN, y, 3, 22, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND.mediumGray);
    doc.text('ESTIMATED FINANCIAL EXPOSURE', PAGE_MARGIN + 8, y + 7);
    doc.setFontSize(18);
    doc.setTextColor(...expAccent);
    doc.text(
      `\u20AC ${simulation.financial_exposure_eur.toLocaleString()}`,
      PAGE_MARGIN + 8,
      y + 17,
    );
    doc.setTextColor(...BRAND.black);
    doc.setFont('helvetica', 'normal');
    y += 30;

    // ── Assessment metrics table ──
    autoTable(doc, {
      startY: y,
      theme: 'striped',
      headStyles: {
        fillColor: BRAND.darkGreen,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [245, 250, 247] },
      head: [['Metric', 'Value']],
      body: [
        ['Risk Score', `${simulation.risk_score} / 100`],
        ['Risk Level', simulation.risk_level.toUpperCase()],
        [
          'CSRD Compliant',
          simulation.csrd_compliant ? 'Yes \u2714' : 'No \u2718',
        ],
        ['Assessment Date', formatDate(simulation.simulated_at)],
      ],
      columnStyles: {
        0: { cellWidth: 55, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
      },
      didParseCell(data) {
        if (data.section === 'body') {
          const raw = String(data.cell.raw);
          if (raw.includes('\u2718')) {
            data.cell.styles.textColor = BRAND.red;
            data.cell.styles.fontStyle = 'bold';
          } else if (raw.includes('\u2714')) {
            data.cell.styles.textColor = BRAND.mediumGreen;
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
      margin: { left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 35 },
    });

    y = getAutoTableFinalY(doc) + 12;

    // ── Risk Predictions with probability bars ──
    if (simulation.predictions && simulation.predictions.length > 0) {
      y = ensureSpace(doc, y, 60);
      y = drawSectionHeading(doc, y, 'Risk Predictions by Agent');

      const barX = PAGE_MARGIN + 80;
      const barW = 70;
      const barH = 5;

      // Column headers
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...BRAND.mediumGray);
      doc.text('AGENT', PAGE_MARGIN + 2, y);
      doc.text('ASSESSMENT', PAGE_MARGIN + 32, y);
      doc.text('CONFIDENCE', barX, y);
      doc.text('TIMELINE', PAGE_MARGIN + 158, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...BRAND.black);
      y += 4;

      doc.setDrawColor(...BRAND.lightGray);
      doc.setLineWidth(0.3);
      doc.line(PAGE_MARGIN, y, PAGE_MARGIN + CONTENT_WIDTH, y);
      y += 4;

      simulation.predictions.forEach((p) => {
        y = ensureSpace(doc, y, 16);

        // Agent type
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(
          p.agent_type.charAt(0).toUpperCase() + p.agent_type.slice(1),
          PAGE_MARGIN + 2,
          y,
        );

        // Prediction text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        const predText =
          p.prediction.length > 28
            ? p.prediction.substring(0, 28) + '\u2026'
            : p.prediction;
        doc.text(predText, PAGE_MARGIN + 32, y);

        // Probability bar (filled rectangle)
        drawProbabilityBar(doc, barX, y - 3.5, barW, barH, p.probability);

        // Percentage label
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BRAND.darkGray);
        doc.text(`${Math.round(p.probability * 100)}%`, barX + barW + 3, y);

        // Timeline
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...BRAND.black);
        doc.text(`${p.timeline_days}d`, PAGE_MARGIN + 162, y);

        y += 12;

        // Row separator
        doc.setDrawColor(...BRAND.lightGray);
        doc.setLineWidth(0.15);
        doc.line(PAGE_MARGIN, y, PAGE_MARGIN + CONTENT_WIDTH, y);
        y += 5;
      });

      y += 6;
    }

    // ── Contradiction Findings ──
    // Show violations that have both a source_excerpt (supplier claim) and
    // a description (evidence/finding) as claim-vs-evidence pairs.
    const discrepancies = violations.filter(
      (v) => v.source_excerpt && v.description,
    );
    if (discrepancies.length > 0) {
      y = ensureSpace(doc, y, 50);
      y = drawSectionHeading(doc, y, 'Contradiction Findings');

      doc.setFontSize(7.5);
      doc.setTextColor(...BRAND.mediumGray);
      doc.text(
        'Identified discrepancies between supplier claims and independent evidence.',
        PAGE_MARGIN + 7,
        y,
      );
      y += 6;

      discrepancies.slice(0, 5).forEach((v) => {
        y = ensureSpace(doc, y, 32);

        const claimText = v.source_excerpt
          ? v.source_excerpt.length > 150
            ? v.source_excerpt.substring(0, 150) + '\u2026'
            : v.source_excerpt
          : '';
        const evidenceText =
          v.description.length > 150
            ? v.description.substring(0, 150) + '\u2026'
            : v.description;

        const halfW = CONTENT_WIDTH / 2 - 2;
        const claimLines = doc.splitTextToSize(claimText, halfW - 12);
        const evidenceLines = doc.splitTextToSize(evidenceText, halfW - 12);
        const maxLines = Math.max(claimLines.length, evidenceLines.length);
        const boxH = maxLines * 3.5 + 12;

        // Claim side (amber)
        doc.setFillColor(...BRAND.lightAmber);
        doc.roundedRect(PAGE_MARGIN, y, halfW, boxH, 1.5, 1.5, 'F');
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BRAND.amber);
        doc.text('SUPPLIER CLAIM', PAGE_MARGIN + 4, y + 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...BRAND.darkGray);
        doc.text(claimLines, PAGE_MARGIN + 4, y + 10);

        // Evidence side (red)
        const rightX = PAGE_MARGIN + halfW + 4;
        doc.setFillColor(...BRAND.lightRed);
        doc.roundedRect(rightX, y, halfW, boxH, 1.5, 1.5, 'F');
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BRAND.red);
        doc.text('EVIDENCE FOUND', rightX + 4, y + 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(...BRAND.darkGray);
        doc.text(evidenceLines, rightX + 4, y + 10);

        doc.setTextColor(...BRAND.black);
        y += boxH + 5;
      });
    }

    // ── Recommended Actions ──
    if (simulation.recommended_action) {
      y = ensureSpace(doc, y, 40);
      y = drawSectionHeading(doc, y, 'Recommended Actions');

      y = drawHighlightBox(
        doc,
        PAGE_MARGIN,
        y,
        CONTENT_WIDTH,
        simulation.recommended_action,
        BRAND.lightGreen,
        BRAND.darkGreen,
        BRAND.mediumGreen,
      );
    }
  }

  // ── Apply footer to all pages ──
  addFooter(doc);

  return doc;
}
