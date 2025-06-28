import { useEffect, useRef } from 'react';

export default function SimulationCanvas({ predators, prey, food, width, height }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Очистка холста
    ctx.clearRect(0, 0, width, height);
    
    // Темный фон
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Трава
    ctx.fillStyle = '#4CAF50';
    food.forEach(f => {
      if (!f.isEaten) {
        ctx.beginPath();
        ctx.arc(f.x, f.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Жертвы
    ctx.fillStyle = '#2196F3';
    prey.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Хищники
    ctx.fillStyle = '#F44336';
    predators.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fill();
    });

  }, [predators, prey, food, width, height]);

  return <canvas 
    ref={canvasRef} 
    width={width} 
    height={height}
    style={{ border: '1px solid #444' }}
  />;
}