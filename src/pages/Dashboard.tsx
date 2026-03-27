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
import { getDemoSuppliers, type DemoScanResult } from '@/data/demoSuppliers';
import { useSuppliers } from '@/hooks/useSuppliers';
import { cn } from '@/lib/utils';
import { CCTVGrid } from '@/components/dashboard/CCTVGrid';

/* ─── Risk + Status Badge Styles ─── */
const riskBadge: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-500 border border-red-500/20',
  high: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  low: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  unknown: 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20',
};

const statusBadge: Record<string, string> = {
  cleared: 'bg-emerald-500/10 text-emerald-400',
  scanned: 'bg-blue-500/10 text-blue-400',
  flagged: 'bg-red-500/10 text-red-400',
  scanning: 'bg-yellow-500/10 text-yellow-400',
  pending: 'bg-neutral-500/10 text-neutral-400',
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

/* ─── Mini Sparkline SVG ─── */
function MiniSpark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 64;
  const h = 20;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="opacity-30 absolute bottom-3 right-3">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
    </svg>
  );
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <TrendingUp className="h-3 w-3 text-red-400" />;
  if (trend === 'down') return <TrendingDown className="h-3 w-3 text-emerald-400" />;
  return <Minus className="h-3 w-3 text-neutral-600" />;
}

const sparkData = [12, 18, 15, 28, 22, 35, 30, 42, 38, 45, 40, 55];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.07 } },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: dbSuppliers } = useSuppliers();

  const suppliers: DashboardSupplier[] = useMemo(() => {
    const demoList: DashboardSupplier[] = getDemoSuppliers().map((s: DemoScanResult & { id: string }) => ({
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

    const realList: DashboardSupplier[] = (dbSuppliers || []).map((s) => ({
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

    // Read uploaded suppliers from localStorage (demo mode persistence)
    let uploadedList: DashboardSupplier[] = [];
    try {
      const stored = JSON.parse(localStorage.getItem('scope3scout_uploaded_suppliers') || '[]');
      uploadedList = stored.map((s: Record<string, string | number>) => ({
        id: s.id || `uploaded-${Math.random()}`,
        name: s.name || 'Unknown',
        country: (s.country as string) || 'Unknown',
        industry: (s.industry as string) || 'Unknown',
        risk_score: Number(s.risk_score) || 0,
        risk_level: (s.risk_level as string) || 'unknown',
        status: (s.status as string) || 'pending',
        violations_count: 0,
        csrd_compliant: false,
        financial_exposure_eur: 0,
      }));
    } catch { /* ignore parse errors */ }

    return [...uploadedList, ...realList, ...demoList];
  }, [dbSuppliers]);

  const totalSuppliers = suppliers.length;
  const highRisk = suppliers.filter((s) => s.risk_level === 'high' || s.risk_level === 'critical').length;
  const totalViolations = suppliers.reduce((sum, s) => sum + s.violations_count, 0);
  const csrdCompliant = suppliers.filter((s) => s.csrd_compliant).length;
  const totalExposure = suppliers.reduce((sum, s) => sum + s.financial_exposure_eur, 0);

  const stats = [
    { label: 'Total Suppliers', value: totalSuppliers.toString(), icon: Shield, trend: 'flat' as const, iconCls: 'text-[#818cf8]', sparkColor: '#818cf8' },
    { label: 'High / Critical', value: highRisk.toString(), icon: ShieldAlert, trend: highRisk > 0 ? 'up' as const : 'flat' as const, iconCls: 'text-red-400', sparkColor: '#f87171' },
    { label: 'Violations', value: totalViolations.toString(), icon: AlertTriangle, trend: totalViolations > 0 ? 'up' as const : 'flat' as const, iconCls: 'text-orange-400', sparkColor: '#fb923c' },
    { label: 'CSRD Compliant', value: `${csrdCompliant}/${totalSuppliers}`, icon: ShieldCheck, trend: csrdCompliant === totalSuppliers ? 'down' as const : 'up' as const, iconCls: 'text-emerald-400', sparkColor: '#34d399' },
    { label: 'Exposure', value: totalExposure > 0 ? `EUR ${(totalExposure / 1_000_000).toFixed(1)}M` : 'EUR 0', icon: Activity, trend: totalExposure > 0 ? 'up' as const : 'flat' as const, iconCls: 'text-[#c084fc]', sparkColor: '#c084fc' },
  ];

  return (
    <motion.div className="space-y-6 max-w-[1400px]" initial="hidden" animate="visible" variants={stagger}>
      {/* Info banner */}
      <motion.div
        variants={fadeUp}
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#818cf8]/[0.06] border border-[#818cf8]/[0.12] text-sm"
      >
        <Info className="h-4 w-4 text-[#818cf8] shrink-0" />
        <span className="text-[#818cf8]/80">
          {dbSuppliers && dbSuppliers.length > 0 ? (
            <><span className="font-semibold text-[#818cf8]">{dbSuppliers.length} real supplier{dbSuppliers.length !== 1 ? 's' : ''}</span> + 5 demo suppliers shown</>
          ) : (
            <><span className="font-semibold text-[#818cf8]">Demo Data</span> - 5 sample suppliers. Upload your own to see them here</>
          )}
        </span>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="relative bg-white/[0.02] border border-white/[0.05] backdrop-blur-md rounded-2xl p-5 hover:bg-white/[0.04] transition-all duration-300 overflow-hidden group"
          >
            <MiniSpark data={sparkData.map((d) => d + i * 8)} color={stat.sparkColor} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={cn('h-4 w-4', stat.iconCls)} />
                <TrendIcon trend={stat.trend} />
              </div>
              <p className="text-2xl font-heading font-bold text-white tracking-tight">{stat.value}</p>
              <p className="text-[11px] text-neutral-600 mt-1 uppercase tracking-wider font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Risk Distribution Donut Chart */}
        <div className="bg-white/[0.02] border border-white/[0.05] backdrop-blur-md rounded-2xl p-5">
          <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-4">Risk Distribution</h3>
          {(() => {
            const riskCounts = {
              critical: suppliers.filter((s) => s.risk_level === 'critical').length,
              high: suppliers.filter((s) => s.risk_level === 'high').length,
              medium: suppliers.filter((s) => s.risk_level === 'medium').length,
              low: suppliers.filter((s) => s.risk_level === 'low').length,
            };
            const total = riskCounts.critical + riskCounts.high + riskCounts.medium + riskCounts.low || 1;
            const slices = [
              { label: 'Critical', count: riskCounts.critical, color: '#ef4444' },
              { label: 'High', count: riskCounts.high, color: '#f97316' },
              { label: 'Medium', count: riskCounts.medium, color: '#eab308' },
              { label: 'Low', count: riskCounts.low, color: '#10b981' },
            ];
            let cumulative = 0;
            const radius = 50;
            const cx = 60;
            const cy = 60;
            const innerRadius = 30;
            return (
              <div className="flex items-center gap-4">
                <svg width="120" height="120" viewBox="0 0 120 120">
                  {slices.map((slice) => {
                    if (slice.count === 0) return null;
                    const startAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
                    cumulative += slice.count;
                    const endAngle = (cumulative / total) * 2 * Math.PI - Math.PI / 2;
                    const largeArc = slice.count / total > 0.5 ? 1 : 0;
                    const x1 = cx + radius * Math.cos(startAngle);
                    const y1 = cy + radius * Math.sin(startAngle);
                    const x2 = cx + radius * Math.cos(endAngle);
                    const y2 = cy + radius * Math.sin(endAngle);
                    const ix1 = cx + innerRadius * Math.cos(startAngle);
                    const iy1 = cy + innerRadius * Math.sin(startAngle);
                    const ix2 = cx + innerRadius * Math.cos(endAngle);
                    const iy2 = cy + innerRadius * Math.sin(endAngle);
                    const d = slice.count === total
                      ? `M ${cx + radius} ${cy} A ${radius} ${radius} 0 1 1 ${cx + radius - 0.01} ${cy} M ${cx + innerRadius} ${cy} A ${innerRadius} ${innerRadius} 0 1 0 ${cx + innerRadius - 0.01} ${cy}`
                      : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;
                    return <path key={slice.label} d={d} fill={slice.color} opacity={0.8} />;
                  })}
                  <text x={cx} y={cy - 4} textAnchor="middle" className="text-lg font-bold" fill="white" fontSize="18">{total}</text>
                  <text x={cx} y={cy + 12} textAnchor="middle" fill="#737373" fontSize="9">suppliers</text>
                </svg>
                <div className="space-y-2">
                  {slices.map((slice) => (
                    <div key={slice.label} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: slice.color, opacity: 0.8 }} />
                      <span className="text-xs text-neutral-400">{slice.label}</span>
                      <span className="text-xs font-semibold text-neutral-300 ml-auto">{slice.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Violations by Type Horizontal Bar Chart */}
        <div className="bg-white/[0.02] border border-white/[0.05] backdrop-blur-md rounded-2xl p-5">
          <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-4">Violations by Type</h3>
          {(() => {
            const demoData = getDemoSuppliers();
            const allViolations = demoData.flatMap((s) => s.violations);
            const categories = [
              { label: 'Environmental', key: 'environmental', color: '#10b981' },
              { label: 'Labour', key: 'labour', color: '#f97316' },
              { label: 'Legal', key: 'legal', color: '#ef4444' },
              { label: 'Financial', key: 'financial', color: '#8b5cf6' },
            ];
            const counts = categories.map((c) => ({
              ...c,
              count: allViolations.filter((v) => v.type === c.key).length,
            }));
            const maxCount = Math.max(...counts.map((c) => c.count), 1);
            return (
              <div className="space-y-3 mt-2">
                {counts.map((cat) => (
                  <div key={cat.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-neutral-400">{cat.label}</span>
                      <span className="text-xs font-semibold text-neutral-300">{cat.count}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(cat.count / maxCount) * 100}%`, backgroundColor: cat.color, opacity: 0.8, minWidth: cat.count > 0 ? '8px' : '0' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Financial Exposure by Supplier Bar Chart */}
        <div className="bg-white/[0.02] border border-white/[0.05] backdrop-blur-md rounded-2xl p-5">
          <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-4">Financial Exposure by Supplier</h3>
          {(() => {
            const top3 = [...suppliers]
              .filter((s) => s.financial_exposure_eur > 0)
              .sort((a, b) => b.financial_exposure_eur - a.financial_exposure_eur)
              .slice(0, 3);
            const maxExposure = Math.max(...top3.map((s) => s.financial_exposure_eur), 1);
            const barColors = ['#818cf8', '#c084fc', '#e879f9'];
            return (
              <div className="space-y-3 mt-2">
                {top3.length === 0 ? (
                  <p className="text-xs text-neutral-600 text-center py-4">No exposure data</p>
                ) : (
                  top3.map((supplier, i) => (
                    <div key={supplier.id}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-neutral-400 truncate max-w-[140px]">{supplier.name}</span>
                        <span className="text-xs font-semibold text-neutral-300">EUR {(supplier.financial_exposure_eur / 1_000_000).toFixed(1)}M</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(supplier.financial_exposure_eur / maxExposure) * 100}%`, backgroundColor: barColors[i], opacity: 0.8 }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })()}
        </div>
      </motion.div>

      {/* CCTV Agent Grid -Main feature */}
      <motion.div variants={fadeUp}>
        <CCTVGrid />
      </motion.div>

      {/* Supplier Risk Table */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl border border-white/[0.06] bg-black/50 backdrop-blur-xl overflow-hidden"
      >
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/[0.04]">
          <div>
            <h2 className="font-heading text-sm font-semibold text-white tracking-tight">Supplier Risk Table</h2>
            <p className="text-[11px] text-neutral-600 mt-0.5">{suppliers.length} suppliers monitored</p>
          </div>
          <div className="flex gap-2">
            {['critical', 'high', 'low'].map((level) => {
              const count = suppliers.filter((s) => s.risk_level === level).length;
              if (count === 0) return null;
              return (
                <span key={level} className={cn('text-[10px] font-bold px-2 py-1 rounded-lg', riskBadge[level])}>
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
                <tr className="border-b border-white/[0.03]">
                  <th className="text-left px-6 py-3 text-[10px] font-medium text-neutral-600 uppercase tracking-wider">Supplier</th>
                  <th className="text-left px-6 py-3 text-[10px] font-medium text-neutral-600 uppercase tracking-wider">Country</th>
                  <th className="text-left px-6 py-3 text-[10px] font-medium text-neutral-600 uppercase tracking-wider hidden lg:table-cell">Industry</th>
                  <th className="text-center px-6 py-3 text-[10px] font-medium text-neutral-600 uppercase tracking-wider">Risk</th>
                  <th className="text-center px-6 py-3 text-[10px] font-medium text-neutral-600 uppercase tracking-wider">Status</th>
                  <th className="text-center px-6 py-3 text-[10px] font-medium text-neutral-600 uppercase tracking-wider hidden md:table-cell">Violations</th>
                  <th className="text-center px-6 py-3 text-[10px] font-medium text-neutral-600 uppercase tracking-wider hidden md:table-cell">CSRD</th>
                  <th className="text-right px-6 py-3 text-[10px] font-medium text-neutral-600 uppercase tracking-wider hidden lg:table-cell">Exposure</th>
                  <th className="px-4 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {suppliers
                  .sort((a, b) => b.risk_score - a.risk_score)
                  .map((supplier) => (
                    <tr
                      key={supplier.id}
                      className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors cursor-pointer group"
                      onClick={() => navigate(`/supplier/${supplier.id}`)}
                    >
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-neutral-200 text-[13px]">{supplier.name}</p>
                      </td>
                      <td className="px-6 py-3.5 text-neutral-500 text-[13px]">{supplier.country}</td>
                      <td className="px-6 py-3.5 text-neutral-600 text-[13px] hidden lg:table-cell">{supplier.industry}</td>
                      <td className="px-6 py-3.5 text-center">
                        <div className="inline-flex items-center gap-2">
                          <div className="w-10 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                supplier.risk_score >= 60 ? 'bg-red-500' :
                                supplier.risk_score >= 40 ? 'bg-orange-500' :
                                'bg-emerald-500'
                              )}
                              style={{ width: `${supplier.risk_score}%` }}
                            />
                          </div>
                          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md', riskBadge[supplier.risk_level] || riskBadge.unknown)}>
                            {supplier.risk_level.toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-center">
                        <span className={cn('inline-flex px-2.5 py-1 rounded-lg text-[10px] font-semibold', statusBadge[supplier.status] || statusBadge.pending)}>
                          {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-center hidden md:table-cell">
                        {supplier.violations_count > 0 ? (
                          <span className="inline-flex items-center gap-1 text-red-400 font-semibold text-[13px]">
                            <AlertTriangle className="h-3 w-3" />
                            {supplier.violations_count}
                          </span>
                        ) : (
                          <span className="text-emerald-400/60 text-[13px]">0</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-center hidden md:table-cell">
                        {supplier.csrd_compliant ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
                            <ShieldCheck className="h-3.5 w-3.5" />
                          </span>
                        ) : (
                          <span className="text-red-400/60 text-xs font-medium">No</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right text-neutral-500 text-[13px] hidden lg:table-cell">
                        {supplier.financial_exposure_eur > 0 ? `EUR ${supplier.financial_exposure_eur.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <ChevronRight className="h-4 w-4 text-neutral-700 group-hover:text-neutral-400 transition-colors" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <p className="text-neutral-600">No suppliers found. Upload suppliers to begin scanning.</p>
          </div>
        )}
      </motion.div>

      {/* Risk distribution */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['critical', 'high', 'medium', 'low'] as const).map((level) => {
          const count = suppliers.filter((s) => s.risk_level === level).length;
          const pct = totalSuppliers > 0 ? Math.round((count / totalSuppliers) * 100) : 0;
          const colors: Record<string, { bar: string; text: string }> = {
            critical: { bar: 'bg-red-500', text: 'text-red-400' },
            high: { bar: 'bg-orange-500', text: 'text-orange-400' },
            medium: { bar: 'bg-yellow-500', text: 'text-yellow-400' },
            low: { bar: 'bg-emerald-500', text: 'text-emerald-400' },
          };
          return (
            <div key={level} className="bg-white/[0.02] border border-white/[0.05] backdrop-blur-md rounded-2xl p-4 hover:bg-white/[0.04] transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-600">{level}</p>
                <span className={cn('text-[11px] font-bold', colors[level].text)}>{pct}%</span>
              </div>
              <p className={cn('text-2xl font-heading font-bold', colors[level].text)}>{count}</p>
              <div className="w-full h-1 rounded-full bg-white/[0.04] mt-2 overflow-hidden">
                <div className={cn('h-full rounded-full', colors[level].bar)} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[10px] text-neutral-700 mt-1.5">{count === 1 ? 'supplier' : 'suppliers'}</p>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
