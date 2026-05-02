// Compact country badge: flag emoji + ISO code.
// Returns null when country is unknown so callers can pass anything safely.

import { getCountryInfo } from '@/lib/countries';
import { cn } from '@/lib/utils';

interface CountryBadgeProps {
  country: string | null | undefined;
  variant?: 'inline' | 'pill';
  className?: string;
}

export function CountryBadge({ country, variant = 'inline', className }: CountryBadgeProps) {
  const info = getCountryInfo(country);
  if (!info) return null;

  if (variant === 'pill') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[10px] font-bold tracking-wider text-neutral-300',
          className,
        )}
      >
        <span aria-hidden>{info.flag}</span>
        <span>{info.code}</span>
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-1 text-[12px] text-neutral-400', className)}>
      <span aria-hidden>{info.flag}</span>
      <span className="font-mono text-[10px] font-bold tracking-wider text-neutral-500">{info.code}</span>
    </span>
  );
}
