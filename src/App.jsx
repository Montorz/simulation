import { useState, useEffect, useCallback } from 'react';
import SimulationCanvas from './components/SimulationCanvas';
import ControlsPanel from './components/ControlsPanel';
import Predator from './models/Predator';
import Prey from './models/Prey';
import Food from './models/Food';
import './App.css';

export default function App() {
  const [params, setParams] = useState({
    predatorCount: 5,
    preyCount: 20,
    foodCount: 100,
    predatorSpeed: 0.8,
    preySpeed: 1.0,
    preyReproductionChance: 10,
    worldWidth: 800,
    worldHeight: 600,
    preyHungerThreshold: 5
  });

  const [predators, setPredators] = useState([]);
  const [prey, setPrey] = useState([]);
  const [food, setFood] = useState([]);
  const [stats, setStats] = useState({ cycles: 0 });

  const initSimulation = useCallback(() => {
    // Создаем хищников
    const newPredators = Array.from({ length: params.predatorCount }, () => (
      new Predator(
        Math.random() * params.worldWidth,
        Math.random() * params.worldHeight,
        params.predatorSpeed,
        params.worldWidth,
        params.worldHeight
      )
    ));

    // Создаем жертв
    const newPrey = Array.from({ length: params.preyCount }, () => (
      new Prey(
        Math.random() * params.worldWidth,
        Math.random() * params.worldHeight,
        params.preySpeed,
        params.worldWidth,
        params.worldHeight,
        params.preyHungerThreshold
      )
    ));

    // Создаем еду
    const newFood = Array.from({ length: params.foodCount }, () => (
      new Food(
        Math.random() * params.worldWidth,
        Math.random() * params.worldHeight
      )
    ));

    setPredators(newPredators);
    setPrey(newPrey);
    setFood(newFood);
    setStats({ cycles: 0 });
  }, [params]);

  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => ({ cycles: prev.cycles + 1 }));

      // Обновление еды (удаляем съеденную)
      setFood(prev => prev.filter(f => !f.isEaten));

      // Обновление жертв
      setPrey(prev => {
        const newPrey = [];
        const updatedPrey = prev.map(p => {
          const result = p.update(food);
          if (result.offspring) newPrey.push(result.offspring);
          return result.updatedPrey;
        }).filter(p => p !== null);
        return [...updatedPrey, ...newPrey];
      });

      // Обновление хищников
      setPredators(prev => 
        prev.map(p => {
          p.update(prey);
          return p;
        })
      );

    }, 100);

    return () => clearInterval(timer);
  }, [food, prey]);

  useEffect(() => {
    initSimulation();
  }, [initSimulation]);

  return (
    <div className="app">
      <h1>Экосистема Хищник-Жертва</h1>
      
      <ControlsPanel
        params={params}
        onParamsChange={setParams}
        onReset={initSimulation}
      />

      <div className="stats">
        <p>Циклов: {stats.cycles}</p>
        <p>Хищников: {predators.length}</p>
        <p>Жертв: {prey.length}</p>
        <p>Травы: {food.filter(f => !f.isEaten).length}/{params.foodCount}</p>
      </div>

      <SimulationCanvas
        predators={predators}
        prey={prey}
        food={food}
        width={params.worldWidth}
        height={params.worldHeight}
      />
    </div>
  );
}