import React, { useEffect, useRef } from 'react';

export default function SimulationCanvas({
  predators,
  prey,
  food,
  bushes,
  width,
  height,
  showVision
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Очистка холста
    ctx.clearRect(0, 0, width, height);
    
    // Фон
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Отрисовка кустов
    bushes.forEach(bush => {
      // Радиус безопасности (если включено отображение радиусов)
      if (showVision) {
        ctx.beginPath();
        ctx.arc(bush.x, bush.y, bush.safeRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(34, 139, 34, 0.2)';
        ctx.stroke();
      }
      
      // Сам куст
      ctx.beginPath();
      ctx.arc(bush.x, bush.y, bush.size, 0, Math.PI * 2);
      ctx.fillStyle = bush.hidingPrey ? 'rgba(255, 215, 0, 0.7)' : 'rgba(34, 139, 34, 0.7)';
      ctx.fill();
      
      // Индикатор укрытия (если есть жертва)
      if (bush.hidingPrey) {
        ctx.beginPath();
        ctx.arc(bush.x, bush.y, bush.size + 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Отрисовка травы
    food.forEach(f => {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      
      if (f.isEaten) {
        const recoveryProgress = 1 - (f.recoveryTime / f.maxRecoveryTime);
        ctx.fillStyle = `rgba(150, 150, 150, ${0.3 + recoveryProgress * 0.7})`;
      } else {
        ctx.fillStyle = f.isPoisonous ? '#FF5555' : '#4CAF50';
      }
      
      ctx.fill();
    });

    // Отрисовка жертв (кроме спрятавшихся)
    prey.forEach(p => {
      if (!p.alive || p.isHiding) return;
      
      if (showVision) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.visionRadius, 0, Math.PI * 2);
        ctx.strokeStyle = p.isPoisoned ? 'rgba(170, 0, 255, 0.3)' : 'rgba(33, 150, 243, 0.3)';
        ctx.stroke();
      }
      
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
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
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#F44336';
      ctx.fill();
    });
  }, [predators, prey, food, bushes, width, height, showVision]);

  return (
    <canvas 
      ref={canvasRef}
      width={width}
      height={height}
      style={{ 
        border: '1px solid #444', 
        maxHeight: '95vh'
      }}
    />
  );
}