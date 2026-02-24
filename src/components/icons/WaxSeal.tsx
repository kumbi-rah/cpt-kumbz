interface Props {
  size?: number;
  className?: string;
}

export default function WaxSeal({ size = 20, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Wax blob - irregular circle */}
      <path
        d="M16 2C18 1.5 21 3 23 4C25 5 27 6 28 9C29 12 29 14 28 17C27 20 26 22 24 24C22 26 20 27 17 28C14 28.5 12 28 10 27C8 26 6 24 5 21C4 18 3.5 15 4 12C4.5 9 6 6 8 4.5C10 3 14 2.5 16 2Z"
        fill="currentColor"
        opacity="0.85"
      />
      {/* Anchor symbol */}
      <line x1="16" y1="9" x2="16" y2="22" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <line x1="12" y1="12" x2="20" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <path d="M11 20 C11 17 16 17 16 22 C16 17 21 17 21 20" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
      <circle cx="16" cy="8" r="1.5" stroke="white" strokeWidth="1" fill="none" opacity="0.8" />
    </svg>
  );
}
