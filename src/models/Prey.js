export default class Prey {
  constructor(
    x, y, 
    speed, 
    worldWidth, worldHeight, 
    reproductionThreshold, 
    visionRadius, 
    isPoisoned = false
  ) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.direction = Math.random() * Math.PI * 2;
    this.foodEaten = 0;
    this.reproductionThreshold = reproductionThreshold;
    this.visionRadius = visionRadius;
    this.alive = true;
    this.isPoisoned = isPoisoned;
    this.isHiding = false;
    this.currentBush = null;
  }

  getVisibleFood(foodList) {
    for (const food of foodList) {
      if (!food.isEaten && this.getDistance(food) < this.visionRadius) {
        return food;
      }
    }
    return null;
  }

  getVisiblePredators(predatorList) {
    for (const predator of predatorList) {
      if (predator.alive && this.getDistance(predator) < this.visionRadius) {
        return predator;
      }
    }
    return null;
  }

  getNearestBush(bushList) {
    for (const bush of bushList) {
      if (!bush.hidingPrey && this.getDistance(bush) < this.visionRadius) {
        return bush;
      }
    }
    return null;
  }

  move(targetFood, closestPredator, nearestBush, bushList) {
    if (this.isHiding) return;

    if (closestPredator && nearestBush) {
      // Бежим к кусту
      this.direction = Math.atan2(nearestBush.y - this.y, nearestBush.x - this.x);
      
      // Если достигли куста - прячемся
      if (this.getDistance(nearestBush) <= nearestBush.size) {
        nearestBush.hidePrey(this);
        this.isHiding = true;
        this.currentBush = nearestBush;
      }
    } else if (closestPredator) {
      // Убегаем от хищника
      this.direction = Math.atan2(this.y - closestPredator.y, this.x - closestPredator.x);
    } else if (targetFood) {
      // Идем к еде
      this.direction = Math.atan2(targetFood.y - this.y, targetFood.x - this.x);
    } else if (Math.random() < 0.05) {
      // Случайное направление
      this.direction = Math.random() * Math.PI * 2;
    }

    this.updatePosition();
  }

  eat(foodList) {
    if (this.isHiding) return false;

    const food = this.getVisibleFood(foodList);
    if (!food || this.getDistance(food) >= 10) return false;

    if (!food.eat()) return false;
    
    this.foodEaten++;
    if (food.isPoisonous) {
      this.isPoisoned = true;
    }
    
    return true;
  }

  tryReproduce() {
    if (this.isPoisoned || this.foodEaten < this.reproductionThreshold || this.isHiding) {
      return null;
    }
    
    this.foodEaten = 0;
    return this.createOffspring();
  }

  update(foodList, predatorList, bushList) {
    if (!this.alive) return { updatedPrey: null, offspring: null };
    
    // Если прячется в кусте
    if (this.isHiding && this.currentBush) {
      // Проверяем, можно ли выйти
      if (!this.currentBush.isPredatorNear(predatorList)) {
        this.isHiding = false;
        // Выходим из куста с небольшим смещением
        const angle = Math.random() * Math.PI * 2;
        this.x = this.currentBush.x + Math.cos(angle) * (this.currentBush.size + 5);
        this.y = this.currentBush.y + Math.sin(angle) * (this.currentBush.size + 5);
        this.currentBush.releasePrey();
        this.currentBush = null;
      }
      return { updatedPrey: this, offspring: null };
    }

    // Обычное поведение
    const targetFood = this.getVisibleFood(foodList);
    const closestPredator = this.getVisiblePredators(predatorList);
    const nearestBush = this.getNearestBush(bushList);

    this.move(targetFood, closestPredator, nearestBush, bushList);
    this.eat(foodList);
    const offspring = this.tryReproduce();

    return { updatedPrey: this, offspring };
  }

  getDistance(target) {
    return Math.sqrt((this.x - target.x) ** 2 + (this.y - target.y) ** 2);
  }

  updatePosition() {
    this.x = Math.max(5, Math.min(this.worldWidth - 5, this.x + Math.cos(this.direction) * this.speed));
    this.y = Math.max(5, Math.min(this.worldHeight - 5, this.y + Math.sin(this.direction) * this.speed));
  }

  createOffspring() {
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
}