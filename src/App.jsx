import { useState, useEffect, useCallback } from 'react';
import SimulationCanvas from './components/SimulationCanvas';
import ControlsPanel from './components/ControlsPanel';
import Predator from './models/Predator';
import Prey from './models/Prey';
import Food from './models/Food';
import Bush from './models/Bush';
import './App.css';

// Параметры симуляции по умолчанию
const DEFAULT_PARAMS = {
  predatorCount: 3,              // Начальное количество хищников
  preyCount: 10,                 // Начальное количество жертв
  foodCount: 50,                 // Начальное количество еды
  bushCount: 2,                  // Количество кустов
  bushSafeRadius: 300,           // Радиус безопасности кустов
  predatorSpeed: 2,              // Скорость хищников
  preySpeed: 1.8,                // Скорость жертв
  preyReproductionThreshold: 8,  // Порог размножения жертв
  predatorReproductionThreshold: 3, // Порог размножения хищников
  worldWidth: 2500,              // Ширина мира
  worldHeight: 2000,             // Высота мира
  preyVisionRadius: 180,         // Радиус обзора жертв
  predatorVisionRadius: 200,     // Радиус обзора хищников
  poisonChance: 0.02,            // Вероятность ядовитой еды
  recoveryTimeSeconds: 60        // Время восстановления еды (сек)
};

export default function App() {
  // Состояния приложения
  const [params, setParams] = useState(DEFAULT_PARAMS); // Параметры симуляции
  const [predators, setPredators] = useState([]);       // Массив хищников
  const [prey, setPrey] = useState([]);                 // Массив жертв
  const [food, setFood] = useState([]);                 // Массив еды
  const [bushes, setBushes] = useState([]);             // Массив кустов
  const [stats, setStats] = useState({                  // Статистика
    predators: 0,
    prey: 0,
    hidingPrey: 0,
    food: 0,
    poisoned: 0
  });
  const [showVision, setShowVision] = useState(false);  // Показать радиусы зрения

  // Инициализация кустов с проверкой на перекрытие
  const initBushes = useCallback(() => {
    const newBushes = [];
    let attempts = 0;
    const bushSize = 30; // Размер куста (радиус)
    const minDistance = bushSize * 2; // Минимальное расстояние между кустами

    while (newBushes.length < params.bushCount && attempts < params.bushCount * 2) {
      // Рассчитываем допустимые координаты с учетом радиуса безопасности
      const safeMargin = Math.max(params.bushSafeRadius, bushSize);
      const minX = safeMargin;
      const maxX = params.worldWidth - safeMargin;
      const minY = safeMargin;
      const maxY = params.worldHeight - safeMargin;

      // Генерируем координаты в пределах безопасной зоны
      const x = Math.max(minX, Math.min(maxX, Math.random() * params.worldWidth));
      const y = Math.max(minY, Math.min(maxY, Math.random() * params.worldHeight));

      const bush = new Bush(x, y, params.worldWidth, params.worldHeight);
      bush.safeRadius = Math.min(
        params.bushSafeRadius,
        Math.min(
          x - bushSize,
          params.worldWidth - x - bushSize,
          y - bushSize,
          params.worldHeight - y - bushSize
        )
      );

      // Проверка на пересечение с другими кустами
      const tooClose = newBushes.some(existingBush => {
        const dx = bush.x - existingBush.x;
        const dy = bush.y - existingBush.y;
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
      });

      // Проверка что радиус безопасности не стал отрицательным
      if (!tooClose && bush.safeRadius > 0) {
        newBushes.push(bush);
      }
      attempts++;
    }

    setBushes(newBushes);
  }, [params.bushCount, params.bushSafeRadius, params.worldWidth, params.worldHeight]);

  // Инициализация еды с проверкой нахождения внутри кустов
  const initFood = useCallback(() => {
    const newFood = Array.from({ length: params.foodCount }, () => {
      const foodItem = new Food(
        Math.random() * params.worldWidth,
        Math.random() * params.worldHeight,
        params.poisonChance,
        bushes,
        params.worldWidth,
        params.worldHeight
      );
      foodItem.maxRecoveryTime = params.recoveryTimeSeconds * 10;
      return foodItem;
    });
    setFood(newFood);
  }, [params.foodCount, params.poisonChance, params.recoveryTimeSeconds, bushes, params.worldWidth, params.worldHeight]);

  // Основная инициализация симуляции
  const initSimulation = useCallback(() => {
    // Создание хищников
    const newPredators = Array.from({ length: params.predatorCount }, () => (
      new Predator(
        Math.random() * params.worldWidth,
        Math.random() * params.worldHeight,
        params.predatorSpeed,
        params.worldWidth,
        params.worldHeight,
        params.predatorReproductionThreshold,
        params.predatorVisionRadius
      )
    ));

    // Создание жертв
    const newPrey = Array.from({ length: params.preyCount }, () => (
      new Prey(
        Math.random() * params.worldWidth,
        Math.random() * params.worldHeight,
        params.preySpeed,
        params.worldWidth,
        params.worldHeight,
        params.preyReproductionThreshold,
        params.preyVisionRadius
      )
    ));

    // Инициализация кустов и еды
    initBushes();
    initFood();

    // Установка начальных состояний
    setPredators(newPredators);
    setPrey(newPrey);
    setStats({
      predators: newPredators.length,
      prey: newPrey.length,
      hidingPrey: 0,
      food: params.foodCount,
      poisoned: 0
    });
  }, [params, initBushes, initFood]);

  // Эффект для первичной инициализации и перезапуска при изменении ключевых параметров (полностью изменяет симуляцию)
  useEffect(() => {
    initSimulation();
  }, [
    params.predatorCount,
    params.preyCount,
    params.foodCount,
    params.bushCount,
    params.poisonChance
  ]);

  // Эффект для обновления параметров существ при их изменении (онлайн изменение симуляции)
  useEffect(() => {
    // Обновление параметров хищников
    setPredators(prev => prev.map(p => {
      p.speed = params.predatorSpeed;
      p.visionRadius = params.predatorVisionRadius;
      p.reproductionThreshold = params.predatorReproductionThreshold;
      return p;
    }));

    // Обновление параметров жертв
    setPrey(prev => prev.map(p => {
      p.speed = params.preySpeed;
      p.visionRadius = params.preyVisionRadius;
      p.reproductionThreshold = params.preyReproductionThreshold;
      return p;
    }));

    // Обновление параметров кустов
    setBushes(prev => prev.map(b => {
      b.safeRadius = params.bushSafeRadius;
      return b;
    }));

    // Обновление параметров еды
    setFood(prev => prev.map(f => {
      f.maxRecoveryTime = params.recoveryTimeSeconds * 10;
      return f;
    }));
  }, [
    params.predatorSpeed,
    params.preySpeed,
    params.predatorVisionRadius,
    params.preyVisionRadius,
    params.predatorReproductionThreshold,
    params.preyReproductionThreshold,
    params.bushSafeRadius,
    params.recoveryTimeSeconds
  ]);

  // Основной игровой цикл
  useEffect(() => {
    const timer = setInterval(() => {
      // Обновление состояния еды
      setFood(prev => {
        const updatedFood = [...prev];
        updatedFood.forEach(f => f.update(1)); // Обновление таймеров восстановления
        return updatedFood.filter(f => !f.isEaten || f.recoveryTime > 0); // Удаление полностью съеденной еды
      });

      // Обновление хищников
      setPredators(prevPredators => {
        const newPredators = [];
        let preyToRemove = new Set();

        const updatedPredators = prevPredators.map(p => {
          const result = p.update(prey, bushes); // Обновление состояния хищника
          if (result.offspring) newPredators.push(result.offspring); // Добавление потомков
          if (result.eatenPreyIndex !== -1) preyToRemove.add(result.eatenPreyIndex); // Отметить съеденных жертв
          return result.updatedPredator;
        }).filter(p => p !== null); // Удаление мертвых хищников

        // Удаление съеденных жертв
        if (preyToRemove.size > 0) {
          setPrey(prev => prev.filter((_, index) => !preyToRemove.has(index)));
        }

        return [...updatedPredators, ...newPredators];
      });

      // Обновление жертв
      setPrey(prev => {
        const newPrey = [];
        const updatedPrey = prev.map(p => {
          const result = p.update(food, predators, bushes); // Обновление состояния жертвы
          if (result.offspring) newPrey.push(result.offspring); // Добавление потомков
          return result.updatedPrey;
        }).filter(p => p !== null); // Удаление мертвых жертв
        return [...updatedPrey, ...newPrey];
      });

      // Обновление статистики
      setStats({
        predators: predators.length,
        prey: prey.length,
        hidingPrey: bushes.filter(b => b.hidingPrey !== null).length,
        food: food.filter(f => !f.isEaten).length,
        poisoned: prey.filter(p => p.isPoisoned).length
      });
    }, 100); // Интервал обновления - 100 мс

    return () => clearInterval(timer); // Очистка таймера
  }, [predators, prey, food, bushes]);

  // Обработчик сброса симуляции
  const handleReset = () => {
    setParams(DEFAULT_PARAMS);
    initSimulation();
  };

  // Рендер компонента
  return (
    <div className="app-container">
      {/* Область отрисовки симуляции */}
      <div className="simulation-area">
        <SimulationCanvas
          predators={predators}
          prey={prey}
          food={food}
          bushes={bushes}
          width={params.worldWidth}
          height={params.worldHeight} 
          showVision={showVision}
        />
      </div>
      
      {/* Панель управления */}
      <div className="controls-area">
        <ControlsPanel
          params={params}
          onParamsChange={setParams}
          onReset={handleReset}
          showVision={showVision}
          setShowVision={setShowVision}
          stats={stats}
          bushes={bushes}
        />
      </div>
    </div>
  );
}