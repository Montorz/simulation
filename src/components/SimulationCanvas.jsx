import { useEffect, useRef } from 'react';

export default function SimulationCanvas({ predators, prey, food, width, height, showVision }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Очистка холста
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Отрисовка травы
    food.forEach(f => {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fillStyle = f.isEaten 
        ? `rgba(150, 150, 150, ${0.3 + (1 - f.recoveryTime / f.maxRecoveryTime) * 0.7})` 
        : f.isPoisonous ? '#FF5555' : '#4CAF50';
      ctx.fill();
    });

    // Отрисовка жертв
    prey.forEach(p => {
      if (!p.alive) return;
      
      if (showVision) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.visionRadius, 0, Math.PI * 2);
        ctx.strokeStyle = p.isPoisoned ? 'rgba(170, 0, 255, 0.3)' : 'rgba(33, 150, 243, 0.3)';
        ctx.stroke();
      }
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = p.isPoisoned ? '#AA00FF' : '#2196F3';
      ctx.fill();
    });

    // Отрисовка хищников
    predators.forEach(p => {
      if (!p.alive) return;
      
      if (showVision) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.visionRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(244, 67, 54, 0.3)';
        ctx.stroke();
      }
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#F44336';
      ctx.fill();
    });
  }, [predators, prey, food, width, height, showVision]);

  return (
    <canvas 
      ref={canvasRef}
      width={width}
      height={height}
      style={{ border: '1px solid #444', maxHeight: '95vh' }}
    />
  );
}