import { useState, useEffect, useCallback } from 'react';
import SimulationCanvas from './components/SimulationCanvas';
import ControlsPanel from './components/ControlsPanel';
import Predator from './models/Predator';
import Prey from './models/Prey';
import Food from './models/Food';
import './App.css';

const DEFAULT_PARAMS = {
  predatorCount: 8,
  preyCount: 40,
  foodCount: 150,
  predatorSpeed: 1.2,
  preySpeed: 1.5,
  preyReproductionThreshold: 4,
  predatorReproductionThreshold: 2,
  worldWidth: 1500,
  worldHeight: 1500,
  preyVisionRadius: 140,
  predatorVisionRadius: 160,
  poisonChance: 0.05,
  recoveryTimeSeconds: 20
};

export default function App() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
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

    const newFood = Array.from({ length: params.foodCount }, () => {
      const foodItem = new Food(
        Math.random() * params.worldWidth,
        Math.random() * params.worldHeight,
        params.poisonChance
      );
      foodItem.maxRecoveryTime = params.recoveryTimeSeconds * 10;
      return foodItem;
    });

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
    initSimulation();
  }, [
    params.predatorCount,
    params.preyCount,
    params.foodCount,
    params.poisonChance
  ]);

  useEffect(() => {
    setPredators(prev => prev.map(p => {
      p.speed = params.predatorSpeed;
      p.visionRadius = params.predatorVisionRadius;
      p.reproductionThreshold = params.predatorReproductionThreshold;
      return p;
    }));

    setPrey(prev => prev.map(p => {
      p.speed = params.preySpeed;
      p.visionRadius = params.preyVisionRadius;
      p.reproductionThreshold = params.preyReproductionThreshold;
      return p;
    }));

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

  useEffect(() => {
    const timer = setInterval(() => {
      setFood(prev => {
        const updatedFood = [...prev];
        updatedFood.forEach(f => f.update(1));
        return updatedFood.filter(f => !f.isEaten || f.recoveryTime > 0);
      });

      setPredators(prevPredators => {
        const newPredators = [];
        let preyToRemove = new Set();

        const updatedPredators = prevPredators.map(p => {
          const result = p.update(prey, food);
          if (result.offspring) newPredators.push(result.offspring);
          if (result.eatenPreyIndex !== -1) preyToRemove.add(result.eatenPreyIndex);
          return result.updatedPredator;
        }).filter(p => p !== null);

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

      setStats({
        predators: predators.length,
        prey: prey.length,
        food: food.filter(f => !f.isEaten).length,
        poisoned: prey.filter(p => p.isPoisoned).length
      });
    }, 100);

    return () => clearInterval(timer);
  }, [food, prey, predators]);

  const handleReset = () => {
    setParams(DEFAULT_PARAMS);
    initSimulation();
  };

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