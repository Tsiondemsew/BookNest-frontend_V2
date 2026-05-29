'use client';

import { useEffect, useState } from 'react';

export function AnimatedCounter({
  value,
  className = '',
}: {
  value: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = display;
    const end = value;
    if (start === end) return;

    const duration = 600;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- animate from last rendered value
  }, [value]);

  return <span className={className}>{display.toLocaleString()}</span>;
}
