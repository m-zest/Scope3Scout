import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
} from 'lucide-react';
import { DEMO_MODE } from '@/lib/tinyfish';
import { getDemoSuppliers, type DemoScanResult } from '@/data/demoSuppliers';
import { useSuppliers } from '@/hooks/useSuppliers';
import { cn } from '@/lib/utils';

const riskBadge: Record<string, string> = {
  critical: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20',
  high: 'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/20',
  medium: 'bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20',
  low: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  unknown: 'bg-slate-100 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-500/20',
};

const statusBadge: Record<string, string> = {
  cleared: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  scanned: 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400',
  flagged: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-400',
  scanning: 'bg-yellow-100 dark:bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
  pending: 'bg-slate-100 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400',
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

// Mini sparkline SVG component
function Sparkline({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5 text-red-500" />;
  if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />;
  return <Minus className="h-3.5 w-3.5 text-slate-400" />;
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: dbSuppliers } = useSuppliers();

  const useDemo = DEMO_MODE || (!dbSuppliers || dbSuppliers.length === 0);

  const suppliers: DashboardSupplier[] = useMemo(() => {
    if (useDemo) {
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
  }, [useDemo, dbSuppliers]);

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

  const stats = [
    {
      label: 'Total Suppliers',
      value: totalSuppliers.toString(),
      icon: Shield,
      trend: 'flat' as const,
      trendLabel: 'No change',
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
    },
    {
      label: 'High / Critical Risk',
      value: highRisk.toString(),
      icon: ShieldAlert,
      trend: highRisk > 0 ? ('up' as const) : ('flat' as const),
      trendLabel: highRisk > 0 ? `${highRisk} flagged` : 'None flagged',
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-500/10',
    },
    {
      label: 'Violations',
      value: totalViolations.toString(),
      icon: AlertTriangle,
      trend: totalViolations > 0 ? ('up' as const) : ('flat' as const),
      trendLabel: totalViolations > 0 ? 'Active findings' : 'None detected',
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-500/10',
    },
    {
      label: 'CSRD Compliant',
      value: `${csrdCompliant}/${totalSuppliers}`,
      icon: ShieldCheck,
      trend: csrdCompliant === totalSuppliers ? ('down' as const) : ('up' as const),
      trendLabel: csrdCompliant === totalSuppliers ? 'All compliant' : 'Review needed',
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      label: 'Financial Exposure',
      value: totalExposure > 0 ? `EUR ${(totalExposure / 1_000_000).toFixed(1)}M` : 'EUR 0',
      icon: Activity,
      trend: totalExposure > 0 ? ('up' as const) : ('flat' as const),
      trendLabel: totalExposure > 0 ? 'Active exposure' : 'No exposure',
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-500/10',
    },
  ];

  return (
    <motion.div
      className="space-y-6 max-w-[1400px]"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      {/* Demo mode banner */}
      {useDemo && (
        <motion.div
          variants={fadeUp}
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-sm"
        >
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Demo Mode</span> — showing sample data from 5 suppliers across EU supply chain
          </span>
        </motion.div>
      )}

      {/* Stats cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="surface-elevated rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', stat.bgColor)}>
                <stat.icon className={cn('h-4 w-4', stat.iconColor)} />
              </div>
              <Sparkline trend={stat.trend} />
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Supplier Risk Table */}
      <motion.div variants={fadeUp} className="surface-elevated rounded-xl overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">Supplier Risk Table</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{suppliers.length} suppliers monitored</p>
          </div>
          <div className="flex gap-2">
            {['critical', 'high', 'medium', 'low'].map((level) => {
              const count = suppliers.filter((s) => s.risk_level === level).length;
              if (count === 0) return null;
              return (
                <span
                  key={level}
                  className={cn(
                    'text-[10px] font-semibold px-2 py-1 rounded-md border',
                    riskBadge[level]
                  )}
                >
                  {count} {level.toUpperCase()}
                </span>
              );
            })}
          </div>
        </div>

        {suppliers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Supplier</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Country</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Industry</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Risk</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Violations</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">CSRD</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Exposure</th>
                  <th className="px-4 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {suppliers
                  .sort((a, b) => b.risk_score - a.risk_score)
                  .map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/supplier/${supplier.id}`)}
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-foreground">{supplier.name}</p>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {supplier.country}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground hidden lg:table-cell">
                        {supplier.industry}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          {/* Risk score bar */}
                          <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                supplier.risk_score >= 60 ? 'bg-red-500' :
                                supplier.risk_score >= 40 ? 'bg-orange-500' :
                                supplier.risk_score >= 20 ? 'bg-yellow-500' :
                                'bg-emerald-500'
                              )}
                              style={{ width: `${supplier.risk_score}%` }}
                            />
                          </div>
                          <span className={cn(
                            'text-[11px] font-semibold px-2 py-0.5 rounded-md border',
                            riskBadge[supplier.risk_level] || riskBadge.unknown
                          )}>
                            {supplier.risk_level.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={cn(
                          'inline-flex px-2.5 py-1 rounded-md text-[11px] font-medium',
                          statusBadge[supplier.status] || statusBadge.pending
                        )}>
                          {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center hidden md:table-cell">
                        {supplier.violations_count > 0 ? (
                          <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold text-sm">
                            <AlertTriangle className="h-3 w-3" />
                            {supplier.violations_count}
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 text-sm">0</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center hidden md:table-cell">
                        {supplier.csrd_compliant ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Yes
                          </span>
                        ) : (
                          <span className="text-red-600 dark:text-red-400 text-xs font-medium">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-muted-foreground hidden lg:table-cell">
                        {supplier.financial_exposure_eur > 0
                          ? `EUR ${supplier.financial_exposure_eur.toLocaleString()}`
                          : '—'}
                      </td>
                      <td className="px-4 py-4">
                        <ChevronRight className="h-4 w-4 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 transition-colors" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-muted-foreground">
              No suppliers found. Upload suppliers to begin scanning.
            </p>
          </div>
        )}
      </motion.div>

      {/* Risk distribution cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['critical', 'high', 'medium', 'low'] as const).map((level) => {
          const count = suppliers.filter((s) => s.risk_level === level).length;
          const pct = totalSuppliers > 0 ? Math.round((count / totalSuppliers) * 100) : 0;
          const colors: Record<string, { bar: string; text: string }> = {
            critical: { bar: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
            high: { bar: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' },
            medium: { bar: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400' },
            low: { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
          };
          return (
            <div key={level} className="surface-elevated rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{level}</p>
                <span className={cn('text-xs font-semibold', colors[level].text)}>{pct}%</span>
              </div>
              <p className={cn('text-2xl font-heading font-bold', colors[level].text)}>{count}</p>
              <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-slate-800 mt-2 overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', colors[level].bar)}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1.5">{count === 1 ? 'supplier' : 'suppliers'}</p>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
