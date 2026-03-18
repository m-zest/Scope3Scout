import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Search,
  ArrowRight,
  ChevronRight,
  Globe,
  Cpu,
  Eye,
  Bell,
  BarChart3,
  TrendingUp,
  FileText,
  Zap,
  MapPin,
} from 'lucide-react';

/* ─── Animation Variants ─── */
const customEase: [number, number, number, number] = [0.25, 0.4, 0.25, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: customEase } },
};

const fadeUpSlow = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: customEase } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const staggerFast = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Glassmorphic Card Wrapper ─── */
function GlassCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Sparkline SVG ─── */
function SparkLine({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const points = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`
    )
    .join(' ');
  return (
    <svg width={w} height={h} className="opacity-50">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
    </svg>
  );
}

const sparkData = [12, 18, 15, 28, 22, 35, 30, 42, 38, 45, 40, 55];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* ════════════════════════════════════════════════════════════
          NAVIGATION
         ════════════════════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="h-5 w-5 text-cyan-400" />
            <span className="font-heading font-bold text-base tracking-tight">
              Scope3Scout
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-neutral-400">
            <a href="#features" className="hover:text-white transition-colors duration-300">Features</a>
            <a href="#simulation" className="hover:text-white transition-colors duration-300">Simulation</a>
            <a href="#compliance" className="hover:text-white transition-colors duration-300">Compliance</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="text-[13px] text-neutral-300 hover:text-white transition-colors duration-300"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="text-[13px] font-medium bg-cyan-400 hover:bg-cyan-300 text-black px-5 py-2 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/25"
            >
              Request Demo
            </button>
          </div>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════
          HERO SECTION
         ════════════════════════════════════════════════════════════ */}
      <section className="relative pt-40 pb-32 px-6">
        {/* Aurora blurs */}
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-cyan-500/20 rounded-full blur-[160px] mix-blend-screen pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[140px] mix-blend-screen pointer-events-none" />
        <div className="absolute top-40 left-1/2 w-[400px] h-[400px] bg-blue-500/15 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-5xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-8">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300 bg-cyan-400/[0.08] border border-cyan-400/20 rounded-full px-5 py-2">
              <Zap className="h-3 w-3" />
              EU CSRD &amp; CSDDD Compliant
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-heading text-[3.5rem] md:text-[5.5rem] font-bold tracking-tight leading-[1.04] mb-8"
          >
            Find what your
            <br />
            suppliers are{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
              hiding.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            AI-powered supply chain risk intelligence. Scan, detect violations,
            and simulate regulatory outcomes across your entire network{' '}
            <span className="text-neutral-200">before regulators do.</span>
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold px-8 py-3.5 rounded-full text-[15px] transition-all duration-300 hover:shadow-xl hover:shadow-cyan-400/30"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 text-neutral-300 hover:text-white font-medium px-7 py-3.5 rounded-full text-[15px] bg-white/[0.04] border border-white/[0.12] hover:bg-white/[0.08] hover:border-white/[0.2] transition-all duration-300"
            >
              View Live Demo
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        </motion.div>

        {/* ─── Mac Window Dashboard Preview ─── */}
        <motion.div
          className="relative z-10 max-w-5xl mx-auto mt-24"
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: [0.25, 0.4, 0.25, 1], delay: 0.4 }}
        >
          {/* Glow behind window */}
          <div className="absolute -inset-8 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-purple-500/15 rounded-3xl blur-3xl opacity-60" />

          <GlassCard className="relative overflow-hidden shadow-2xl shadow-black/60">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-[11px] text-neutral-500 font-mono">
                  app.scope3scout.com/dashboard
                </span>
              </div>
            </div>

            {/* Dashboard preview */}
            <div className="p-6 space-y-4 bg-black/40">
              {/* Stat cards */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Total Suppliers', value: '247', trend: '+12', color: '#22d3ee' },
                  { label: 'High Risk', value: '18', trend: '+3', color: '#f87171' },
                  { label: 'Violations', value: '34', trend: '+7', color: '#fb923c' },
                  { label: 'CSRD Compliant', value: '89%', trend: '+4%', color: '#34d399' },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5"
                  >
                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
                      {stat.label}
                    </p>
                    <div className="flex items-end justify-between mt-1.5">
                      <span className="text-xl font-bold text-white font-heading">
                        {stat.value}
                      </span>
                      <SparkLine
                        data={sparkData.map((d) => d + i * 5)}
                        color={stat.color}
                      />
                    </div>
                    <p className="text-[10px] mt-1.5" style={{ color: stat.color }}>
                      {stat.trend} this month
                    </p>
                  </div>
                ))}
              </div>

              {/* Fake table */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 border-b border-white/[0.06]">
                  <span className="text-[11px] font-medium text-neutral-500">
                    Supplier Risk Table
                  </span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.04]">
                      {['Supplier', 'Country', 'Risk', 'Status'].map((h) => (
                        <th
                          key={h}
                          className={`${h === 'Risk' || h === 'Status' ? 'text-center' : 'text-left'} px-4 py-2 text-neutral-600 font-medium`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'SteelCorp GmbH', country: 'Germany', risk: 'CRITICAL', riskCls: 'bg-red-500/15 text-red-400', status: 'Flagged', statusCls: 'text-red-400' },
                      { name: 'TextilePro Bangladesh', country: 'Bangladesh', risk: 'HIGH', riskCls: 'bg-orange-500/15 text-orange-400', status: 'Flagged', statusCls: 'text-orange-400' },
                      { name: 'ChemBase France', country: 'France', risk: 'LOW', riskCls: 'bg-emerald-500/15 text-emerald-400', status: 'Cleared', statusCls: 'text-emerald-400' },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-white/[0.03]">
                        <td className="px-4 py-2.5 text-neutral-200 font-medium">{row.name}</td>
                        <td className="px-4 py-2.5 text-neutral-500">{row.country}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${row.riskCls}`}>{row.risk}</span>
                        </td>
                        <td className={`px-4 py-2.5 text-center text-[11px] font-medium ${row.statusCls}`}>{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          STATS BANNER
         ════════════════════════════════════════════════════════════ */}
      <section className="relative py-32 px-6">
        {/* Subtle aurora */}
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px] mix-blend-screen pointer-events-none -translate-y-1/2" />

        <motion.div
          className="relative z-10 max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div variants={fadeUp}>
              <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                Enter a new era of{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                  autonomous compliance.
                </span>
              </h2>
              <p className="text-neutral-400 mt-6 text-lg leading-relaxed max-w-md">
                Replace weeks of manual due diligence with AI agents that scan, verify, and simulate — continuously.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-8">
              <div>
                <p className="font-heading text-6xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
                  €100K+
                </p>
                <p className="text-neutral-500 text-sm mt-2 uppercase tracking-wider font-medium">
                  Saved in analyst time per year
                </p>
              </div>
              <div className="border-t border-white/[0.06] pt-8">
                <p className="font-heading text-6xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
                  10%
                </p>
                <p className="text-neutral-500 text-sm mt-2 uppercase tracking-wider font-medium">
                  CSRD fine avoidance through early detection
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FEATURES — THE FOUNDATION
         ════════════════════════════════════════════════════════════ */}
      <section id="features" className="relative py-32 px-6">
        {/* Aurora */}
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[160px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-500 mb-4"
            >
              Platform Capabilities
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-heading text-4xl md:text-[3.5rem] font-bold tracking-tight leading-tight"
            >
              The foundation of
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
                continuous monitoring.
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-neutral-400 mt-6 max-w-lg mx-auto text-lg">
              Every layer of intelligence works together to give you a complete, real-time risk picture of your supply chain.
            </motion.p>
          </motion.div>

          {/* 2x2 Glass Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerFast}
          >
            {/* Card 1: TinyFish Web Agents */}
            <motion.div variants={fadeUpSlow}>
              <GlassCard className="p-8 h-full hover:bg-white/[0.05] transition-colors duration-500 group">
                <div className="w-12 h-12 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center mb-6 group-hover:bg-cyan-400/15 transition-colors duration-500">
                  <Search className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-3 tracking-tight">
                  TinyFish Web Agents
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                  Navigates complex government portals like a human analyst. 5 parallel agents scrape EPA databases, news archives, and certification registries simultaneously.
                </p>
                {/* Terminal mockup */}
                <div className="bg-black/60 border border-white/[0.06] rounded-xl p-4 font-mono text-[11px]">
                  <div className="flex items-center gap-2 text-neutral-600 mb-3">
                    <span className="text-cyan-400">$</span> tinyfish scan --supplier "SteelCorp GmbH"
                  </div>
                  <div className="space-y-1.5 text-neutral-500">
                    <p><span className="text-cyan-400">agent[1]</span> Scanning website claims...</p>
                    <p><span className="text-blue-400">agent[2]</span> Querying EU fines database...</p>
                    <p><span className="text-purple-400">agent[3]</span> Searching Reuters archive...</p>
                    <p className="text-red-400 font-semibold mt-2">
                      ! DISCREPANCY: Claims ISO 14001 — fined €40,000 for illegal discharge
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Card 2: Cross-Reference LLM */}
            <motion.div variants={fadeUpSlow}>
              <GlassCard className="p-8 h-full hover:bg-white/[0.05] transition-colors duration-500 group">
                <div className="w-12 h-12 rounded-xl bg-purple-400/10 border border-purple-400/20 flex items-center justify-center mb-6 group-hover:bg-purple-400/15 transition-colors duration-500">
                  <FileText className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-3 tracking-tight">
                  Cross-Reference LLM
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Instantly compares supplier claims against actual public records. Identifies discrepancies between sustainability reports, public procurement databases, and environmental fine registries across all 27 EU member states.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {['Environmental', 'Labour', 'Governance', 'Financial'].map((cat) => (
                    <div
                      key={cat}
                      className="flex items-center gap-2 text-xs text-neutral-400 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      {cat}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Card 3: Real-time Alerts */}
            <motion.div variants={fadeUpSlow}>
              <GlassCard className="p-8 h-full hover:bg-white/[0.05] transition-colors duration-500 group">
                <div className="w-12 h-12 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center mb-6 group-hover:bg-orange-400/15 transition-colors duration-500">
                  <Bell className="h-6 w-6 text-orange-400" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-3 tracking-tight">
                  Real-time Alerts
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Get notified the moment a supplier is hit with an environmental fine, a labour dispute is reported, or a certification lapses. Evidence is auto-sourced with citation URLs for audit-ready documentation.
                </p>
              </GlassCard>
            </motion.div>

            {/* Card 4: Multi-Region Support */}
            <motion.div variants={fadeUpSlow}>
              <GlassCard className="p-8 h-full hover:bg-white/[0.05] transition-colors duration-500 group">
                <div className="w-12 h-12 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center mb-6 group-hover:bg-emerald-400/15 transition-colors duration-500">
                  <MapPin className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-3 tracking-tight">
                  Multi-Region Support
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Scanning 27 EU member states and their regional databases. From Germany's Umweltbundesamt to Romania's ANAP public procurement portal — every local data source is covered.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {['DE', 'FR', 'RO', 'HU', 'BD', 'NL', 'IT', 'ES'].map((code) => (
                    <span
                      key={code}
                      className="text-[10px] font-bold text-neutral-500 bg-white/[0.04] border border-white/[0.08] rounded-md px-2 py-1"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SIMULATION ENGINE — BENTO BOX
         ════════════════════════════════════════════════════════════ */}
      <section id="simulation" className="relative py-32 px-6">
        {/* Aurora */}
        <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-fuchsia-600/15 rounded-full blur-[160px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] mix-blend-screen pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="text-[11px] font-semibold uppercase tracking-[0.25em] text-neutral-500 mb-4"
            >
              Predictive Intelligence
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="font-heading text-4xl md:text-[3.5rem] font-bold tracking-tight leading-tight"
            >
              Predict the fallout
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-500">
                before it happens.
              </span>
            </motion.h2>
          </motion.div>

          {/* Bento: 1 large top + 2 small bottom */}
          <motion.div
            className="space-y-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerFast}
          >
            {/* Large card */}
            <motion.div variants={fadeUpSlow}>
              <GlassCard className="p-10 relative overflow-hidden hover:bg-white/[0.05] transition-colors duration-500">
                {/* Inner glow */}
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-purple-500/10 to-transparent pointer-events-none" />

                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-fuchsia-400/10 border border-fuchsia-400/20 flex items-center justify-center mb-6">
                    <Cpu className="h-6 w-6 text-fuchsia-400" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold mb-3 tracking-tight">
                    MiroFish Simulation Engine
                  </h3>
                  <p className="text-neutral-400 text-base leading-relaxed max-w-2xl mb-10">
                    Creates 6 AI personas — Regulator, Media, Investor, NGO, Competitor, and Legal — to predict how a critical violation will play out over the next 90 days. Each agent independently scores risk probability and timeline.
                  </p>

                  {/* Agent prediction cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { agent: 'Regulator', icon: <Shield className="h-5 w-5" />, pct: '91%', color: 'cyan' },
                      { agent: 'Media', icon: <Eye className="h-5 w-5" />, pct: '67%', color: 'purple' },
                      { agent: 'Investor', icon: <TrendingUp className="h-5 w-5" />, pct: '45%', color: 'blue' },
                      { agent: 'NGO', icon: <Globe className="h-5 w-5" />, pct: '58%', color: 'emerald' },
                    ].map((a) => (
                      <div
                        key={a.agent}
                        className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center hover:bg-white/[0.06] transition-colors duration-300"
                      >
                        <div className={`flex justify-center mb-3 text-${a.color}-400`}>
                          {a.icon}
                        </div>
                        <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-medium">
                          {a.agent}
                        </p>
                        <p className="text-3xl font-heading font-bold text-white mt-2">
                          {a.pct}
                        </p>
                        <p className="text-[10px] text-neutral-600 mt-1">probability</p>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Two small cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div variants={fadeUpSlow}>
                <GlassCard className="p-8 h-full hover:bg-white/[0.05] transition-colors duration-500">
                  <div className="w-12 h-12 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center mb-6">
                    <BarChart3 className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-3 tracking-tight">
                    Risk Scoring
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                    0-100 severity index aggregating all agent predictions, violation history, and CSRD compliance gaps.
                  </p>
                  {/* Score visualisation */}
                  <div className="flex items-end gap-1">
                    {[18, 35, 58, 61, 83].map((score, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className={`w-full rounded-t-md ${score >= 60 ? 'bg-red-500/60' : score >= 40 ? 'bg-orange-500/60' : 'bg-emerald-500/60'}`}
                          style={{ height: `${score * 0.6}px` }}
                        />
                        <span className="text-[9px] text-neutral-600">{score}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div variants={fadeUpSlow}>
                <GlassCard className="p-8 h-full hover:bg-white/[0.05] transition-colors duration-500">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-6">
                    <TrendingUp className="h-6 w-6 text-amber-400" />
                  </div>
                  <h3 className="font-heading text-xl font-bold mb-3 tracking-tight">
                    Financial Exposure
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                    Calculated risk in EUR. Models potential fines, contract losses, and reputational damage per supplier.
                  </p>
                  {/* Exposure numbers */}
                  <div className="space-y-3">
                    {[
                      { supplier: 'SteelCorp', amount: '€2.3M', severity: 'critical' },
                      { supplier: 'TextilePro', amount: '€850K', severity: 'high' },
                      { supplier: 'PackagingPlus', amount: '€450K', severity: 'high' },
                    ].map((item) => (
                      <div
                        key={item.supplier}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-neutral-400">{item.supplier}</span>
                        <span className={`font-heading font-bold ${item.severity === 'critical' ? 'text-red-400' : 'text-orange-400'}`}>
                          {item.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CTA — DEEP GLOW
         ════════════════════════════════════════════════════════════ */}
      <section id="compliance" className="relative py-40 px-6">
        {/* Massive glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[200px] mix-blend-screen pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[160px] mix-blend-screen pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
        >
          <motion.h2
            variants={fadeUp}
            className="font-heading text-4xl md:text-[3.5rem] font-bold tracking-tight leading-tight mb-6"
          >
            The most trusted way to{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
              secure your supply chain.
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-neutral-400 text-lg mb-6">
            Fully CSRD compliant reporting. Deploy in minutes, not months.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              'CSRD Reporting',
              'CSDDD Due Diligence',
              'Audit-Ready PDFs',
              'Evidence Citations',
              'Role-Based Access',
              'ISO 14001',
            ].map((tag) => (
              <span
                key={tag}
                className="text-[12px] text-neutral-400 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-1.5 font-medium"
              >
                {tag}
              </span>
            ))}
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold px-10 py-4 rounded-full text-base transition-all duration-300 hover:shadow-xl hover:shadow-cyan-400/30"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 text-neutral-300 hover:text-white font-medium px-8 py-4 rounded-full text-base bg-white/[0.04] border border-white/[0.12] hover:bg-white/[0.08] transition-all duration-300"
            >
              Explore Documentation
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FOOTER
         ════════════════════════════════════════════════════════════ */}
      <footer className="relative z-10 border-t border-white/[0.06] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Shield className="h-5 w-5 text-cyan-400" />
            <span className="font-heading font-semibold text-neutral-400 text-sm">
              Scope3Scout
            </span>
          </div>
          <p className="text-[11px] text-neutral-600">
            ESG Supply Chain Intelligence. Built for EU compliance.
          </p>
          <div className="flex gap-8 text-[11px] text-neutral-600">
            <span className="hover:text-neutral-400 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-neutral-400 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-neutral-400 cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
