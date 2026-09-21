import React, { useEffect, useState } from "react";

export function AnimatedNumber({ value, duration = 800, prefix = "", suffix = "", decimals = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const num = Number(value);
    if (isNaN(num)) {
      setDisplayValue(value);
      return;
    }

    let start = 0;
    const end = num;
    const startTime = performance.now();

    const updateNumber = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        setDisplayValue(end);
      }
    };

    requestAnimationFrame(updateNumber);
  }, [value, duration]);

  const formatted = typeof displayValue === "number"
    ? displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })
    : displayValue;

  return <span>{prefix}{formatted}{suffix}</span>;
}
