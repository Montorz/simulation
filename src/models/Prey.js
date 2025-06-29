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
    this.direction = Math.random() * Math.PI * 2; // Текущее направление
    this.targetDirection = this.direction; // Целевое направление
    this.turnSpeed = 0.1; // Скорость поворота
    this.foodEaten = 0; // Счетчик съеденной травы
    this.reproductionThreshold = reproductionThreshold; // Порог размножения
    this.visionRadius = visionRadius; // Радиус зрения
    this.targetFood = null; // Текущая цель (еда)
    this.alive = true; // Флаг жизненного состояния
    this.isPoisoned = isPoisoned; // Флаг отравленности
  }

  // Поиск видимой еды
  getVisibleFood(foodList) {
    // Фильтрация не съеденной еды в радиусе зрения
    const visibleFood = foodList.filter(f => 
      !f.isEaten && this.getDistance(f) < this.visionRadius
    );
    
    // Если нет видимой еды
    if (!visibleFood.length) return null;

    // Поиск ближайшей еды
    return visibleFood.reduce((closest, food) => {
      const distance = this.getDistance(food);
      return distance < closest.distance 
        ? { food, distance } 
        : closest;
    }, { distance: Infinity }).food;
  }

  // Поиск ближайшего хищника
  getVisiblePredators(predatorList) {
    return predatorList.reduce((closest, predator) => {
      if (!predator.alive) return closest;
      
      const distance = this.getDistance(predator);
      // Проверка радиуса зрения и расстояния
      return distance < this.visionRadius && distance < (closest?.distance || Infinity) 
        ? { predator, distance } 
        : closest;
    }, null)?.predator || null;
  }

  // Движение жертвы
  move(targetFood, closestPredator) {
    // Если есть хищник - убегаем от него
    if (closestPredator) {
      this.targetDirection = Math.atan2(
        this.y - closestPredator.y,
        this.x - closestPredator.x
      );
    } 
    // Если есть еда - двигаемся к ней
    else if (targetFood) {
      this.targetDirection = Math.atan2(
        targetFood.y - this.y,
        targetFood.x - this.x
      );
    } 
    // Случайное блуждание
    else if (Math.random() < 0.02) {
      this.targetDirection = Math.random() * Math.PI * 2;
    }

    // Плавный поворот
    this.direction += (this.targetDirection - this.direction) * this.turnSpeed;
    this.updatePosition();
  }

  // Поедание травы
  eat(foodList) {
    // Проверка наличия цели и расстояния
    if (!this.targetFood || this.targetFood.isEaten || this.getDistance(this.targetFood) >= 10) {
      return false;
    }

    // Попытка съесть
    if (!this.targetFood.eat()) return false;
    
    this.foodEaten++;
    // Проверка на ядовитую траву
    if (this.targetFood.isPoisonous) {
      this.isPoisoned = true;
    }
    
    return true;
  }

  // Попытка размножения
  tryReproduce() {
    // Отравленные не размножаются
    if (this.isPoisoned || this.foodEaten < this.reproductionThreshold) return null;
    
    this.foodEaten = 0; // Сброс счетчика
    return this.createOffspring(); // Создание потомка
  }

  // Основное обновление состояния
  update(foodList, predatorList) {
    if (!this.alive) return { updatedPrey: null, offspring: null };
    
    // Поиск цели и хищников
    this.targetFood = this.getVisibleFood(foodList);
    const closestPredator = this.getVisiblePredators(predatorList);
    
    this.move(this.targetFood, closestPredator); // Движение
    this.eat(foodList); // Поедание
    const offspring = this.tryReproduce(); // Размножение

    return {
      updatedPrey: this,
      offspring
    };
  }

  // Вспомогательные методы:

  // Расчет расстояния до цели
  getDistance(target) {
    return Math.sqrt((this.x - target.x) ** 2 + (this.y - target.y) ** 2);
  }

  // Обновление позиции с учетом границ мира
  updatePosition() {
    this.x = Math.max(5, Math.min(
      this.worldWidth - 5, 
      this.x + Math.cos(this.direction) * this.speed
    ));
    this.y = Math.max(5, Math.min(
      this.worldHeight - 5, 
      this.y + Math.sin(this.direction) * this.speed
    ));
  }

  // Создание потомка
  createOffspring() {
    return new Prey(
      this.x + (Math.random() * 30 - 15), // Случайное смещение
      this.y + (Math.random() * 30 - 15),
      this.speed,
      this.worldWidth,
      this.worldHeight,
      this.reproductionThreshold,
      this.visionRadius,
      false // Потомок не наследует отравленность
    );
  }
}