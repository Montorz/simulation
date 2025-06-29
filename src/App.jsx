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
    preyReproductionThreshold: 5,
    predatorReproductionThreshold: 3,
    worldWidth: 800,
    worldHeight: 600,
    preyVisionRadius: 120,
    predatorVisionRadius: 100
  });

  const [predators, setPredators] = useState([]);
  const [prey, setPrey] = useState([]);
  const [food, setFood] = useState([]);
  const [stats, setStats] = useState({ cycles: 0 });
  const [showVision, setShowVision] = useState(false);

  const initSimulation = useCallback(() => {
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

      setFood(prev => prev.filter(f => !f.isEaten));

      setPredators(prevPredators => {
        const newPredators = [];
        let preyToRemove = new Set();

        const updatedPredators = prevPredators.map(p => {
          const result = p.update(prey);
          if (result.offspring) newPredators.push(result.offspring);
          if (result.eatenPreyIndex !== -1) preyToRemove.add(result.eatenPreyIndex);
          return result.updatedPredator;
        });

        if (preyToRemove.size > 0) {
          setPrey(prev => prev.filter((_, index) => !preyToRemove.has(index)));
        }

        return [...updatedPredators, ...newPredators];
      });

      setPrey(prev => {
        const newPrey = [];
        const updatedPrey = prev.map(p => {
          const result = p.update(food, predators);
          if (result.offspring) newPrey.push(result.offspring);
          return result.updatedPrey;
        }).filter(p => p !== null);
        return [...updatedPrey, ...newPrey];
      });

    }, 100);

    return () => clearInterval(timer);
  }, [food, prey, predators]);

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
        showVision={showVision}
        setShowVision={setShowVision}
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
        showVision={showVision}
      />
    </div>
  );
}