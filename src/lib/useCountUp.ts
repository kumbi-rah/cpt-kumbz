import { useState, useEffect, useRef } from "react";

export function useCountUp(target: number, duration = 1200): number {
  const [value, setValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === 0) { setValue(0); return; }
    const from = prevTarget.current;
    prevTarget.current = target;
    startTime.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - (startTime.current || now);
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return value;
}
