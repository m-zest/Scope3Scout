import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Building2,
  Key,
  Bell,
  Shield,
  Save,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

interface SettingsCardProps {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingsCard({ icon: Icon, iconColor, iconBg, title, description, children }: SettingsCardProps) {
  return (
    <motion.div variants={fadeUp} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center border', iconBg)}>
          <Icon className={cn('h-5 w-5', iconColor)} />
        </div>
        <div>
          <h2 className="font-heading text-sm font-semibold text-white tracking-tight">{title}</h2>
          <p className="text-[11px] text-neutral-500">{description}</p>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function InputField({ label, value, onChange, type = 'text', placeholder, disabled = false, mono = false }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; disabled?: boolean; mono?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-neutral-600 text-sm focus:outline-none focus:ring-2 focus:ring-[#818cf8]/40 focus:border-[#818cf8]/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed',
          mono && 'font-mono text-xs'
        )}
      />
    </div>
  );
}

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [orgName, setOrgName] = useState('My Organization');
  const [tinyfishKey, setTinyfishKey] = useState(import.meta.env.VITE_TINYFISH_API_KEY || '');
  const [geminiKey, setGeminiKey] = useState(import.meta.env.VITE_GEMINI_API_KEY || '');
  const [openaiKey, setOpenaiKey] = useState(import.meta.env.VITE_OPENAI_API_KEY || '');
  const [alertEmail, setAlertEmail] = useState(true);
  const [alertCritical, setAlertCritical] = useState(true);
  const [alertHigh, setAlertHigh] = useState(true);
  const [alertMedium, setAlertMedium] = useState(false);

  const [userEmail, setUserEmail] = useState('');
  useState(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email) setUserEmail(data.session.user.email);
    });
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <motion.div className="space-y-5 max-w-3xl" initial="hidden" animate="visible" variants={stagger}>
      {/* Profile */}
      <SettingsCard
        icon={User}
        iconColor="text-cyan-400"
        iconBg="bg-cyan-500/10 border-cyan-500/20"
        title="Profile"
        description="Your account details"
      >
        <div className="grid gap-4">
          <InputField label="Email" value={userEmail} onChange={() => {}} disabled placeholder="you@company.com" />
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Role</label>
            <span className="inline-flex px-3 py-1.5 rounded-lg bg-[#818cf8]/10 border border-[#818cf8]/20 text-[#818cf8] text-xs font-semibold">
              Admin
            </span>
          </div>
        </div>
      </SettingsCard>

      {/* Organization */}
      <SettingsCard
        icon={Building2}
        iconColor="text-purple-400"
        iconBg="bg-purple-500/10 border-purple-500/20"
        title="Organization"
        description="Company settings"
      >
        <div className="grid gap-4">
          <InputField label="Organization Name" value={orgName} onChange={setOrgName} placeholder="Acme Corp" />
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Compliance Framework</label>
            <div className="flex flex-wrap gap-2">
              {['CSRD', 'CSDDD', 'SFDR', 'EU Taxonomy'].map((fw) => (
                <span key={fw} className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-neutral-300">
                  {fw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* API Keys */}
      <SettingsCard
        icon={Key}
        iconColor="text-amber-400"
        iconBg="bg-amber-500/10 border-amber-500/20"
        title="API Keys"
        description="External service credentials"
      >
        <div className="grid gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-neutral-400">TinyFish API Key</label>
              <a href="https://tinyfish.ai" target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#818cf8] hover:text-[#c084fc] transition-colors flex items-center gap-1">
                Get key <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
            <input
              type="password"
              value={tinyfishKey}
              onChange={(e) => setTinyfishKey(e.target.value)}
              placeholder="tf_xxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-white placeholder-neutral-600 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#818cf8]/40 focus:border-[#818cf8]/50 transition-all"
            />
          </div>
          <InputField label="Gemini API Key" value={geminiKey} onChange={setGeminiKey} type="password" placeholder="AIzaxxxxxxxxxxxxxxxxxx" mono />
          <InputField label="OpenAI API Key" value={openaiKey} onChange={setOpenaiKey} type="password" placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx" mono />
        </div>
        <p className="text-[10px] text-neutral-600 mt-3 flex items-center gap-1">
          <Shield className="h-3 w-3" /> Keys are stored locally in your browser session and never sent to our servers.
        </p>
      </SettingsCard>

      {/* Notifications */}
      <SettingsCard
        icon={Bell}
        iconColor="text-emerald-400"
        iconBg="bg-emerald-500/10 border-emerald-500/20"
        title="Notifications"
        description="Alert preferences"
      >
        <div className="space-y-3">
          {[
            { label: 'Email notifications', desc: 'Receive alerts via email', checked: alertEmail, onChange: setAlertEmail },
            { label: 'Critical violations', desc: 'Immediate alerts for critical findings', checked: alertCritical, onChange: setAlertCritical },
            { label: 'High severity', desc: 'Alerts for high-risk findings', checked: alertHigh, onChange: setAlertHigh },
            { label: 'Medium severity', desc: 'Alerts for medium-risk findings', checked: alertMedium, onChange: setAlertMedium },
          ].map((item) => (
            <label key={item.label} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/[0.02] transition-colors cursor-pointer">
              <div>
                <p className="text-sm text-white font-medium">{item.label}</p>
                <p className="text-[11px] text-neutral-500">{item.desc}</p>
              </div>
              <button
                onClick={() => item.onChange(!item.checked)}
                className={cn(
                  'w-10 h-5 rounded-full transition-colors relative',
                  item.checked ? 'bg-[#818cf8]' : 'bg-white/[0.08]'
                )}
              >
                <div className={cn(
                  'w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all',
                  item.checked ? 'left-[22px]' : 'left-0.5'
                )} />
              </button>
            </label>
          ))}
        </div>
      </SettingsCard>

      {/* Save button */}
      <motion.div variants={fadeUp} className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          className={cn(
            'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300',
            saved
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
              : 'bg-gradient-to-r from-[#818cf8] to-[#c084fc] text-white hover:shadow-[0_0_30px_rgba(129,140,248,0.3)] hover:scale-[1.02]'
          )}
        >
          {saved ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Settings Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Settings
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}
