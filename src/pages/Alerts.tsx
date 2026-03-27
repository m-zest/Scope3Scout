import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
// Demo alerts are always shown as default data

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.06 } },
};

interface AlertItem {
  id: string;
  supplier_id: string;
  supplier_name: string;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  created_at: string;
}

const DEMO_ALERTS: AlertItem[] = [
  {
    id: 'a1',
    supplier_id: 'demo-supplier-1',
    supplier_name: 'SteelCorp GmbH',
    type: 'violation_detected',
    message: 'Critical violation found: Illegal water discharge into Rhine river — €40,000 fine issued by German Federal Environment Agency',
    severity: 'critical',
    read: false,
    created_at: '2026-03-27T09:14:00Z',
  },
  {
    id: 'a2',
    supplier_id: 'demo-supplier-1',
    supplier_name: 'SteelCorp GmbH',
    type: 'greenwashing',
    message: 'Greenwashing detected: Active coal plant contract contradicts published renewable energy commitment in 2024 sustainability report',
    severity: 'high',
    read: false,
    created_at: '2026-03-27T09:14:00Z',
  },
  {
    id: 'a3',
    supplier_id: 'demo-supplier-2',
    supplier_name: 'TextilePro Bangladesh',
    type: 'labour_dispute',
    message: 'Labour dispute: Workers strike over unpaid wages reported — 400+ workers affected at Dhaka facility',
    severity: 'high',
    read: false,
    created_at: '2026-03-26T14:32:00Z',
  },
  {
    id: 'a4',
    supplier_id: 'demo-supplier-3',
    supplier_name: 'PackagingPlus Romania',
    type: 'greenwashing',
    message: 'Energy claim discrepancy: Public procurement records show active coal energy contract despite "100% renewable" claims',
    severity: 'high',
    read: true,
    created_at: '2026-03-25T11:08:00Z',
  },
  {
    id: 'a5',
    supplier_id: 'demo-supplier-1',
    supplier_name: 'SteelCorp GmbH',
    type: 'csrd_risk',
    message: 'CSRD non-compliance risk: Simulation engine predicts 91% probability of regulatory enforcement within 45 days',
    severity: 'critical',
    read: true,
    created_at: '2026-03-25T08:45:00Z',
  },
  {
    id: 'a6',
    supplier_id: 'demo-supplier-4',
    supplier_name: 'ChemBase France',
    type: 'scan_complete',
    message: 'Scan completed: No violations detected. Supplier is CSRD compliant with low risk score (18/100)',
    severity: 'low',
    read: true,
    created_at: '2026-03-24T16:20:00Z',
  },
  {
    id: 'a7',
    supplier_id: 'demo-supplier-5',
    supplier_name: 'LogiTrans Hungary',
    type: 'scan_complete',
    message: 'Scan completed: No violations detected. Supplier is fully compliant with risk score 12/100',
    severity: 'low',
    read: true,
    created_at: '2026-03-24T16:18:00Z',
  },
];

const severityStyles: Record<string, { bg: string; border: string; text: string; dot: string; icon: React.ElementType }> = {
  critical: { bg: 'bg-red-500/[0.06]', border: 'border-red-500/20', text: 'text-red-400', dot: 'bg-red-500', icon: ShieldAlert },
  high: { bg: 'bg-orange-500/[0.06]', border: 'border-orange-500/20', text: 'text-orange-400', dot: 'bg-orange-500', icon: AlertTriangle },
  medium: { bg: 'bg-yellow-500/[0.06]', border: 'border-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-500', icon: Clock },
  low: { bg: 'bg-emerald-500/[0.06]', border: 'border-emerald-500/20', text: 'text-emerald-400', dot: 'bg-emerald-400', icon: CheckCircle2 },
};

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function Alerts() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AlertItem[]>(DEMO_ALERTS);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'high'>('all');

  const filtered = useMemo(() => {
    switch (filter) {
      case 'unread': return alerts.filter((a) => !a.read);
      case 'critical': return alerts.filter((a) => a.severity === 'critical');
      case 'high': return alerts.filter((a) => a.severity === 'high' || a.severity === 'critical');
      default: return alerts;
    }
  }, [alerts, filter]);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const markRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));
  };

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  return (
    <motion.div className="space-y-5 max-w-4xl" initial="hidden" animate="visible" variants={stagger}>
      {/* Header bar */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-5 w-5 text-[#818cf8]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="font-heading text-sm font-semibold text-white tracking-tight">Alerts & Notifications</h2>
            <p className="text-[11px] text-neutral-500">{unreadCount} unread · {alerts.length} total</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#818cf8] hover:bg-[#818cf8]/10 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeUp} className="flex items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-neutral-600" />
        {(['all', 'unread', 'critical', 'high'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filter === f
                ? 'bg-[#818cf8]/15 text-[#818cf8] border border-[#818cf8]/20'
                : 'text-neutral-500 hover:bg-white/[0.04] border border-transparent'
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Alert list */}
      <div className="space-y-2">
        {filtered.map((alert) => {
          const style = severityStyles[alert.severity] || severityStyles.low;
          const IconComp = style.icon;
          return (
            <motion.div
              key={alert.id}
              variants={fadeUp}
              className={cn(
                'rounded-2xl border backdrop-blur-xl p-4 transition-all duration-200 cursor-pointer hover:scale-[1.005]',
                alert.read
                  ? 'bg-white/[0.01] border-white/[0.05]'
                  : cn(style.bg, style.border)
              )}
              onClick={() => {
                markRead(alert.id);
                navigate(`/supplier/${alert.supplier_id}`);
              }}
            >
              <div className="flex items-start gap-3">
                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5', style.bg, 'border', style.border)}>
                  <IconComp className={cn('h-4 w-4', style.text)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {!alert.read && <span className={cn('w-2 h-2 rounded-full shrink-0', style.dot)} />}
                    <span className="text-xs font-semibold text-white">{alert.supplier_name}</span>
                    <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase', style.bg, style.text, 'border', style.border)}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-neutral-600 ml-auto shrink-0">{timeAgo(alert.created_at)}</span>
                  </div>
                  <p className={cn('text-sm leading-relaxed', alert.read ? 'text-neutral-500' : 'text-neutral-300')}>
                    {alert.message}
                  </p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-neutral-700 shrink-0 mt-1" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <motion.div variants={fadeUp} className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
          <Bell className="h-6 w-6 text-neutral-700 mx-auto mb-2" />
          <p className="text-sm text-neutral-500">No alerts match this filter</p>
        </motion.div>
      )}
    </motion.div>
  );
}
