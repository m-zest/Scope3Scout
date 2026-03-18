import { motion } from 'framer-motion';
import { FileText, Download, Clock, Lock } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function Reports() {
  return (
    <motion.div
      className="space-y-6 max-w-4xl"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      {/* PDF Report Generator */}
      <motion.div variants={fadeUp} className="surface-elevated rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">PDF Report Generator</h2>
            <p className="text-xs text-muted-foreground">Generate CSRD-compliant PDF reports</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Generate audit-ready PDF reports for individual suppliers or your entire supply chain. Reports include risk assessments, violation evidence, and CSRD compliance scores.
        </p>
        <div className="flex gap-3">
          <button
            disabled
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-sm font-medium cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Generate Report
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 ml-1">COMING SOON</span>
          </button>
        </div>
      </motion.div>

      {/* Report History */}
      <motion.div variants={fadeUp} className="surface-elevated rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Clock className="h-5 w-5 text-slate-400" />
          </div>
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">Report History</h2>
            <p className="text-xs text-muted-foreground">Previously generated reports</p>
          </div>
        </div>
        <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center">
          <Lock className="h-6 w-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No reports generated yet</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
