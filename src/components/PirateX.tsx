interface Props {
  className?: string;
  size?: number;
}

export default function PirateX({ className = "", size = 32 }: Props) {
  // Random rotation between -8 and 8 degrees for hand-painted feel
  const rotation = Math.random() * 16 - 8;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* First stroke of X (top-left to bottom-right) */}
      <path
        d="M 15 15 Q 30 25, 45 45 T 85 85"
        stroke="#8B4513"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      
      {/* Second stroke of X (top-right to bottom-left) */}
      <path
        d="M 85 15 Q 70 25, 55 45 T 15 85"
        stroke="#8B4513"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      
      {/* Subtle texture overlay for painted look */}
      <path
        d="M 15 15 Q 31 26, 46 46 T 85 85"
        stroke="#654321"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
      
      <path
        d="M 85 15 Q 69 26, 54 46 T 15 85"
        stroke="#654321"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
}
