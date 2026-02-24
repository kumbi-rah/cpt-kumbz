interface Props {
  size?: number;
  className?: string;
}

export default function ShipsWheel({ size = 24, className = "" }: Props) {
  const spokes = 8;
  const cx = 24;
  const cy = 24;
  const outerR = 20;
  const innerR = 8;
  const handleLen = 4;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={outerR} stroke="currentColor" strokeWidth="2.5" fill="none" />
      
      {/* Inner ring */}
      <circle cx={cx} cy={cy} r={innerR} stroke="currentColor" strokeWidth="2" fill="none" />
      
      {/* Center dot */}
      <circle cx={cx} cy={cy} r="2.5" fill="currentColor" />
      
      {/* Spokes with handles */}
      {Array.from({ length: spokes }).map((_, i) => {
        const angle = (i * 360) / spokes;
        const rad = (angle * Math.PI) / 180;
        const x1 = cx + innerR * Math.cos(rad);
        const y1 = cy + innerR * Math.sin(rad);
        const x2 = cx + outerR * Math.cos(rad);
        const y2 = cy + outerR * Math.sin(rad);
        // Handle knob at end of spoke
        const hx = cx + (outerR + handleLen) * Math.cos(rad);
        const hy = cy + (outerR + handleLen) * Math.sin(rad);
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1={x2} y1={y2} x2={hx} y2={hy} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        );
      })}
    </svg>
  );
}
