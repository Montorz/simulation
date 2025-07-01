import React, { useEffect, useRef } from 'react';

export default function SimulationCanvas({
  predators,   // Массив хищников
  prey,        // Массив жертв
  food,        // Массив еды
  bushes,      // Массив кустов
  width,
  height, 
  showVision   // Флаг отображения радиусов обзора
}) {
  const canvasRef = useRef(null);  // Ссылка на canvas элемент

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Очистка холста перед каждой отрисовкой
    ctx.clearRect(0, 0, width, height);
    
    // Отрисовка фона (темно-серый)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Отрисовка кустов
    bushes.forEach(bush => {
      // Если включено отображение радиусов то рисуем безопасную зону
      if (showVision) {
        ctx.beginPath();
        ctx.arc(bush.x, bush.y, bush.safeRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(34, 139, 34, 0.2)';  // Полупрозрачный зеленый
        ctx.stroke();
      }
      
      // Отрисовка самого куста
      ctx.beginPath();
      ctx.arc(bush.x, bush.y, bush.size, 0, Math.PI * 2);
      // Если в кусте прячется жертва то золотистый цвет, иначе зеленый
      ctx.fillStyle = bush.hidingPrey ? 'rgba(255, 215, 0, 0.7)' : 'rgba(34, 139, 34, 0.7)';
      ctx.fill();
      
      // Если в кусте есть жертва то рисуем белую обводку
      if (bush.hidingPrey) {
        ctx.beginPath();
        ctx.arc(bush.x, bush.y, bush.size + 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Отрисовка еды (травы)
    food.forEach(f => {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      
      if (f.isEaten) {
        // Для съеденной еды зависящей от времени восстановления
        const recoveryProgress = 1 - (f.recoveryTime / f.maxRecoveryTime);
        ctx.fillStyle = `rgba(150, 150, 150, ${0.3 + recoveryProgress * 0.7})`;
      } else {
        // Для несъеденной еды (зеленый/красный)
        ctx.fillStyle = f.isPoisonous ? '#FF5555' : '#4CAF50';
      }
      
      ctx.fill();
    });

    // Отрисовка жертв
    prey.forEach(p => {
      if (!p.alive || p.isHiding) return;
      
      // Отрисовка радиуса обзора
      if (showVision) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.visionRadius, 0, Math.PI * 2);
        // Фиолетовый для отравленных, синий для обычных
        ctx.strokeStyle = p.isPoisoned ? 'rgba(170, 0, 255, 0.3)' : 'rgba(33, 150, 243, 0.3)';
        ctx.stroke();
      }
      
      // Отрисовка самой жертвы
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = p.isPoisoned ? '#AA00FF' : '#2196F3';  // Фиолетовый или синий
      ctx.fill();
    });

    // Отрисовка хищников
    predators.forEach(p => {
      if (!p.alive) return;
      
      // Отрисовка радиуса обзора
      if (showVision) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.visionRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(244, 67, 54, 0.3)';  // Полупрозрачный красный
        ctx.stroke();
      }
      
      // Отрисовка самого хищника
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = '#F44336';  // Красный
      ctx.fill();
    });
  }, [predators, prey, food, bushes, width, height, showVision]);  // Зависимости эффекта

  return (
    <canvas 
      ref={canvasRef}  // Привязка ссылки
      width={width}    // Ширина canvas
      height={height}  // Высота canvas
      style={{ 
        border: '1px solid #444',  // Серая рамка
        maxHeight: '95vh'          // Максимальная высота 
      }}
    />
  );
}