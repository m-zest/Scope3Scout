import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Shield } from 'lucide-react';
import { getDemoSuppliers } from '@/data/demoSuppliers';
import { cn } from '@/lib/utils';

const riskColors: Record<string, string> = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
  low: 'text-emerald-400',
  unknown: 'text-neutral-400',
};

interface SearchPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function SearchPalette({ open, onClose }: SearchPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const allSuppliers = useMemo(() => {
    const demo = getDemoSuppliers().map((s) => ({
      id: s.id,
      name: s.supplier_name,
      country: s.country,
      industry: s.industry,
      risk_level: s.risk_level,
      risk_score: s.risk_score,
    }));

    // Also read uploaded suppliers
    try {
      const stored = JSON.parse(localStorage.getItem('scope3scout_uploaded_suppliers') || '[]');
      const uploaded = stored.map((s: Record<string, string | number>) => ({
        id: s.id || `uploaded-${Math.random()}`,
        name: s.name || 'Unknown',
        country: s.country || 'Unknown',
        industry: s.industry || 'Unknown',
        risk_level: (s.risk_level as string) || 'unknown',
        risk_score: Number(s.risk_score) || 0,
      }));
      return [...demo, ...uploaded];
    } catch {
      return demo;
    }
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return allSuppliers;
    const q = query.toLowerCase();
    return allSuppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.industry.toLowerCase().includes(q) ||
        s.risk_level.toLowerCase().includes(q)
    );
  }, [query, allSuppliers]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex((i) => Math.min(i + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex((i) => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && results[selectedIndex]) {
        navigate(`/supplier/${results[selectedIndex].id}`);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, results, selectedIndex, navigate, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Palette */}
      <div
        className="relative w-full max-w-lg bg-neutral-950 border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
          <Search className="h-4 w-4 text-neutral-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search suppliers by name, country, industry..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-600 outline-none"
          />
          <button onClick={onClose} className="text-neutral-600 hover:text-neutral-400 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[320px] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-neutral-600">No suppliers match "{query}"</p>
            </div>
          ) : (
            results.map((supplier, i) => (
              <button
                key={supplier.id}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                  i === selectedIndex ? 'bg-[#818cf8]/10' : 'hover:bg-white/[0.03]'
                )}
                onClick={() => {
                  navigate(`/supplier/${supplier.id}`);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                  <Shield className={cn('h-3.5 w-3.5', riskColors[supplier.risk_level])} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-200 truncate">{supplier.name}</p>
                  <p className="text-[11px] text-neutral-600">{supplier.country} · {supplier.industry}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn('text-[10px] font-bold uppercase', riskColors[supplier.risk_level])}>
                    {supplier.risk_level}
                  </span>
                  {i === selectedIndex && <ArrowRight className="h-3.5 w-3.5 text-[#818cf8]" />}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/[0.06] text-[10px] text-neutral-600">
          <span className="flex items-center gap-1"><kbd className="font-mono bg-white/[0.04] px-1 py-0.5 rounded border border-white/[0.06]">↑↓</kbd> Navigate</span>
          <span className="flex items-center gap-1"><kbd className="font-mono bg-white/[0.04] px-1 py-0.5 rounded border border-white/[0.06]">Enter</kbd> Select</span>
          <span className="flex items-center gap-1"><kbd className="font-mono bg-white/[0.04] px-1 py-0.5 rounded border border-white/[0.06]">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
