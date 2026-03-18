import { motion } from 'framer-motion';
import { Bell, BellOff } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Alerts() {
  return (
    <motion.div
      className="space-y-6 max-w-4xl"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      <motion.div variants={fadeUp} className="surface-elevated rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
            <Bell className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">Recent Alerts</h2>
            <p className="text-xs text-muted-foreground">Real-time violation notifications</p>
          </div>
        </div>
        <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center">
          <BellOff className="h-6 w-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-1">No alerts yet</p>
          <p className="text-xs text-muted-foreground">Alerts will appear here when violations are detected during scans.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
