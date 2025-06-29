export default class Prey {
  constructor(x, y, speed, worldWidth, worldHeight, reproductionThreshold, visionRadius, isPoisoned = false) {
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
    this.alive = true;
    this.isPoisoned = isPoisoned;
  }

  getVisibleFood(foodList) {
    const visibleFood = foodList.filter(f => !f.isEaten && this.getDistance(f) < this.visionRadius);
    if (!visibleFood.length) return null;

    return visibleFood.reduce((closest, food) => {
      const distance = this.getDistance(food);
      return distance < closest.distance ? { food, distance } : closest;
    }, { distance: Infinity }).food;
  }

  getVisiblePredators(predatorList) {
    return predatorList.reduce((closest, predator) => {
      if (!predator.alive) return closest;
      
      const distance = this.getDistance(predator);
      return distance < this.visionRadius && distance < (closest?.distance || Infinity) 
        ? { predator, distance } 
        : closest;
    }, null)?.predator || null;
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

    this.direction += (this.targetDirection - this.direction) * this.turnSpeed;
    this.updatePosition();
  }

  eat(foodList) {
    if (!this.targetFood || this.targetFood.isEaten || this.getDistance(this.targetFood) >= 10) {
      return false;
    }

    if (!this.targetFood.eat()) return false;
    
    this.foodEaten++;
    if (this.targetFood.isPoisonous) {
      this.isPoisoned = true;
    }
    
    return true;
  }

  tryReproduce() {
    if (this.isPoisoned || this.foodEaten < this.reproductionThreshold) return null;
    
    this.foodEaten = 0;
    return new Prey(
      this.x + (Math.random() * 30 - 15),
      this.y + (Math.random() * 30 - 15),
      this.speed,
      this.worldWidth,
      this.worldHeight,
      this.reproductionThreshold,
      this.visionRadius,
      false
    );
  }

  update(foodList, predatorList) {
    if (!this.alive) return { updatedPrey: null, offspring: null };
    
    this.targetFood = this.getVisibleFood(foodList);
    const closestPredator = this.getVisiblePredators(predatorList);
    
    this.move(this.targetFood, closestPredator);
    this.eat(foodList);
    const offspring = this.tryReproduce();

    return {
      updatedPrey: this,
      offspring
    };
  }

  getDistance(target) {
    return Math.sqrt((this.x - target.x) ** 2 + (this.y - target.y) ** 2);
  }

  updatePosition() {
    this.x = Math.max(5, Math.min(this.worldWidth - 5, this.x + Math.cos(this.direction) * this.speed));
    this.y = Math.max(5, Math.min(this.worldHeight - 5, this.y + Math.sin(this.direction) * this.speed));
  }
}