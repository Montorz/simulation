export default class Prey {
  constructor(
    x, y, 
    speed, 
    worldWidth, worldHeight, 
    reproductionThreshold, 
    visionRadius, 
    isPoisoned = false
  ) {
    this.x = x; // Позиция X
    this.y = y; // Позиция Y
    this.speed = speed; // Скорость движения
    this.worldWidth = worldWidth; // Ширина мира
    this.worldHeight = worldHeight; // Высота мира
    this.direction = Math.random() * Math.PI * 2; // Направление движения (случайное)
    this.foodEaten = 0; // Счетчик съеденной еды
    this.reproductionThreshold = reproductionThreshold; // Сколько нужно съесть для размножения
    this.visionRadius = visionRadius; // Как далеко видит еду и хищников
    this.alive = true; // Жива ли добыча
    this.isPoisoned = isPoisoned; // Отравлена ли добыча
  }

  // Находит первую видимую еду в списке
  getVisibleFood(foodList) {
    for (const food of foodList) {
      if (!food.isEaten && this.getDistance(food) < this.visionRadius) {
        return food;
      }
    }
    return null;
  }

  // Находит первого видимого хищника в списке
  getVisiblePredators(predatorList) {
    for (const predator of predatorList) {
      if (predator.alive && this.getDistance(predator) < this.visionRadius) {
        return predator;
      }
    }
    return null;
  }

  // Убегает от хищника или идет к еде, или случайно меняет направление
  move(targetFood, closestPredator) {
    if (closestPredator) {
      // Убегаем от хищника
      this.direction = Math.atan2(this.y - closestPredator.y, this.x - closestPredator.x);
    } else if (targetFood) {
      // Идем к еде
      this.direction = Math.atan2(targetFood.y - this.y, targetFood.x - this.x);
    } else if (Math.random() < 0.05) {
      // Случайное направление (5% шанс изменить)
      this.direction = Math.random() * Math.PI * 2;
    }

    this.updatePosition();
  }

  // Пытается съесть ближайшую еду
  eat(foodList) {
    const food = this.getVisibleFood(foodList);
    if (!food || this.getDistance(food) >= 10) return false; // Слишком далеко

    if (!food.eat()) return false; // Не смогли съесть
    
    this.foodEaten++;
    if (food.isPoisonous) {
      this.isPoisoned = true; // Отравляемся, если еда ядовитая
    }
    
    return true;
  }

  // Пытается размножиться, если съел достаточно еды и не отравлен
  tryReproduce() {
    if (this.isPoisoned || this.foodEaten < this.reproductionThreshold) return null;
    
    this.foodEaten = 0; // Сбрасываем счетчик
    return this.createOffspring(); // Создаем потомка
  }

  // Основной метод обновления состояния
  update(foodList, predatorList) {
    if (!this.alive) return { updatedPrey: null, offspring: null };
    
    // Находим ближайшие еду и хищника
    const targetFood = this.getVisibleFood(foodList);
    const closestPredator = this.getVisiblePredators(predatorList);
    
    // Двигаемся, едим, пытаемся размножиться
    this.move(targetFood, closestPredator);
    this.eat(foodList);
    const offspring = this.tryReproduce();

    return {
      updatedPrey: this,
      offspring
    };
  }

  // Вспомогательные методы
  getDistance(target) {
    return Math.sqrt((this.x - target.x) ** 2 + (this.y - target.y) ** 2);
  }

  // Обновляет позицию с учетом границ мира
  updatePosition() {
    this.x = Math.max(5, Math.min(this.worldWidth - 5, this.x + Math.cos(this.direction) * this.speed));
    this.y = Math.max(5, Math.min(this.worldHeight - 5, this.y + Math.sin(this.direction) * this.speed));
  }

  // Создает потомка рядом с текущей позицией
  createOffspring() {
    return new Prey(
      this.x + (Math.random() * 30 - 15), // Случайное смещение по X
      this.y + (Math.random() * 30 - 15), // Случайное смещение по Y
      this.speed,
      this.worldWidth,
      this.worldHeight,
      this.reproductionThreshold,
      this.visionRadius,
      false // Потомок не наследует отравление
    );
  }
}