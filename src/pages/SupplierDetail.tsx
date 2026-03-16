import { useParams } from 'react-router-dom';
import { Building2 } from 'lucide-react';

export default function SupplierDetail() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Supplier Detail
          </h1>
          <p className="text-muted-foreground">
            Supplier ID: {id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Supplier Information
          </h2>
          <p className="text-muted-foreground">Coming soon — supplier details and risk profile.</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Simulation Predictions
          </h2>
          <p className="text-muted-foreground">Coming soon — Tier 3 simulation results.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Violations History
        </h2>
        <p className="text-muted-foreground">Coming soon — violations table.</p>
      </div>
    </div>
  );
}
