import { useState, useEffect, useRef } from 'react';

const useCountUp = (target, duration = 800) => {
  const [value, setValue] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    const numTarget = typeof target === 'number' ? target : parseInt(target, 10);
    if (isNaN(numTarget)) {
      setValue(0);
      return;
    }

    const startVal = prevTarget.current;
    prevTarget.current = numTarget;
    const diff = numTarget - startVal;
    if (diff === 0) {
      setValue(numTarget);
      return;
    }

    let startTime = null;
    let animId;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // ease-out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setValue(Math.round(startVal + diff * eased));
      if (progress < 1) {
        animId = requestAnimationFrame(step);
      }
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [target, duration]);

  return value;
};

export default useCountUp;
