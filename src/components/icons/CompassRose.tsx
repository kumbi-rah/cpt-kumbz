interface Props {
  size?: number;
  className?: string;
}

export default function CompassRose({ size = 24, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer circle */}
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="0.75" opacity="0.2" />

      {/* Main compass points - N/S diamond */}
      <polygon points="24,2 27,20 24,24 21,20" fill="currentColor" opacity="0.9" />
      <polygon points="24,46 27,28 24,24 21,28" fill="currentColor" opacity="0.4" />

      {/* E/W diamond */}
      <polygon points="46,24 28,21 24,24 28,27" fill="currentColor" opacity="0.4" />
      <polygon points="2,24 20,21 24,24 20,27" fill="currentColor" opacity="0.4" />

      {/* Diagonal points */}
      <polygon points="38,10 28,21 24,24 27,20" fill="currentColor" opacity="0.25" />
      <polygon points="10,38 20,27 24,24 21,28" fill="currentColor" opacity="0.25" />
      <polygon points="38,38 28,27 24,24 27,28" fill="currentColor" opacity="0.25" />
      <polygon points="10,10 20,21 24,24 21,20" fill="currentColor" opacity="0.25" />

      {/* Center dot */}
      <circle cx="24" cy="24" r="2.5" fill="currentColor" />

      {/* Cardinal labels */}
      <text x="24" y="9" textAnchor="middle" fill="currentColor" fontSize="5" fontWeight="bold" fontFamily="Cinzel, Georgia, serif" opacity="0.7">N</text>
      <text x="24" y="44" textAnchor="middle" fill="currentColor" fontSize="5" fontWeight="bold" fontFamily="Cinzel, Georgia, serif" opacity="0.7">S</text>
      <text x="42" y="26" textAnchor="middle" fill="currentColor" fontSize="5" fontWeight="bold" fontFamily="Cinzel, Georgia, serif" opacity="0.7">E</text>
      <text x="6" y="26" textAnchor="middle" fill="currentColor" fontSize="5" fontWeight="bold" fontFamily="Cinzel, Georgia, serif" opacity="0.7">W</text>
    </svg>
  );
}
