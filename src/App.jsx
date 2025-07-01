import { useState, useEffect, useCallback } from 'react';
import SimulationCanvas from './components/SimulationCanvas';
import ControlsPanel from './components/ControlsPanel';
import Predator from './models/Predator';
import Prey from './models/Prey';
import Food from './models/Food';
import Bush from './models/Bush';
import './App.css';

const DEFAULT_PARAMS = {
  predatorCount: 3,
  preyCount: 20,
  foodCount: 50,
  bushCount: 10,
  bushSafeRadius: 150,
  predatorSpeed: 2,
  preySpeed: 1.5,
  preyReproductionThreshold: 8,
  predatorReproductionThreshold: 3,
  worldWidth: 2500,
  worldHeight: 2000,
  preyVisionRadius: 200,
  predatorVisionRadius: 190,
  poisonChance: 0.02,
  recoveryTimeSeconds: 60
};

export default function App() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [predators, setPredators] = useState([]);
  const [prey, setPrey] = useState([]);
  const [food, setFood] = useState([]);
  const [bushes, setBushes] = useState([]);
  const [stats, setStats] = useState({
    predators: 0,
    prey: 0,
    hidingPrey: 0,
    food: 0,
    poisoned: 0
  });
  const [showVision, setShowVision] = useState(false);

  const initBushes = useCallback(() => {
    const newBushes = [];
    let attempts = 0;

    while (newBushes.length < params.bushCount && attempts < params.bushCount * 2) {
      const bush = new Bush(
        Math.random() * params.worldWidth,
        Math.random() * params.worldHeight,
        params.worldWidth,
        params.worldHeight
      );
      bush.safeRadius = params.bushSafeRadius;

      const tooClose = newBushes.some(existingBush => {
        const dx = bush.x - existingBush.x;
        const dy = bush.y - existingBush.y;
        return Math.sqrt(dx * dx + dy * dy) < bush.size * 2;
      });

      if (!tooClose) {
        newBushes.push(bush);
      }
      attempts++;
    }

    setBushes(newBushes);
  }, [params.bushCount, params.bushSafeRadius, params.worldWidth, params.worldHeight]);

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

    initBushes();
    initFood();

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

  useEffect(() => {
    initSimulation();
  }, [
    params.predatorCount,
    params.preyCount,
    params.foodCount,
    params.bushCount,
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

    setBushes(prev => prev.map(b => {
      b.safeRadius = params.bushSafeRadius;
      return b;
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
    params.bushSafeRadius,
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
          const result = p.update(prey, bushes);
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
          const result = p.update(food, predators, bushes);
          if (result.offspring) newPrey.push(result.offspring);
          return result.updatedPrey;
        }).filter(p => p !== null);
        return [...updatedPrey, ...newPrey];
      });

      setStats({
        predators: predators.length,
        prey: prey.length,
        hidingPrey: bushes.filter(b => b.hidingPrey !== null).length,
        food: food.filter(f => !f.isEaten).length,
        poisoned: prey.filter(p => p.isPoisoned).length
      });
    }, 100);

    return () => clearInterval(timer);
  }, [predators, prey, food, bushes]);

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
          bushes={bushes}
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
          bushes={bushes}
        />
      </div>
    </div>
  );
}