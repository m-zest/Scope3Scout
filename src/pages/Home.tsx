import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Search,
  BarChart3,
  FileCheck,
  AlertTriangle,
  ChevronRight,
  Globe,
  Cpu,
  Eye,
  ArrowRight,
  CheckCircle2,
  Zap,
  Lock,
  TrendingUp,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// Fake sparkline data for dashboard preview
const sparkData = [12, 18, 15, 28, 22, 35, 30, 42, 38, 45, 40, 55];

function SparkLine({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 24;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} />
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Radial gradient background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 pointer-events-none" />

      {/* ─── Navigation ─── */}
      <nav className="relative z-50 sticky top-0 glass border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-400" />
            <span className="font-heading font-bold text-lg text-white">Scope3Scout</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#compliance" className="hover:text-white transition-colors">Compliance</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="text-sm text-slate-300 hover:text-white transition-colors px-3 py-1.5"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Request Demo
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <section className="relative z-10 pt-24 pb-16 px-6">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-6">
            <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5">
              <Zap className="h-3 w-3" />
              EU CSRD &amp; CSDDD Compliant Intelligence
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-heading text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6 text-balance"
          >
            Find what your suppliers{' '}
            <br className="hidden md:block" />
            are hiding{' '}
            <span className="gradient-text">before regulators do</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 text-balance"
          >
            AI-powered supply chain risk intelligence. Scan, detect violations, and simulate regulatory outcomes across your entire supplier network in minutes.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium px-8 py-3.5 rounded-xl text-base transition-all hover:shadow-lg hover:shadow-emerald-500/25"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 text-slate-300 hover:text-white font-medium px-6 py-3.5 rounded-xl text-base border border-slate-700 hover:border-slate-500 transition-all"
            >
              View Live Demo
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        </motion.div>

        {/* ─── Mac Window Dashboard Preview ─── */}
        <motion.div
          className="max-w-5xl mx-auto mt-20"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' as const, delay: 0.3 }}
        >
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-cyan-500/20 rounded-3xl blur-2xl opacity-50" />

            {/* Mac window frame */}
            <div className="relative bg-slate-900 border border-slate-700/60 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
              {/* Title bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-slate-500 font-mono">app.scope3scout.com/dashboard</span>
                </div>
              </div>

              {/* Fake dashboard content */}
              <div className="p-6 space-y-4">
                {/* Top stat cards */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: 'Total Suppliers', value: '247', trend: '+12', color: 'text-emerald-400' },
                    { label: 'High Risk', value: '18', trend: '+3', color: 'text-red-400' },
                    { label: 'Violations', value: '34', trend: '+7', color: 'text-orange-400' },
                    { label: 'CSRD Compliant', value: '89%', trend: '+4%', color: 'text-emerald-400' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-800/50 border border-slate-700/40 rounded-lg p-3">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{stat.label}</p>
                      <div className="flex items-end justify-between mt-1">
                        <span className="text-xl font-bold text-white font-heading">{stat.value}</span>
                        <SparkLine data={sparkData.map((d) => d + i * 5)} color={stat.color.includes('red') ? '#f87171' : stat.color.includes('orange') ? '#fb923c' : '#34d399'} />
                      </div>
                      <p className={`text-[10px] mt-1 ${stat.color}`}>{stat.trend} this month</p>
                    </div>
                  ))}
                </div>

                {/* Fake table */}
                <div className="bg-slate-800/30 border border-slate-700/40 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 border-b border-slate-700/40">
                    <span className="text-xs font-medium text-slate-400">Supplier Risk Table</span>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-700/30">
                        <th className="text-left px-4 py-2 text-slate-500 font-medium">Supplier</th>
                        <th className="text-left px-4 py-2 text-slate-500 font-medium">Country</th>
                        <th className="text-center px-4 py-2 text-slate-500 font-medium">Risk</th>
                        <th className="text-center px-4 py-2 text-slate-500 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'SteelCorp GmbH', country: 'Germany', risk: 'CRITICAL', status: 'Flagged', riskCls: 'bg-red-500/20 text-red-400', statusCls: 'bg-red-500/20 text-red-400' },
                        { name: 'TextilePro Bangladesh', country: 'Bangladesh', risk: 'HIGH', status: 'Flagged', riskCls: 'bg-orange-500/20 text-orange-400', statusCls: 'bg-red-500/20 text-red-400' },
                        { name: 'ChemBase France', country: 'France', risk: 'LOW', status: 'Cleared', riskCls: 'bg-emerald-500/20 text-emerald-400', statusCls: 'bg-emerald-500/20 text-emerald-400' },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-slate-700/20">
                          <td className="px-4 py-2.5 text-slate-300 font-medium">{row.name}</td>
                          <td className="px-4 py-2.5 text-slate-500">{row.country}</td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${row.riskCls}`}>{row.risk}</span>
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${row.statusCls}`}>{row.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Trusted By ─── */}
      <section className="relative z-10 py-12 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs uppercase tracking-widest text-slate-600 mb-8">
            Built for enterprise supply chain teams
          </p>
          <div className="flex items-center justify-center gap-12 flex-wrap opacity-40">
            {['CSRD Compliant', 'ISO 14001', 'CSDDD Ready', 'GRI Standards', 'CDP Verified'].map((name) => (
              <span key={name} className="text-sm font-medium text-slate-400 whitespace-nowrap">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Bento Box ─── */}
      <section id="features" className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-sm font-medium text-emerald-400 mb-3">
              PLATFORM CAPABILITIES
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-heading text-4xl md:text-5xl font-bold tracking-tight">
              Three-tier AI intelligence
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 mt-4 max-w-xl mx-auto">
              From web scraping to predictive simulation, every layer works together to give you a complete risk picture.
            </motion.p>
          </motion.div>

          {/* Bento grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-6 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            {/* Large card: TinyFish Web Agents */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-8 relative overflow-hidden group hover:border-slate-700 transition-colors"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full" />
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <Search className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">Tier 1: TinyFish Web Agents</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-md">
                  5 parallel AI agents scrape supplier websites, EPA databases, news articles, and LinkedIn to find discrepancies between claims and reality.
                </p>
                {/* Terminal mockup */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-xs">
                  <div className="flex items-center gap-2 text-slate-600 mb-3">
                    <span className="text-emerald-400">$</span> tinyfish scan --supplier "SteelCorp GmbH"
                  </div>
                  <div className="space-y-1 text-slate-500">
                    <p><span className="text-emerald-400">agent[1]</span> Scanning steelcorp-gmbh.de claims...</p>
                    <p><span className="text-cyan-400">agent[2]</span> Searching EU environmental fines database...</p>
                    <p><span className="text-yellow-400">agent[3]</span> Querying Reuters news archive...</p>
                    <p><span className="text-orange-400">agent[4]</span> Checking ISO certifications...</p>
                    <p><span className="text-purple-400">agent[5]</span> Scanning LinkedIn company data...</p>
                    <p className="text-red-400 mt-2 font-semibold">! DISCREPANCY: Claims ISO 14001 but fined EUR 40,000 for illegal discharge</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Small card: CSRD */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4">
                <FileCheck className="h-5 w-5 text-cyan-400" />
              </div>
              <h3 className="font-heading text-lg font-bold mb-2">CSRD Compliance</h3>
              <p className="text-slate-400 text-sm mb-4">
                Automatic scoring against EU sustainability reporting directives.
              </p>
              <div className="space-y-2">
                {['Environmental', 'Labour', 'Governance', 'Financial'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-slate-400">{item} assessment</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Small card: Violation Detection */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-4">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="font-heading text-lg font-bold mb-2">Tier 2: Violation Detection</h3>
              <p className="text-slate-400 text-sm">
                Classify and verify violations with evidence sourcing, citation URLs, and fine amount extraction.
              </p>
            </motion.div>

            {/* Large card: Simulation Engine */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-8 relative overflow-hidden hover:border-slate-700 transition-colors"
            >
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-tr-full" />
              <div className="relative">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                  <Cpu className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="font-heading text-xl font-bold mb-2">Tier 3: Predictive Simulation Engine</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-md">
                  Multi-agent system simulates regulator, media, investor, and NGO responses to generate risk predictions and financial exposure estimates.
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { agent: 'Regulator', emoji: <Shield className="h-4 w-4" />, pct: '91%' },
                    { agent: 'Media', emoji: <Eye className="h-4 w-4" />, pct: '67%' },
                    { agent: 'Investor', emoji: <TrendingUp className="h-4 w-4" />, pct: '45%' },
                    { agent: 'NGO', emoji: <Globe className="h-4 w-4" />, pct: '58%' },
                  ].map((a) => (
                    <div key={a.agent} className="bg-slate-800/50 border border-slate-700/40 rounded-lg p-3 text-center">
                      <div className="flex justify-center mb-2 text-purple-400">{a.emoji}</div>
                      <p className="text-xs text-slate-500">{a.agent}</p>
                      <p className="text-lg font-bold font-heading text-white mt-1">{a.pct}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="relative z-10 py-24 px-6 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-sm font-medium text-emerald-400 mb-3">HOW IT WORKS</motion.p>
            <motion.h2 variants={fadeUp} className="font-heading text-4xl font-bold tracking-tight">
              From upload to audit-ready report in minutes
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            {[
              {
                step: '01',
                title: 'Upload Suppliers',
                desc: 'CSV bulk import or manual entry. We map names, websites, countries, and industries automatically.',
                icon: <BarChart3 className="h-6 w-6" />,
              },
              {
                step: '02',
                title: 'AI Scans & Detects',
                desc: 'TinyFish agents scrape the web. Tier 2 classifies violations. Evidence is sourced and cited.',
                icon: <Search className="h-6 w-6" />,
              },
              {
                step: '03',
                title: 'Simulate & Report',
                desc: 'Predictive models score risk, estimate financial exposure, and generate CSRD-compliant PDF reports.',
                icon: <FileCheck className="h-6 w-6" />,
              },
            ].map((item) => (
              <motion.div key={item.step} variants={fadeUp} className="relative">
                <span className="text-6xl font-heading font-bold text-slate-800/60">{item.step}</span>
                <div className="mt-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                    {item.icon}
                  </div>
                  <h3 className="font-heading text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Compliance Section ─── */}
      <section id="compliance" className="relative z-10 py-24 px-6 border-t border-slate-800/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-3xl p-12 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <Lock className="h-8 w-8 text-emerald-400 mx-auto mb-4" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Enterprise-grade compliance, out of the box
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 max-w-xl mx-auto mb-8">
              Scope3Scout is designed for Chief Procurement Officers who need audit-ready evidence, not just dashboards.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-4">
              {[
                'CSRD Reporting',
                'CSDDD Due Diligence',
                'Audit-Ready PDFs',
                'Evidence Citations',
                'Role-Based Access',
                'Supabase RLS',
              ].map((item) => (
                <span
                  key={item}
                  className="text-sm text-slate-300 bg-slate-800/50 border border-slate-700/50 rounded-full px-4 py-2"
                >
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="relative z-10 py-24 px-6 border-t border-slate-800/50">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="font-heading text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Stop guessing.{' '}
            <span className="gradient-text">Start scanning.</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-400 text-lg mb-10">
            Join procurement teams across the EU who use Scope3Scout to protect their supply chains from regulatory risk.
          </motion.p>
          <motion.div variants={fadeUp}>
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-medium px-10 py-4 rounded-xl text-lg transition-all hover:shadow-lg hover:shadow-emerald-500/25"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative z-10 border-t border-slate-800/50 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            <span className="font-heading font-semibold text-slate-400">Scope3Scout</span>
          </div>
          <p className="text-xs text-slate-600">
            ESG Supply Chain Intelligence Platform. Built for EU compliance.
          </p>
          <div className="flex gap-6 text-xs text-slate-600">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
