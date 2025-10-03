"use client";

export default function AbstractIllustration({ alt, icon: Icon, palette, id, className = "h-full w-full" }) {
  const fallbackId = id || "abstract-illustration";
  const colors = {
    primary: palette?.primary ?? "#f3f4f6",
    secondary: palette?.secondary ?? "#cbd5f5",
    accent: palette?.accent ?? "#e5e7eb",
    highlight: palette?.highlight ?? "#a855f7",
    icon: palette?.icon ?? "#4b5563"
  };
  const gradientId = `blob-${fallbackId}`;
  const accentId = `accent-${fallbackId}`;

  return (
    <div className={`relative ${className}`}>
      <svg className="h-full w-full" viewBox="0 0 160 160" role="img" aria-label={alt}>
        <title>{alt}</title>
        <defs>
          <radialGradient id={gradientId} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={colors.primary} stopOpacity="0.95" />
            <stop offset="100%" stopColor={colors.secondary} stopOpacity="0.25" />
          </radialGradient>
          <radialGradient id={accentId} cx="50%" cy="50%" r="48%">
            <stop offset="0%" stopColor={colors.highlight} stopOpacity="0.6" />
            <stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="160" height="160" rx="48" fill={`url(#${gradientId})`} />
        <circle cx="44" cy="42" r="24" fill={`url(#${accentId})`} />
        <circle cx="118" cy="112" r="20" fill={colors.accent} opacity="0.55" />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {Icon ? <Icon className="h-16 w-16" aria-hidden="true" style={{ color: colors.icon }} /> : null}
      </div>
      <span className="sr-only">{alt}</span>
    </div>
  );
}
