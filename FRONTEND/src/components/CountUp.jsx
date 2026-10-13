import React, { useEffect, useState, useRef } from 'react';

/**
 * High-performance smooth CountUp component
 * Animates numbers on mount or value change using requestAnimationFrame
 */
export default function CountUp({ 
  value,
  end, 
  duration = 1000, 
  decimals = 0, 
  prefix = '', 
  suffix = '', 
  className = '' 
}) {
  const targetNumber = Number(value !== undefined ? value : (end !== undefined ? end : 0)) || 0;
  const [displayValue, setDisplayValue] = useState(0);
  const startTimestampRef = useRef(null);
  const startValueRef = useRef(0);
  const targetValueRef = useRef(targetNumber);

  useEffect(() => {
    const target = Number(value !== undefined ? value : (end !== undefined ? end : 0)) || 0;
    startValueRef.current = displayValue;
    targetValueRef.current = target;
    startTimestampRef.current = null;

    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestampRef.current) startTimestampRef.current = timestamp;
      const elapsed = timestamp - startTimestampRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth easeOutExpo / easeOutCubic curve
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = startValueRef.current + (targetValueRef.current - startValueRef.current) * easeProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(targetValueRef.current);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [value, duration]);

  const formatted = decimals > 0 
    ? displayValue.toFixed(decimals) 
    : Math.round(displayValue).toLocaleString();

  return (
    <span className={`inline-block tabular-nums transition-all ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  );
}
