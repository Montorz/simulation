import { useEffect, useRef } from 'react';

export default function SimulationCanvas({ predators, prey, food, width, height, showVision }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw food
    ctx.fillStyle = '#4CAF50';
    food.forEach(f => {
      if (!f.isEaten) {
        ctx.beginPath();
        ctx.arc(f.x, f.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw prey vision if enabled
    if (showVision) {
      prey.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.visionRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(33, 150, 243, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // Draw prey
    ctx.fillStyle = '#2196F3';
    prey.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw predator vision if enabled
    if (showVision) {
      predators.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.visionRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(244, 67, 54, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // Draw predators
    ctx.fillStyle = '#F44336';
    predators.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fill();
    });

  }, [predators, prey, food, width, height, showVision]);

  return <canvas 
    ref={canvasRef} 
    width={width} 
    height={height}
    style={{ border: '1px solid #444' }}
  />;
}