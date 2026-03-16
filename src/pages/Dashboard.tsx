import { LayoutDashboard } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Risk overview across all suppliers
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Total Suppliers', 'High Risk', 'Active Scans', 'Violations'].map(
          (title) => (
            <div
              key={title}
              className="bg-card border border-border rounded-lg p-6"
            >
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-3xl font-bold text-foreground mt-2">--</p>
            </div>
          )
        )}
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Supplier Risk Table
        </h2>
        <p className="text-muted-foreground">Coming soon — supplier data will appear here after upload.</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Risk Distribution Chart
        </h2>
        <p className="text-muted-foreground">Coming soon — risk visualization charts.</p>
      </div>
    </div>
  );
}
