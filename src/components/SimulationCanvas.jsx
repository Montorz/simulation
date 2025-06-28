import { useEffect, useRef } from 'react';
import Predator from '../models/Predator';
import Prey from '../models/Prey';
import Food from '../models/Food';

export default function SimulationCanvas({ predators, prey, food }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Очистка холста
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Отрисовка еды (зеленые круги)
    food.forEach(f => {
      if (!f.isEaten) {
        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.arc(f.x, f.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Отрисовка жертв (синие круги)
    prey.forEach(p => {
      if (p.isAlive) {
        ctx.fillStyle = 'blue';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Отрисовка хищников (красные круги)
    predators.forEach(p => {
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
      ctx.fill();
    });

  }, [predators, prey, food]);

  return <canvas ref={canvasRef} width={800} height={600} />;
}