import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { DEMO_MODE } from '@/lib/tinyfish';
import { getDemoSuppliers, type DemoScanResult } from '@/data/demoSuppliers';
import { useSuppliers } from '@/hooks/useSuppliers';
import { cn } from '@/lib/utils';

const riskColors: Record<string, string> = {
  critical: 'text-red-600 bg-red-50 border-red-200',
  high: 'text-orange-600 bg-orange-50 border-orange-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  low: 'text-green-600 bg-green-50 border-green-200',
  unknown: 'text-gray-500 bg-gray-50 border-gray-200',
};

const riskBadge: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border-red-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-green-100 text-green-700 border-green-300',
  unknown: 'bg-gray-100 text-gray-600 border-gray-300',
};

const statusBadge: Record<string, string> = {
  cleared: 'bg-green-100 text-green-700',
  scanned: 'bg-blue-100 text-blue-700',
  flagged: 'bg-red-100 text-red-700',
  scanning: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-gray-100 text-gray-600',
};

interface DashboardSupplier {
  id: string;
  name: string;
  country: string;
  industry: string;
  risk_score: number;
  risk_level: string;
  status: string;
  violations_count: number;
  csrd_compliant: boolean;
  financial_exposure_eur: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: dbSuppliers } = useSuppliers();

  // Build supplier list from demo data or database
  const suppliers: DashboardSupplier[] = useMemo(() => {
    if (DEMO_MODE) {
      return getDemoSuppliers().map((s: DemoScanResult & { id: string }) => ({
        id: s.id,
        name: s.supplier_name,
        country: s.country,
        industry: s.industry,
        risk_score: s.risk_score,
        risk_level: s.risk_level,
        status: s.status,
        violations_count: s.violations.length,
        csrd_compliant: s.simulation_output.csrd_compliant,
        financial_exposure_eur: s.simulation_output.financial_exposure_eur,
      }));
    }

    return (dbSuppliers || []).map((s) => ({
      id: s.id,
      name: s.name,
      country: s.country || 'Unknown',
      industry: s.industry || 'Unknown',
      risk_score: s.risk_score,
      risk_level: s.risk_level,
      status: s.status,
      violations_count: 0,
      csrd_compliant: false,
      financial_exposure_eur: 0,
    }));
  }, [dbSuppliers]);

  // Stats
  const totalSuppliers = suppliers.length;
  const highRisk = suppliers.filter(
    (s) => s.risk_level === 'high' || s.risk_level === 'critical'
  ).length;
  const totalViolations = suppliers.reduce(
    (sum, s) => sum + s.violations_count,
    0
  );
  const csrdCompliant = suppliers.filter((s) => s.csrd_compliant).length;
  const totalExposure = suppliers.reduce(
    (sum, s) => sum + s.financial_exposure_eur,
    0
  );

  return (
    <div className="space-y-6">
      {/* Demo mode banner */}
      {DEMO_MODE && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg px-4 py-3 flex items-center gap-2 text-amber-800 text-sm">
          <span className="text-base">🎬</span>
          <span className="font-medium">Demo Mode</span>
          <span className="text-amber-700">
            — showing sample data from 5 suppliers across EU supply chain
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <LayoutDashboard className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Risk overview across all suppliers
          </p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Shield className="h-4 w-4" />
            <p className="text-sm">Total Suppliers</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{totalSuppliers}</p>
        </div>

        <div className={cn('rounded-lg p-5 border', highRisk > 0 ? 'bg-red-50 border-red-200' : 'bg-card border-border')}>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <ShieldAlert className="h-4 w-4 text-red-500" />
            <p className="text-sm">High / Critical Risk</p>
          </div>
          <p className={cn('text-3xl font-bold', highRisk > 0 ? 'text-red-600' : 'text-foreground')}>
            {highRisk}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <p className="text-sm">Violations</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{totalViolations}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <ShieldCheck className="h-4 w-4 text-green-500" />
            <p className="text-sm">CSRD Compliant</p>
          </div>
          <p className="text-3xl font-bold text-foreground">
            {csrdCompliant}/{totalSuppliers}
          </p>
        </div>

        <div className={cn('rounded-lg p-5 border', totalExposure > 0 ? 'bg-orange-50 border-orange-200' : 'bg-card border-border')}>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Activity className="h-4 w-4 text-orange-500" />
            <p className="text-sm">Financial Exposure</p>
          </div>
          <p className={cn('text-2xl font-bold', totalExposure > 0 ? 'text-orange-600' : 'text-foreground')}>
            {totalExposure > 0 ? `€${(totalExposure / 1_000_000).toFixed(1)}M` : '€0'}
          </p>
        </div>
      </div>

      {/* Supplier Risk Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="p-6 pb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Supplier Risk Table
          </h2>
        </div>

        {suppliers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-border bg-muted/50">
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground">Supplier</th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground">Country</th>
                  <th className="text-left px-6 py-3 font-medium text-muted-foreground">Industry</th>
                  <th className="text-center px-6 py-3 font-medium text-muted-foreground">Risk Score</th>
                  <th className="text-center px-6 py-3 font-medium text-muted-foreground">Risk Level</th>
                  <th className="text-center px-6 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-center px-6 py-3 font-medium text-muted-foreground">Violations</th>
                  <th className="text-center px-6 py-3 font-medium text-muted-foreground">CSRD</th>
                  <th className="text-right px-6 py-3 font-medium text-muted-foreground">Exposure</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {suppliers
                  .sort((a, b) => b.risk_score - a.risk_score)
                  .map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="border-t border-border hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/supplier/${supplier.id}`)}
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        {supplier.name}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {supplier.country}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {supplier.industry}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          'font-bold',
                          supplier.risk_score >= 60 ? 'text-red-600' :
                          supplier.risk_score >= 40 ? 'text-orange-600' :
                          'text-green-600'
                        )}>
                          {supplier.risk_score}
                        </span>
                        <span className="text-muted-foreground">/100</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          'inline-flex px-2 py-0.5 rounded text-xs font-semibold border',
                          riskBadge[supplier.risk_level] || riskBadge.unknown
                        )}>
                          {supplier.risk_level.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          'inline-flex px-2 py-0.5 rounded text-xs font-medium',
                          statusBadge[supplier.status] || statusBadge.pending
                        )}>
                          {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {supplier.violations_count > 0 ? (
                          <span className="text-red-600 font-semibold">
                            {supplier.violations_count}
                          </span>
                        ) : (
                          <span className="text-green-600">0</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {supplier.csrd_compliant ? (
                          <span className="text-green-600 font-medium">Yes</span>
                        ) : (
                          <span className="text-red-600 font-medium">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground">
                        {supplier.financial_exposure_eur > 0
                          ? `€${supplier.financial_exposure_eur.toLocaleString()}`
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 pb-6">
            <p className="text-muted-foreground">
              No suppliers found. Upload suppliers to begin scanning.
            </p>
          </div>
        )}
      </div>

      {/* Risk summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['critical', 'high', 'medium', 'low'].map((level) => {
          const count = suppliers.filter((s) => s.risk_level === level).length;
          return (
            <div
              key={level}
              className={cn('rounded-lg p-4 border', riskColors[level])}
            >
              <p className="text-sm font-medium">{level.toUpperCase()}</p>
              <p className="text-2xl font-bold mt-1">{count}</p>
              <p className="text-xs mt-1 opacity-75">
                {count === 1 ? 'supplier' : 'suppliers'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
