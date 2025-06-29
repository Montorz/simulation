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
    worldWidth: 1500,
    worldHeight: 1500,
    preyVisionRadius: 120,
    predatorVisionRadius: 100,
    poisonChance: 0.1,
    poisonDuration: 100
  });

  const [predators, setPredators] = useState([]);
  const [prey, setPrey] = useState([]);
  const [food, setFood] = useState([]);
  const [stats, setStats] = useState({ 
    predators: 0,
    prey: 0,
    food: 0,
    poisoned: 0
  });
  const [showVision, setShowVision] = useState(false);
  const [isRunning, setIsRunning] = useState(true);

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
    setStats({
      predators: newPredators.length,
      prey: newPrey.length,
      food: newFood.length,
      poisoned: 0
    });
  }, [params]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setFood(prev => prev.filter(f => !f.isEaten));

      setPredators(prevPredators => {
        const newPredators = [];
        let preyToRemove = new Set();
        let predatorDied = false;

        const updatedPredators = prevPredators.map(p => {
          const result = p.update(prey, food);
          if (result.offspring) newPredators.push(result.offspring);
          if (result.eatenPreyIndex !== -1) preyToRemove.add(result.eatenPreyIndex);
          if (result.predatorDied) predatorDied = true;
          return result.updatedPredator;
        }).filter(p => p !== null);

        if (preyToRemove.size > 0) {
          setPrey(prev => prev.filter((_, index) => !preyToRemove.has(index)));
        }

        return predatorDied ? updatedPredators.filter(p => p !== null) : [...updatedPredators, ...newPredators];
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

      setStats({
        predators: predators.length,
        prey: prey.length,
        food: food.filter(f => !f.isEaten).length,
        poisoned: prey.filter(p => p.isPoisoned).length
      });

    }, 100);

    return () => clearInterval(timer);
  }, [isRunning, food, prey, predators]);

  useEffect(() => {
    initSimulation();
  }, [initSimulation]);

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
          onReset={initSimulation}
          showVision={showVision}
          setShowVision={setShowVision}
          isRunning={isRunning}
          setIsRunning={setIsRunning}
          stats={stats}
        />
      </div>
    </div>
  );
}