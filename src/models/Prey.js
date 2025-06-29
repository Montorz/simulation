export default class Prey {
  constructor(x, y, speed, worldWidth, worldHeight, reproductionThreshold, visionRadius) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.direction = Math.random() * Math.PI * 2;
    this.targetDirection = this.direction;
    this.turnSpeed = 0.1;
    this.foodEaten = 0;
    this.reproductionThreshold = reproductionThreshold;
    this.visionRadius = visionRadius;
    this.targetFood = null;
    this.foodMemory = [];
    this.alive = true;
    this.isPoisoned = false;
    this.poisonDuration = 0;
  }

  getVisibleFood(foodList) {
    const visibleFood = foodList.filter(f => 
      !f.isEaten && 
      Math.sqrt((this.x - f.x) ** 2 + (this.y - f.y) ** 2) < this.visionRadius
    );

    this.foodMemory = visibleFood.slice(0, 3);
    
    if (visibleFood.length > 0) {
      return visibleFood.reduce((closest, food) => {
        const dist = Math.sqrt((this.x - food.x) ** 2 + (this.y - food.y) ** 2);
        return dist < closest.distance ? { food, distance: dist } : closest;
      }, { food: visibleFood[0], distance: Infinity }).food;
    }
    return null;
  }

  getVisiblePredators(predatorList) {
    let closestPredator = null;
    let minDistance = Infinity;

    predatorList.forEach(predator => {
      if (!predator.alive) return;
      const distance = Math.sqrt((this.x - predator.x) ** 2 + (this.y - predator.y) ** 2);
      if (distance < this.visionRadius && distance < minDistance) {
        minDistance = distance;
        closestPredator = predator;
      }
    });

    return closestPredator;
  }

  move(targetFood, closestPredator) {
    if (closestPredator) {
      this.targetDirection = Math.atan2(
        this.y - closestPredator.y,
        this.x - closestPredator.x
      );
    } else if (targetFood) {
      this.targetDirection = Math.atan2(
        targetFood.y - this.y,
        targetFood.x - this.x
      );
    } else if (Math.random() < 0.02) {
      this.targetDirection = Math.random() * Math.PI * 2;
    }

    this.direction = this.direction + 
      (this.targetDirection - this.direction) * this.turnSpeed;

    this.x = Math.max(5, Math.min(
      this.worldWidth - 5, 
      this.x + Math.cos(this.direction) * this.speed
    ));
    this.y = Math.max(5, Math.min(
      this.worldHeight - 5, 
      this.y + Math.sin(this.direction) * this.speed
    ));
  }

  eat(foodList) {
    if (!this.targetFood || this.targetFood.isEaten) return false;

    const distance = Math.sqrt(
      (this.x - this.targetFood.x) ** 2 + 
      (this.y - this.targetFood.y) ** 2
    );

    if (distance < 10) {
      this.targetFood.isEaten = true;
      this.foodEaten++;
      
      if (this.targetFood.isPoisonous) {
        this.isPoisoned = true;
        this.poisonDuration = 100;
      }
      
      return true;
    }
    return false;
  }

  tryReproduce() {
    if (this.foodEaten >= this.reproductionThreshold) {
      this.foodEaten = 0;
      return new Prey(
        this.x + (Math.random() * 30 - 15),
        this.y + (Math.random() * 30 - 15),
        this.speed,
        this.worldWidth,
        this.worldHeight,
        this.reproductionThreshold,
        this.visionRadius
      );
    }
    return null;
  }

  update(foodList, predatorList) {
    if (!this.alive) return { updatedPrey: null, offspring: null };
    
    if (this.isPoisoned) {
      this.poisonDuration--;
      if (this.poisonDuration <= 0) {
        this.isPoisoned = false;
      }
    }
    
    this.targetFood = this.getVisibleFood(foodList);
    const closestPredator = this.getVisiblePredators(predatorList);
    
    this.move(this.targetFood, closestPredator);
    this.eat(foodList);
    const offspring = this.tryReproduce();

    return {
      updatedPrey: this,
      offspring: offspring
    };
  }
}