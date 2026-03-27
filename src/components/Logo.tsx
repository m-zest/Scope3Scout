interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 28, className = '' }: LogoProps) {
  return (
    <img
      src="/logo.svg"
      alt="Scope3Scout"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

export function LogoMark({ size = 28, className = '' }: LogoProps) {
  return (
    <div
      className={`rounded-lg bg-gradient-to-br from-[#818cf8] via-[#c084fc] to-[#e879f9] flex items-center justify-center shadow-[0_0_12px_rgba(129,140,248,0.4)] shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src="/logo.svg"
        alt="Scope3Scout"
        width={size * 0.65}
        height={size * 0.65}
        style={{ width: size * 0.65, height: size * 0.65, filter: 'brightness(2) saturate(0) invert(1)' }}
      />
    </div>
  );
}
