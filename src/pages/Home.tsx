import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Spline from '@splinetool/react-spline';
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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92, y: 50 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 1, ease: customEase } },
};

const slideFromLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: customEase } },
};

const slideFromRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: customEase } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const staggerFast = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── Glassmorphic Card ─── */
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/[0.02] border border-white/[0.05] backdrop-blur-xl rounded-2xl hover:bg-white/[0.04] transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

/* ─── Realistic Area Chart SVG ─── */
function AreaChart({ data, color, gradientId }: { data: number[]; color: string; gradientId: string }) {
  const w = 200;
  const h = 60;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 8) - 4,
  }));
  const linePath = points.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = points[i - 1];
    const cpx1 = prev.x + (p.x - prev.x) * 0.4;
    const cpx2 = prev.x + (p.x - prev.x) * 0.6;
    return `C ${cpx1} ${prev.y} ${cpx2} ${p.y} ${p.x} ${p.y}`;
  }).join(' ');
  const areaPath = `${linePath} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="w-full h-full">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ─── Donut Chart SVG ─── */
function DonutChart({ segments }: { segments: { pct: number; color: string }[] }) {
  const r = 40;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={100} height={100} viewBox="0 0 100 100">
      {segments.map((seg, i) => {
        const dashLen = (seg.pct / 100) * circumference;
        const dashOffset = -offset;
        offset += dashLen;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth="8"
            strokeDasharray={`${dashLen} ${circumference - dashLen}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            opacity={0.8}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="white" strokeWidth="8" opacity={0.03} />
    </svg>
  );
}

/* ─── Bar Chart SVG ─── */
function BarChartSVG({ data, colors }: { data: number[]; colors: string[] }) {
  const max = Math.max(...data);
  const h = 80;
  const barW = 16;
  const gap = 8;
  const totalW = data.length * barW + (data.length - 1) * gap;
  return (
    <svg width={totalW} height={h} viewBox={`0 0 ${totalW} ${h}`}>
      {data.map((v, i) => {
        const barH = (v / max) * (h - 4);
        return (
          <rect
            key={i}
            x={i * (barW + gap)}
            y={h - barH}
            width={barW}
            height={barH}
            rx={4}
            fill={colors[i % colors.length]}
            opacity={0.7}
          />
        );
      })}
    </svg>
  );
}

const chartData = {
  suppliers: [45, 52, 48, 63, 71, 68, 85, 92, 88, 105, 115, 127, 140, 155, 170, 185, 200, 215, 230, 247],
  risk: [5, 7, 6, 9, 8, 12, 10, 15, 13, 14, 16, 18],
  violations: [2, 5, 3, 8, 6, 10, 9, 14, 11, 18, 22, 28, 25, 30, 34],
  compliance: [42, 48, 55, 60, 58, 65, 70, 72, 75, 78, 82, 85, 87, 89],
};

export default function Home() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const macRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: macProgress } = useScroll({
    target: macRef,
    offset: ['start end', 'end start'],
  });

  const macY = useTransform(macProgress, [0, 1], [100, -60]);
  const macScale = useTransform(macProgress, [0, 0.4, 1], [0.9, 1, 1]);
  const macRotateX = useTransform(macProgress, [0, 0.4], [6, 0]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* ═══ NAVIGATION ═══ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="h-5 w-5 text-cyan-400" />
            <span className="font-heading font-bold text-base tracking-tighter">Scope3Scout</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-neutral-500">
            <a href="#features" className="hover:text-white transition-colors duration-300">Features</a>
            <a href="#simulation" className="hover:text-white transition-colors duration-300">Simulation</a>
            <a href="#compliance" className="hover:text-white transition-colors duration-300">Compliance</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="text-[13px] text-neutral-400 hover:text-white transition-colors duration-300"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="text-[13px] font-semibold bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)]"
            >
              Request Demo
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ HERO SECTION — Spline 3D scene IS the hero ═══ */}
      <div ref={heroRef} className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden pt-10 px-4">
        {/* 3D Background with Watermark Hide Hack */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none scale-[1.05] translate-y-4 [&_a]:!hidden">
          <Spline scene="https://prod.spline.design/YPaOvWpo21wNAioe/scene.splinecode" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Kicker */}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-semibold tracking-[0.2em] uppercase text-xs md:text-sm mb-4">
            Detect. Simulate. Comply.
          </span>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter text-white mb-6 max-w-5xl leading-[1.1]">
            Find what your suppliers are <br className="hidden md:block" />
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500">
              hiding.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-neutral-400 font-light max-w-2xl mb-10 leading-relaxed">
            AI-powered supply chain risk intelligence. Automatically audit your entire network, detect ESG violations, and prevent CSRD fines before regulators step in.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:scale-105 transition-transform duration-300 shadow-[0_0_40px_-10px_rgba(147,51,234,0.5)]"
            >
              Start Free Trial &rarr;
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="px-8 py-4 rounded-full bg-white/[0.05] border border-white/10 text-white font-medium backdrop-blur-md hover:bg-white/[0.1] transition-colors duration-300"
            >
              View Live Demo
            </button>
          </div>
        </div>

        {/* Bottom fade to black for smooth transition to dashboard */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-[5] pointer-events-none" />
      </div>

      {/* ═══ MAC WINDOW DASHBOARD — LARGE, SCROLL-DRIVEN ═══ */}
      <section className="relative px-6 -mt-20 pb-32">
        <motion.div
          ref={macRef}
          className="relative z-10 max-w-6xl mx-auto"
          style={{ y: macY, scale: macScale, rotateX: macRotateX, perspective: 1200 }}
        >
          {/* Multi-layer glow behind window */}
          <div className="absolute -inset-16 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-purple-500/5 to-transparent blur-3xl opacity-70" />
          <div className="absolute -inset-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent blur-xl opacity-50" />

          {/* Window frame with depth */}
          <div className="relative rounded-2xl border border-white/[0.08] bg-black/80 backdrop-blur-3xl shadow-[0_0_100px_-20px_rgba(120,119,198,0.35)] ring-1 ring-white/[0.05] overflow-hidden">
            {/* Glare edge */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Title bar */}
            <div className="flex items-center gap-2 px-6 py-4 border-b border-white/[0.05] bg-white/[0.015]">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f57] shadow-[0_0_6px_rgba(255,95,87,0.4)]" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#febc2e] shadow-[0_0_6px_rgba(254,188,46,0.4)]" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#28c840] shadow-[0_0_6px_rgba(40,200,64,0.4)]" />
              </div>
              <div className="flex-1 text-center">
                <span className="text-[12px] text-neutral-600 font-mono">app.scope3scout.com/dashboard</span>
              </div>
            </div>

            {/* Dashboard content — realistic charts */}
            <div className="p-8 space-y-6 bg-[#0a0a0a]">
              {/* Stat cards with area charts */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Suppliers', value: '247', trend: '+12 this month', color: '#22d3ee', data: chartData.suppliers },
                  { label: 'High Risk', value: '18', trend: '+3 flagged', color: '#f87171', data: chartData.risk },
                  { label: 'Violations', value: '34', trend: '+7 detected', color: '#fb923c', data: chartData.violations },
                  { label: 'CSRD Compliant', value: '89%', trend: '+4% improved', color: '#34d399', data: chartData.compliance },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                    <p className="text-[10px] text-neutral-600 uppercase tracking-wider font-medium mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-white font-heading mb-2">{stat.value}</p>
                    <div className="h-[50px] mb-2">
                      <AreaChart data={stat.data} color={stat.color} gradientId={`grad-${i}`} />
                    </div>
                    <p className="text-[10px] font-medium" style={{ color: stat.color }}>{stat.trend}</p>
                  </div>
                ))}
              </div>

              {/* Two-column: Risk Table + Donut + Bar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Risk Table — spans 2 cols */}
                <div className="lg:col-span-2 bg-white/[0.015] border border-white/[0.05] rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/[0.04] flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-neutral-400">Supplier Risk Table</span>
                    <span className="text-[10px] text-neutral-700">5 of 247 suppliers</span>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.03]">
                        {['Supplier', 'Country', 'Score', 'Risk', 'Status'].map((h) => (
                          <th key={h} className={`${h === 'Risk' || h === 'Status' || h === 'Score' ? 'text-center' : 'text-left'} px-5 py-2.5 text-neutral-700 font-medium text-[10px] uppercase tracking-wider`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'SteelCorp GmbH', country: 'Germany', score: 82, risk: 'CRITICAL', riskCls: 'bg-red-500/10 text-red-500 border border-red-500/20', status: 'Flagged', statusCls: 'bg-red-500/10 text-red-400' },
                        { name: 'TextilePro Bangladesh', country: 'Bangladesh', score: 71, risk: 'HIGH', riskCls: 'bg-orange-500/10 text-orange-400 border border-orange-500/20', status: 'Flagged', statusCls: 'bg-orange-500/10 text-orange-400' },
                        { name: 'PackagingPlus Romania', country: 'Romania', score: 58, risk: 'HIGH', riskCls: 'bg-orange-500/10 text-orange-400 border border-orange-500/20', status: 'Scanning', statusCls: 'bg-yellow-500/10 text-yellow-400' },
                        { name: 'ChemBase France', country: 'France', score: 24, risk: 'LOW', riskCls: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', status: 'Cleared', statusCls: 'bg-emerald-500/10 text-emerald-400' },
                        { name: 'LogiTrans Hungary', country: 'Hungary', score: 35, risk: 'MEDIUM', riskCls: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20', status: 'Scanned', statusCls: 'bg-blue-500/10 text-blue-400' },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3 text-neutral-200 font-medium text-[13px]">{row.name}</td>
                          <td className="px-5 py-3 text-neutral-600 text-[13px]">{row.country}</td>
                          <td className="px-5 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-8 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                                <div className={`h-full rounded-full ${row.score >= 60 ? 'bg-red-500' : row.score >= 40 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${row.score}%` }} />
                              </div>
                              <span className="text-[11px] font-mono text-neutral-500">{row.score}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${row.riskCls}`}>{row.risk}</span>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${row.statusCls}`}>{row.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Right column: Donut + Bar */}
                <div className="space-y-4">
                  <div className="bg-white/[0.015] border border-white/[0.05] rounded-xl p-5">
                    <p className="text-[10px] text-neutral-600 uppercase tracking-wider font-medium mb-3">Risk Distribution</p>
                    <div className="flex items-center gap-4">
                      <DonutChart segments={[
                        { pct: 8, color: '#ef4444' },
                        { pct: 16, color: '#f97316' },
                        { pct: 30, color: '#eab308' },
                        { pct: 46, color: '#22c55e' },
                      ]} />
                      <div className="space-y-1.5 text-[11px]">
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-neutral-500">Critical 8%</span></div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500" /><span className="text-neutral-500">High 16%</span></div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500" /><span className="text-neutral-500">Medium 30%</span></div>
                        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-neutral-500">Low 46%</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/[0.015] border border-white/[0.05] rounded-xl p-5">
                    <p className="text-[10px] text-neutral-600 uppercase tracking-wider font-medium mb-3">Violations by Category</p>
                    <div className="flex justify-center">
                      <BarChartSVG
                        data={[14, 9, 6, 3, 2]}
                        colors={['#f87171', '#fb923c', '#fbbf24', '#34d399', '#60a5fa']}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-neutral-700 mt-2 px-1">
                      <span>Env</span><span>Labour</span><span>Gov</span><span>Safety</span><span>Other</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ═══ STATS BANNER ═══ */}
      <section className="relative py-36 px-6">
        <div className="absolute top-1/2 left-[-5%] w-[600px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-700/20 via-indigo-900/5 to-transparent blur-3xl opacity-50 pointer-events-none -translate-y-1/2" />

        <motion.div
          className="relative z-10 max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
            <motion.div variants={slideFromLeft}>
              <h2 className="font-heading text-4xl md:text-5xl font-light tracking-tight leading-[1.08]">
                Enter a new era of{' '}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                  autonomous compliance.
                </span>
              </h2>
              <p className="text-neutral-500 mt-6 text-lg leading-relaxed max-w-md font-light">
                Replace weeks of manual due diligence with AI agents that scan, verify, and simulate — continuously.
              </p>
            </motion.div>

            <motion.div variants={slideFromRight} className="space-y-10">
              <div>
                <p className="font-heading text-7xl md:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
                  €100K+
                </p>
                <p className="text-neutral-600 text-sm mt-2 uppercase tracking-[0.15em] font-medium">
                  Saved in analyst time per year
                </p>
              </div>
              <div className="border-t border-white/[0.05] pt-10">
                <p className="font-heading text-7xl md:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
                  10%
                </p>
                <p className="text-neutral-600 text-sm mt-2 uppercase tracking-[0.15em] font-medium">
                  CSRD fine avoidance through early detection
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══ FEATURES — THE FOUNDATION ═══ */}
      <section id="features" className="relative py-36 px-6">
        <div className="absolute top-[20%] right-[10%] w-[700px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-700/20 via-purple-900/5 to-transparent blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-[10%] left-[20%] w-[500px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-600/15 via-cyan-900/5 to-transparent blur-3xl opacity-40 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-600 mb-5">
              Platform Capabilities
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-heading text-4xl md:text-[3.5rem] font-light tracking-tight leading-tight">
              The foundation of
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                continuous monitoring.
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-neutral-500 mt-6 max-w-lg mx-auto text-lg font-light">
              Every layer of intelligence works together to give you a complete, real-time risk picture.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerFast}
          >
            {/* Card 1: TinyFish */}
            <motion.div variants={fadeUpSlow}>
              <GlassCard className="p-8 h-full group">
                <div className="w-12 h-12 rounded-xl bg-cyan-400/[0.08] border border-cyan-400/[0.15] flex items-center justify-center mb-6 group-hover:bg-cyan-400/[0.12] transition-colors duration-500">
                  <Search className="h-5 w-5 text-cyan-400" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3 tracking-tight">TinyFish Web Agents</h3>
                <p className="text-neutral-500 text-sm leading-relaxed mb-6 font-light">
                  Navigates complex government portals like a human analyst. 5 parallel agents scrape EPA databases, news archives, and certification registries simultaneously.
                </p>
                <div className="bg-black/80 border border-white/[0.04] rounded-xl p-4 font-mono text-[11px]">
                  <div className="flex items-center gap-2 text-neutral-700 mb-3">
                    <span className="text-cyan-400">$</span> tinyfish scan --supplier &quot;SteelCorp GmbH&quot;
                  </div>
                  <div className="space-y-1.5 text-neutral-600">
                    <p><span className="text-cyan-400">agent[1]</span> Scanning website claims...</p>
                    <p><span className="text-blue-400">agent[2]</span> Querying EU fines database...</p>
                    <p><span className="text-purple-400">agent[3]</span> Searching Reuters archive...</p>
                    <p className="text-red-400 font-semibold mt-2">! DISCREPANCY: Claims ISO 14001 — fined €40,000</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            {/* Card 2: Cross-Reference */}
            <motion.div variants={fadeUpSlow}>
              <GlassCard className="p-8 h-full group">
                <div className="w-12 h-12 rounded-xl bg-purple-400/[0.08] border border-purple-400/[0.15] flex items-center justify-center mb-6 group-hover:bg-purple-400/[0.12] transition-colors duration-500">
                  <FileText className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3 tracking-tight">Cross-Reference LLM</h3>
                <p className="text-neutral-500 text-sm leading-relaxed font-light">
                  Instantly compares supplier claims against actual public records. Identifies discrepancies between sustainability reports, procurement databases, and fine registries across all 27 EU member states.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  {['Environmental', 'Labour', 'Governance', 'Financial'].map((cat) => (
                    <div key={cat} className="flex items-center gap-2 text-xs text-neutral-500 bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      {cat}
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Card 3: Alerts */}
            <motion.div variants={fadeUpSlow}>
              <GlassCard className="p-8 h-full group">
                <div className="w-12 h-12 rounded-xl bg-orange-400/[0.08] border border-orange-400/[0.15] flex items-center justify-center mb-6 group-hover:bg-orange-400/[0.12] transition-colors duration-500">
                  <Bell className="h-5 w-5 text-orange-400" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3 tracking-tight">Real-time Alerts</h3>
                <p className="text-neutral-500 text-sm leading-relaxed font-light">
                  Get notified the moment a supplier is hit with an environmental fine, a labour dispute is reported, or a certification lapses. Evidence is auto-sourced with citation URLs.
                </p>
              </GlassCard>
            </motion.div>

            {/* Card 4: Multi-Region */}
            <motion.div variants={fadeUpSlow}>
              <GlassCard className="p-8 h-full group">
                <div className="w-12 h-12 rounded-xl bg-emerald-400/[0.08] border border-emerald-400/[0.15] flex items-center justify-center mb-6 group-hover:bg-emerald-400/[0.12] transition-colors duration-500">
                  <MapPin className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3 tracking-tight">Multi-Region Support</h3>
                <p className="text-neutral-500 text-sm leading-relaxed font-light">
                  Scanning 27 EU member states and their regional databases. Every local data source is covered.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {['DE', 'FR', 'RO', 'HU', 'BD', 'NL', 'IT', 'ES'].map((code) => (
                    <span key={code} className="text-[10px] font-bold text-neutral-600 bg-white/[0.03] border border-white/[0.06] rounded-md px-2.5 py-1">
                      {code}
                    </span>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ SIMULATION ENGINE — BENTO ═══ */}
      <section id="simulation" className="relative py-36 px-6">
        <div className="absolute top-[15%] left-[25%] w-[700px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fuchsia-700/20 via-fuchsia-900/5 to-transparent blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-[15%] right-[15%] w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-700/15 via-blue-900/5 to-transparent blur-3xl opacity-40 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.p variants={fadeUp} className="text-[11px] font-semibold uppercase tracking-[0.3em] text-neutral-600 mb-5">
              Predictive Intelligence
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-heading text-4xl md:text-[3.5rem] font-light tracking-tight leading-tight">
              Predict the fallout
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-500">
                before it happens.
              </span>
            </motion.h2>
          </motion.div>

          <motion.div className="space-y-4" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={staggerFast}>
            <motion.div variants={scaleIn}>
              <GlassCard className="p-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[400px] h-[300px] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/10 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/20 to-transparent" />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-fuchsia-400/[0.08] border border-fuchsia-400/[0.15] flex items-center justify-center mb-6">
                    <Cpu className="h-6 w-6 text-fuchsia-400" />
                  </div>
                  <h3 className="font-heading text-2xl font-semibold mb-3 tracking-tight">MiroFish Simulation Engine</h3>
                  <p className="text-neutral-500 text-base leading-relaxed max-w-2xl mb-10 font-light">
                    Creates 6 AI personas — Regulator, Media, Investor, NGO, Competitor, and Legal — to predict how a violation plays out over 90 days. Each agent independently scores risk probability and timeline.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { agent: 'Regulator', icon: <Shield className="h-5 w-5" />, pct: '91%', cls: 'text-cyan-400' },
                      { agent: 'Media', icon: <Eye className="h-5 w-5" />, pct: '67%', cls: 'text-purple-400' },
                      { agent: 'Investor', icon: <TrendingUp className="h-5 w-5" />, pct: '45%', cls: 'text-blue-400' },
                      { agent: 'NGO', icon: <Globe className="h-5 w-5" />, pct: '58%', cls: 'text-emerald-400' },
                    ].map((a) => (
                      <div key={a.agent} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 text-center hover:bg-white/[0.04] transition-colors duration-300">
                        <div className={`flex justify-center mb-3 ${a.cls}`}>{a.icon}</div>
                        <p className="text-[11px] text-neutral-600 uppercase tracking-wider font-medium">{a.agent}</p>
                        <p className="text-3xl font-heading font-bold text-white mt-2">{a.pct}</p>
                        <p className="text-[10px] text-neutral-700 mt-1">probability</p>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div variants={fadeUpSlow}>
                <GlassCard className="p-8 h-full">
                  <div className="w-12 h-12 rounded-xl bg-blue-400/[0.08] border border-blue-400/[0.15] flex items-center justify-center mb-6">
                    <BarChart3 className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-3 tracking-tight">Risk Scoring</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-6 font-light">
                    0-100 severity index aggregating all agent predictions, violation history, and CSRD compliance gaps.
                  </p>
                  <div className="flex items-end gap-1.5">
                    {[18, 35, 58, 61, 83].map((score, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                        <div
                          className={`w-full rounded-t-md ${score >= 60 ? 'bg-red-500/50' : score >= 40 ? 'bg-orange-500/50' : 'bg-emerald-500/50'}`}
                          style={{ height: `${score * 0.7}px` }}
                        />
                        <span className="text-[9px] text-neutral-700 font-mono">{score}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>

              <motion.div variants={fadeUpSlow}>
                <GlassCard className="p-8 h-full">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/[0.08] border border-amber-400/[0.15] flex items-center justify-center mb-6">
                    <TrendingUp className="h-6 w-6 text-amber-400" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-3 tracking-tight">Financial Exposure</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed mb-6 font-light">
                    Calculated risk in EUR. Models potential fines, contract losses, and reputational damage per supplier.
                  </p>
                  <div className="space-y-3">
                    {[
                      { supplier: 'SteelCorp', amount: '€2.3M', severity: 'critical' },
                      { supplier: 'TextilePro', amount: '€850K', severity: 'high' },
                      { supplier: 'PackagingPlus', amount: '€450K', severity: 'high' },
                    ].map((item) => (
                      <div key={item.supplier} className="flex items-center justify-between text-sm">
                        <span className="text-neutral-500">{item.supplier}</span>
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

      {/* ═══ CTA — DEEP GLOW ═══ */}
      <section id="compliance" className="relative py-44 px-6">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/25 via-indigo-800/10 to-transparent blur-3xl opacity-70 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-600/20 via-purple-900/5 to-transparent blur-[100px] opacity-60 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/3 w-[300px] h-[300px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-500/15 via-transparent to-transparent blur-[80px] opacity-50 pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-3xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="font-heading text-4xl md:text-[3.5rem] font-light tracking-tight leading-tight mb-6">
            The most trusted way to{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              secure your supply chain.
            </span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-neutral-500 text-lg mb-8 font-light">
            Fully CSRD compliant reporting. Deploy in minutes, not months.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2.5 mb-14">
            {['CSRD Reporting', 'CSDDD Due Diligence', 'Audit-Ready PDFs', 'Evidence Citations', 'Role-Based Access', 'ISO 14001'].map((tag) => (
              <span key={tag} className="text-[11px] text-neutral-500 bg-white/[0.03] border border-white/[0.06] rounded-full px-4 py-1.5 font-medium">
                {tag}
              </span>
            ))}
          </motion.div>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-10 py-4 rounded-full text-base transition-all duration-300 shadow-[0_0_30px_rgba(147,51,234,0.5)] hover:shadow-[0_0_50px_rgba(147,51,234,0.6)]"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2 text-neutral-400 hover:text-white font-medium px-8 py-4 rounded-full text-base bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] transition-all duration-300"
            >
              Explore Documentation
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-white/[0.04] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <Shield className="h-5 w-5 text-cyan-400" />
            <span className="font-heading font-semibold text-neutral-500 text-sm">Scope3Scout</span>
          </div>
          <p className="text-[11px] text-neutral-700">ESG Supply Chain Intelligence. Built for EU compliance.</p>
          <div className="flex gap-8 text-[11px] text-neutral-700">
            <span className="hover:text-neutral-400 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-neutral-400 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-neutral-400 cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
