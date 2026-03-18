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
      <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-heading text-base font-semibold text-white">PDF Report Generator</h2>
            <p className="text-xs text-neutral-500">Generate CSRD-compliant PDF reports</p>
          </div>
        </div>
        <p className="text-sm text-neutral-400 mb-4">
          Generate audit-ready PDF reports for individual suppliers or your entire supply chain. Reports include risk assessments, violation evidence, and CSRD compliance scores.
        </p>
        <div className="flex gap-3">
          <button
            disabled
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-neutral-600 text-sm font-medium cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Generate Report
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 ml-1">COMING SOON</span>
          </button>
        </div>
      </motion.div>

      {/* Report History */}
      <motion.div variants={fadeUp} className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            <Clock className="h-5 w-5 text-neutral-500" />
          </div>
          <div>
            <h2 className="font-heading text-base font-semibold text-white">Report History</h2>
            <p className="text-xs text-neutral-500">Previously generated reports</p>
          </div>
        </div>
        <div className="border border-dashed border-white/[0.08] rounded-2xl p-8 text-center">
          <Lock className="h-6 w-6 text-neutral-700 mx-auto mb-2" />
          <p className="text-sm text-neutral-500">No reports generated yet</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
