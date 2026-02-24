interface Props {
  className?: string;
}

export default function RopeDivider({ className = "" }: Props) {
  return (
    <div className={`w-full py-2 ${className}`}>
      <svg width="100%" height="20" viewBox="0 0 400 20" preserveAspectRatio="none" className="w-full">
        {/* Main twisted rope strand */}
        <path
          d="M0,10 Q5,4 10,10 T20,10 T30,10 T40,10 T50,10 T60,10 T70,10 T80,10 T90,10 T100,10 T110,10 T120,10 T130,10 T140,10 T150,10 T160,10 T170,10 T180,10 T190,10 T200,10 T210,10 T220,10 T230,10 T240,10 T250,10 T260,10 T270,10 T280,10 T290,10 T300,10 T310,10 T320,10 T330,10 T340,10 T350,10 T360,10 T370,10 T380,10 T390,10 T400,10"
          stroke="hsl(33 20% 37%)"
          strokeWidth="2.5"
          fill="none"
          opacity="0.4"
        />
        {/* Counter-twist strand */}
        <path
          d="M0,10 Q5,16 10,10 T20,10 T30,10 T40,10 T50,10 T60,10 T70,10 T80,10 T90,10 T100,10 T110,10 T120,10 T130,10 T140,10 T150,10 T160,10 T170,10 T180,10 T190,10 T200,10 T210,10 T220,10 T230,10 T240,10 T250,10 T260,10 T270,10 T280,10 T290,10 T300,10 T310,10 T320,10 T330,10 T340,10 T350,10 T360,10 T370,10 T380,10 T390,10 T400,10"
          stroke="hsl(33 20% 37%)"
          strokeWidth="2"
          fill="none"
          opacity="0.25"
        />
        {/* Highlight strand */}
        <path
          d="M0,9 Q5,5 10,9 T20,9 T30,9 T40,9 T50,9 T60,9 T70,9 T80,9 T90,9 T100,9 T110,9 T120,9 T130,9 T140,9 T150,9 T160,9 T170,9 T180,9 T190,9 T200,9 T210,9 T220,9 T230,9 T240,9 T250,9 T260,9 T270,9 T280,9 T290,9 T300,9 T310,9 T320,9 T330,9 T340,9 T350,9 T360,9 T370,9 T380,9 T390,9 T400,9"
          stroke="hsl(34 40% 50%)"
          strokeWidth="1"
          fill="none"
          opacity="0.15"
        />
      </svg>
    </div>
  );
}
