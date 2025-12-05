import { useEffect, useRef } from 'react';

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const lines: { y: number; speed: number; amplitude: number; frequency: number; offset: number }[] = [];
    const gap = 40;
    const totalLines = Math.ceil(height / gap) + 2;

    for (let i = 0; i < totalLines; i++) {
      lines.push({
        y: i * gap,
        speed: 0.002 + Math.random() * 0.003,
        amplitude: 20 + Math.random() * 30,
        frequency: 0.001 + Math.random() * 0.001,
        offset: Math.random() * 1000,
      });
    }

    let animationFrameId: number;

    const render = (time: number) => {
      ctx.fillStyle = '#1f2a2c'; // pacific midnight
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#6b8a7f'; // brighter surf lines

      lines.forEach((line) => {
        ctx.beginPath();
        for (let x = 0; x <= width; x += 10) {
          const y = line.y + Math.sin(x * line.frequency + time * line.speed + line.offset) * line.amplitude + 
                    Math.sin(x * line.frequency * 2 + time * line.speed * 1.5) * (line.amplitude / 2);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render(0);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 opacity-60"
    />
  );
}
