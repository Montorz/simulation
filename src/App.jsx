import { useState, useEffect, useCallback } from 'react';
import SimulationCanvas from './components/SimulationCanvas';
import ControlsPanel from './components/ControlsPanel';
import Predator from './models/Predator';
import Prey from './models/Prey';
import Food from './models/Food';
import './App.css';

// Параметры по умолчанию для симуляции
const DEFAULT_PARAMS = {
  predatorCount: 3,          // Начальное количество хищников
  preyCount: 20,            // Начальное количество жертв
  foodCount: 50,           // Начальное количество травы
  predatorSpeed: 2,       // Скорость хищников
  preySpeed: 1.5,           // Скорость жертв
  preyReproductionThreshold: 8,     // Сколько трав нужно жертве для размножения
  predatorReproductionThreshold: 3, // Сколько жертв нужно хищнику для размножения
  worldWidth: 2500,         // Ширина мира
  worldHeight: 2000,        // Высота мира
  preyVisionRadius: 200,    // Радиус зрения жертв
  predatorVisionRadius: 190, // Радиус зрения хищников
  poisonChance: 0.02,       // Шанс ядовитой травы
  recoveryTimeSeconds: 60   // Время восстановления травы в секундах
};

export default function App() {
  // Состояния приложения
  const [params, setParams] = useState(DEFAULT_PARAMS); // Параметры симуляции
  const [predators, setPredators] = useState([]);       // Массив хищников
  const [prey, setPrey] = useState([]);                 // Массив жертв
  const [food, setFood] = useState([]);                 // Массив травы
  const [stats, setStats] = useState({                  // Статистика
    predators: 0,
    prey: 0,
    food: 0,
    poisoned: 0
  });
  const [showVision, setShowVision] = useState(false);  // Показывать радиус зрения

  // Инициализация симуляции
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

    // Создание травы
    const newFood = Array.from({ length: params.foodCount }, () => {
      const foodItem = new Food(
        Math.random() * params.worldWidth,
        Math.random() * params.worldHeight,
        params.poisonChance
      );
      foodItem.maxRecoveryTime = params.recoveryTimeSeconds * 10; // Конвертация секунд в кадры
      return foodItem;
    });

    // Установка начальных состояний
    setPredators(newPredators);
    setPrey(newPrey);
    setFood(newFood);
    setStats({
      predators: newPredators.length,
      prey: newPrey.length,
      food: newFood.length,
      poisoned: 0
    });
  }, [params]);

  // Эффект для перезапуска симуляции при изменении ключевых параметров
  useEffect(() => {
    initSimulation();
  }, [
    params.predatorCount,
    params.preyCount,
    params.foodCount,
    params.poisonChance
  ]);

  // Эффект для обновления параметров в реальном времени
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

    // Обновление параметров травы
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
    params.recoveryTimeSeconds
  ]);

  // Основной цикл симуляции
  useEffect(() => {
    const timer = setInterval(() => {
      // Обновление состояния травы
      setFood(prev => {
        const updatedFood = [...prev];
        updatedFood.forEach(f => f.update(1)); // Обновление восстановления
        return updatedFood.filter(f => !f.isEaten || f.recoveryTime > 0); // Фильтрация съеденной травы
      });

      // Обновление хищников
      setPredators(prevPredators => {
        const newPredators = [];
        let preyToRemove = new Set(); // Индексы съеденных жертв

        const updatedPredators = prevPredators.map(p => {
          const result = p.update(prey, food);
          if (result.offspring) newPredators.push(result.offspring); // Добавление потомства
          if (result.eatenPreyIndex !== -1) preyToRemove.add(result.eatenPreyIndex); // Запись съеденных жертв
          return result.updatedPredator;
        }).filter(p => p !== null); // Фильтрация умерших хищников

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
          const result = p.update(food, predators);
          if (result.offspring) newPrey.push(result.offspring); // Добавление потомства
          return result.updatedPrey;
        }).filter(p => p !== null); // Фильтрация умерших жертв
        return [...updatedPrey, ...newPrey];
      });

      // Обновление статистики
      setStats({
        predators: predators.length,
        prey: prey.length,
        food: food.filter(f => !f.isEaten).length,
        poisoned: prey.filter(p => p.isPoisoned).length
      });
    }, 100); // Интервал обновления - 100 мс

    return () => clearInterval(timer); // Очистка таймера при размонтировании
  }, [food, prey, predators]);

  // Обработчик сброса симуляции
  const handleReset = () => {
    setParams(DEFAULT_PARAMS);
    initSimulation();
  };

  // Рендер компонента
  return (
    <div className="app-container">
      <div className="simulation-area">
        <SimulationCanvas
          predators={predators}
          prey={prey}
          food={food}
          width={params.worldWidth}
          height={params.worldHeight}
          showVision={showVision}
        />
      </div>
      
      <div className="controls-area">
        <ControlsPanel
          params={params}
          onParamsChange={setParams}
          onReset={handleReset}
          showVision={showVision}
          setShowVision={setShowVision}
          stats={stats}
        />
      </div>
    </div>
  );
}