import { useRef, useEffect } from "react";

const ClickSpark = ({
  sparkColor = "#00FF87",
  sparkSize = 6,
  sparkCount = 8,
  duration = 400,
}) => {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let animationFrameId;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = performance.now() - spark.startTime;
        if (elapsed >= duration) return false;

        const progress = elapsed / duration;
        const easeOutQuad = 1 - (1 - progress) * (1 - progress);
        
        
        const distance = easeOutQuad * 40; 
        
        const opacity = 1 - progress; 

        ctx.save();
        ctx.beginPath();
        
        ctx.strokeStyle = spark.id % 2 === 0 ? sparkColor : "#00D2FF";
        ctx.lineWidth = sparkSize * (1 - progress);
        ctx.lineCap = "round";

        const angle = spark.angle;
        const startX = spark.x + Math.cos(angle) * (distance * 0.2);
        const startY = spark.y + Math.sin(angle) * (distance * 0.2);
        const endX = spark.x + Math.cos(angle) * distance;
        const endY = spark.y + Math.sin(angle) * distance;

        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.globalAlpha = opacity;
        ctx.stroke();
        ctx.restore();

        return true;
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleCanvasClick = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      const now = performance.now();

      
      for (let i = 0; i < sparkCount; i++) {
        const angle = (i * 2 * Math.PI) / sparkCount + Math.random() * 0.5;
        sparksRef.current.push({
          id: Math.random(),
          x,
          y,
          angle,
          startTime: now,
        });
      }
    };

    
    window.addEventListener("click", handleCanvasClick);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("click", handleCanvasClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [sparkColor, sparkSize, sparkCount, duration]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none", 
        zIndex: 99999, 
      }}
    />
  );
};

export default ClickSpark;