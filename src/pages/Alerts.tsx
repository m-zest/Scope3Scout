import { Bell } from 'lucide-react';

export default function Alerts() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Alerts</h1>
          <p className="text-muted-foreground">
            Real-time violation notifications
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Recent Alerts
        </h2>
        <p className="text-muted-foreground">
          Coming soon — alerts will appear here when violations are detected
          during scans.
        </p>
      </div>
    </div>
  );
}
