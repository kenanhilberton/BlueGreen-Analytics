import { useEffect, useRef } from 'react';

export default function CountUp({ to, from = 0, duration = 1.5, suffix = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    let start = from;
    const end = parseInt(to);
    if (start === end) return;

    // JavaScript daxili rəvan animasiya mexanizmi
    const totalMiliseconds = duration * 1000;
    const frameRate = 1000 / 60; // 60fps üçün
    const totalFrames = Math.round(totalMiliseconds / frameRate);
    let currentFrame = 0;

    const counter = setInterval(() => {
      currentFrame++;
      const progress = currentFrame / totalFrames;
      const easeOutQuad = progress * (2 - progress); // Sona yaxın yumşaq yavaşlama
      
      const currentValue = Math.round(from + (end - from) * easeOutQuad);
      
      if (ref.current) {
        ref.current.textContent = currentValue;
      }

      if (currentFrame >= totalFrames) {
        clearInterval(counter);
        if (ref.current) ref.current.textContent = end;
      }
    }, frameRate);

    return () => clearInterval(counter);
  }, [to, from, duration]);

  return <span ref={ref}>{from}</span>;
}