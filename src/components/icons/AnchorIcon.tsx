interface Props {
  size?: number;
  className?: string;
}

export default function AnchorIcon({ size = 24, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Ring at top */}
      <circle cx="24" cy="10" r="4" stroke="currentColor" strokeWidth="2.5" fill="none" />
      
      {/* Vertical shank */}
      <line x1="24" y1="14" x2="24" y2="42" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Horizontal crossbar */}
      <line x1="16" y1="22" x2="32" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Left fluke */}
      <path
        d="M24 42 C24 42 10 38 10 30"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="10" cy="30" r="2" fill="currentColor" />
      
      {/* Right fluke */}
      <path
        d="M24 42 C24 42 38 38 38 30"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="38" cy="30" r="2" fill="currentColor" />
    </svg>
  );
}
