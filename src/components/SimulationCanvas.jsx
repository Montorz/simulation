import { useEffect, useRef } from 'react';

export default function SimulationCanvas({
  predators,  // Массив хищников
  prey,       // Массив жертв
  food,       // Массив травы
  width,      // Ширина холста
  height,     // Высота холста
  showVision  // Флаг показа радиусов зрения
}) {
  const canvasRef = useRef(null); // Ссылка на canvas элемент

  // Эффект для отрисовки симуляции
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Очистка холста
    ctx.clearRect(0, 0, width, height);
    // Заливка фона
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);
    
    // Отрисовка травы
    food.forEach(f => {
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      
      // Выбор цвета в зависимости от состояния травы
      if (f.isEaten) {
        // Градация серого для восстанавливающейся травы
        const recoveryProgress = 1 - (f.recoveryTime / f.maxRecoveryTime);
        ctx.fillStyle = `rgba(150, 150, 150, ${0.3 + recoveryProgress * 0.7})`;
      } else {
        // Красный для ядовитой, зеленый для обычной травы
        ctx.fillStyle = f.isPoisonous ? '#FF5555' : '#4CAF50';
      }
      
      ctx.fill();
    });

    // Отрисовка жертв
    prey.forEach(p => {
      if (!p.alive) return; // Пропуск мертвых жертв
      
      // Отрисовка радиуса зрения если нужно
      if (showVision) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.visionRadius, 0, Math.PI * 2);
        // Полупрозрачный цвет в зависимости от состояния
        ctx.strokeStyle = p.isPoisoned ? 'rgba(170, 0, 255, 0.3)' : 'rgba(33, 150, 243, 0.3)';
        ctx.stroke();
      }
      
      // Отрисовка самой жертвы
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      // Фиолетовый для отравленных, синий для обычных
      ctx.fillStyle = p.isPoisoned ? '#AA00FF' : '#2196F3';
      ctx.fill();
    });

    // Отрисовка хищников
    predators.forEach(p => {
      if (!p.alive) return; // Пропуск мертвых хищников
      
      // Отрисовка радиуса зрения если нужно
      if (showVision) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.visionRadius, 0, Math.PI * 2);
        // Полупрозрачный красный
        ctx.strokeStyle = 'rgba(244, 67, 54, 0.3)';
        ctx.stroke();
      }
      
      // Отрисовка самого хищника
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      // Красный цвет
      ctx.fillStyle = '#F44336';
      ctx.fill();
    });
  }, [predators, prey, food, width, height, showVision]);

  return (
    <canvas 
      ref={canvasRef}
      width={width}
      height={height}
      style={{ 
        border: '1px solid #444', 
        maxHeight: '95vh' // Ограничение максимальной высоты
      }}
    />
  );
}