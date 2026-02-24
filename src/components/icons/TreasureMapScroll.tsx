interface Props {
  size?: number;
  className?: string;
}

export default function TreasureMapScroll({ size = 24, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Scroll body */}
      <rect x="10" y="8" width="28" height="32" rx="2" fill="currentColor" opacity="0.15" />
      
      {/* Top roll */}
      <ellipse cx="24" cy="8" rx="16" ry="3" fill="currentColor" opacity="0.3" />
      <ellipse cx="24" cy="8" rx="16" ry="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      
      {/* Bottom roll */}
      <ellipse cx="24" cy="40" rx="16" ry="3" fill="currentColor" opacity="0.3" />
      <ellipse cx="24" cy="40" rx="16" ry="2.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      
      {/* Side borders */}
      <line x1="8" y1="8" x2="8" y2="40" stroke="currentColor" strokeWidth="1.5" />
      <line x1="40" y1="8" x2="40" y2="40" stroke="currentColor" strokeWidth="1.5" />
      
      {/* Dotted trail path */}
      <path
        d="M16 16 L22 20 L18 26 L26 28 L30 22 L34 30"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="3 2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
      
      {/* X marks the spot */}
      <line x1="32" y1="28" x2="36" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      <line x1="36" y1="28" x2="32" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
      
      {/* Small compass indicator */}
      <circle cx="16" cy="34" r="3" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4" />
      <line x1="16" y1="31.5" x2="16" y2="33" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}
