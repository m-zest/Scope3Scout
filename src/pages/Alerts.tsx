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
      <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Bell className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h2 className="font-heading text-base font-semibold text-white">Recent Alerts</h2>
            <p className="text-xs text-neutral-500">Real-time violation notifications</p>
          </div>
        </div>
        <div className="border border-dashed border-white/[0.08] rounded-2xl p-8 text-center">
          <BellOff className="h-6 w-6 text-neutral-700 mx-auto mb-2" />
          <p className="text-sm text-neutral-500 mb-1">No alerts yet</p>
          <p className="text-xs text-neutral-600">Alerts will appear here when violations are detected during scans.</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
