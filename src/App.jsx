import { useState, useEffect, useCallback } from 'react';
import SimulationCanvas from './components/SimulationCanvas';
import ControlsPanel from './components/ControlsPanel';
import Predator from './models/Predator';
import Prey from './models/Prey';
import Food from './models/Food';
import './App.css';

export default function App() {
  // Параметры симуляции
  const [params, setParams] = useState({
    predatorCount: 3,
    preyCount: 15,
    foodCount: 30,
    predatorSpeed: 1.0,
    preySpeed: 1.2,
    preyReproductionChance: 5,
    foodRegrowthRate: 3
  });

  // Состояния агентов
  const [predators, setPredators] = useState([]);
  const [prey, setPrey] = useState([]);
  const [food, setFood] = useState([]);
  const [stats, setStats] = useState({
    cycles: 0,
    maxPrey: 0,
    maxPredators: 0,
    isRunning: true
  });

  // Инициализация симуляции
  const initSimulation = useCallback(() => {
    // Создаем хищников
    const newPredators = Array(params.predatorCount).fill().map(() => (
      new Predator(
        Math.random() * 800,
        Math.random() * 600,
        params.predatorSpeed,
        100
      )
    ));

    // Создаем жертв
    const newPrey = Array(params.preyCount).fill().map(() => (
      new Prey(
        Math.random() * 800,
        Math.random() * 600,
        params.preySpeed
      )
    ));

    // Создаем еду
    const newFood = Array(params.foodCount).fill().map(() => (
      new Food(
        Math.random() * 800,
        Math.random() * 600
      )
    ));

    setPredators(newPredators);
    setPrey(newPrey);
    setFood(newFood);
    setStats({
      cycles: 0,
      maxPrey: params.preyCount,
      maxPredators: params.predatorCount,
      isRunning: true
    });
  }, [params]);

  // Главный цикл симуляции
  useEffect(() => {
    if (!stats.isRunning) return;

    const timer = setInterval(() => {
      setStats(prevStats => ({ ...prevStats, cycles: prevStats.cycles + 1 }));

      // Обновление еды
      setFood(prevFood => {
        const remainingFood = prevFood.filter(f => !f.isEaten);
        const newFoodCount = Math.min(
          params.foodRegrowthRate,
          params.foodCount - remainingFood.length
        );
        const newFood = Array(newFoodCount).fill().map(() => (
          new Food(Math.random() * 800, Math.random() * 600)
        ));
        return [...remainingFood, ...newFood].slice(0, params.foodCount);
      });

      // Обновление жертв
      setPrey(prevPrey => {
        const newPrey = [];
        const updatedPrey = prevPrey
          .filter(p => p.isAlive)
          .map(p => {
            const offspring = p.update(food, params.preyReproductionChance);
            if (offspring) newPrey.push(offspring);
            return p;
          });
        return [...updatedPrey, ...newPrey];
      });

      // Обновление хищников
      setPredators(prevPredators => 
        prevPredators
          .map(p => {
            p.update(prey);
            return p;
          })
          .filter(p => p.energy > 0)
      );

    }, 150);

    return () => clearInterval(timer);
  }, [stats.isRunning, params, food, prey]);

  // Первый запуск
  useEffect(() => {
    initSimulation();
  }, [initSimulation]);

  return (
    <div className="app">
      <h1>Симуляция экосистемы Хищник-Жертва</h1>
      
      <ControlsPanel
        params={params}
        onParamsChange={setParams}
        onReset={initSimulation}
      />

      <div className="stats">
        <p>Циклов: {stats.cycles}</p>
        <p>Хищников: {predators.length} (макс: {stats.maxPredators})</p>
        <p>Жертв: {prey.length} (макс: {stats.maxPrey})</p>
        <p>Травы: {food.filter(f => !f.isEaten).length}/{params.foodCount}</p>
      </div>

      <SimulationCanvas
        predators={predators}
        prey={prey}
        food={food}
      />
    </div>
  );
}