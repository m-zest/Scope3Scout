import { FileText } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">
            Generate and download CSRD compliance reports
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          PDF Report Generator
        </h2>
        <p className="text-muted-foreground mb-4">
          Coming soon — generate CSRD-compliant PDF reports for individual
          suppliers or your entire supply chain.
        </p>
        <button
          disabled
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium opacity-50 cursor-not-allowed"
        >
          Generate Report
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Report History
        </h2>
        <p className="text-muted-foreground">Coming soon — previously generated reports.</p>
      </div>
    </div>
  );
}
