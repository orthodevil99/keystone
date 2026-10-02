export default function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-label="Keystone logo">
      {/* arch */}
      <path
        d="M7 34V19C7 11.8 12.8 6 20 6s13 5.8 13 13v15"
        stroke="#F4F1E8"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* keystone — the wedge that locks the arch */}
      <path d="M16.5 6.5h7l-1.6 7.2a3 3 0 0 1-2.9 2.3 3 3 0 0 1-2.9-2.3L16.5 6.5Z" fill="#DFAF5E" />
      {/* base stones */}
      <path d="M4 34h9M27 34h9" stroke="#F4F1E8" strokeWidth="2.4" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}
