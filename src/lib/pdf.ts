// PDF Report Generation
// Uses jsPDF + AutoTable for CSRD compliance reports

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Supplier, Violation, SimulationOutput } from '@/types';

export function generateSupplierReport(
  supplier: Supplier,
  violations: Violation[],
  simulation: SimulationOutput | null
): jsPDF {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text('Scope3Scout - Supplier Risk Report', 14, 22);

  doc.setFontSize(12);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);

  // Supplier info
  doc.setFontSize(16);
  doc.text('Supplier Details', 14, 48);

  autoTable(doc, {
    startY: 52,
    head: [['Field', 'Value']],
    body: [
      ['Name', supplier.name],
      ['Country', supplier.country || 'N/A'],
      ['Industry', supplier.industry || 'N/A'],
      ['Status', supplier.status],
      ['Risk Score', String(supplier.risk_score)],
      ['Risk Level', supplier.risk_level],
    ],
  });

  // Violations table
  if (violations.length > 0) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Violations', 14, 22);

    autoTable(doc, {
      startY: 26,
      head: [['Type', 'Severity', 'Description', 'Fine (EUR)']],
      body: violations.map((v) => [
        v.type,
        v.severity,
        v.description,
        v.fine_amount_eur.toLocaleString(),
      ]),
    });
  }

  // Simulation results
  if (simulation) {
    doc.addPage();
    doc.setFontSize(16);
    doc.text('Risk Simulation Results', 14, 22);

    autoTable(doc, {
      startY: 26,
      head: [['Metric', 'Value']],
      body: [
        ['Risk Score', String(simulation.risk_score)],
        ['Risk Level', simulation.risk_level],
        ['CSRD Compliant', simulation.csrd_compliant ? 'Yes' : 'No'],
        ['Financial Exposure', `EUR ${simulation.financial_exposure_eur.toLocaleString()}`],
        ['Recommended Action', simulation.recommended_action],
      ],
    });
  }

  return doc;
}
