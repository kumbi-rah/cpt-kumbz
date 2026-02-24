interface Props {
  className?: string;
}

export default function RopeDivider({ className = "" }: Props) {
  return (
    <div className={`flex items-center gap-3 py-2 ${className}`}>
      <div className="flex-1 h-px relative">
        <svg width="100%" height="6" viewBox="0 0 200 6" preserveAspectRatio="none" className="w-full">
          <path
            d="M0,3 Q10,0 20,3 T40,3 T60,3 T80,3 T100,3 T120,3 T140,3 T160,3 T180,3 T200,3"
            stroke="hsl(var(--vintage-amber))"
            strokeWidth="1.5"
            fill="none"
            opacity="0.4"
          />
          <path
            d="M0,3 Q10,6 20,3 T40,3 T60,3 T80,3 T100,3 T120,3 T140,3 T160,3 T180,3 T200,3"
            stroke="hsl(var(--vintage-amber))"
            strokeWidth="1.5"
            fill="none"
            opacity="0.25"
          />
        </svg>
      </div>
    </div>
  );
}
