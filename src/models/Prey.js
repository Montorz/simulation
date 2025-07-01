export default class Prey {
  // Конструктор класса Prey
  constructor(
    x, y,
    speed,
    worldWidth,
    worldHeight,
    reproductionThreshold,  // Порог еды для размножения
    visionRadius,   // Радиус обзора
    isPoisoned = false  // Отравлена ли жертва
  ) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.direction = Math.random() * Math.PI * 2; // Начальное направление движения
    this.foodEaten = 0; // Количество съеденной еды
    this.reproductionThreshold = reproductionThreshold; // Порог для размножения
    this.visionRadius = visionRadius; // Видимый радиус
    this.alive = true; // Жива ли жертва
    this.isPoisoned = isPoisoned;
    this.isHiding = false; // Прячется ли в кусте
    this.currentBush = null; // Куст в котором прячется
  }

   // --- Все функции находят в радиусе обзора --- ///

  // Находим видимую не съеденную еду
  getVisibleFood(foodList) {
    for (const food of foodList) {
      if (!food.isEaten && this.getDistance(food) < this.visionRadius) {
        return food;
      }
    }
    return null;
  }

  // Находим ближайшего живого хищника
  getVisiblePredators(predatorList) {
    for (const predator of predatorList) {
      if (predator.alive && this.getDistance(predator) < this.visionRadius) {
        return predator;
      }
    }
    return null;
  }

  // Находит ближайший свободный куст
  getNearestBush(bushList) {
    for (const bush of bushList) {
      if (!bush.hidingPrey && this.getDistance(bush) < this.visionRadius) {
        return bush;
      }
    }
    return null;
  }

  // Логика движения жертвы
  move(targetFood, closestPredator, nearestBush, bushList) {
    if (this.isHiding) return; // Если прячется то не двигается

    if (closestPredator && nearestBush) {
      // Если есть хищник и куст то бежим к кусту
      this.direction = Math.atan2(nearestBush.y - this.y, nearestBush.x - this.x);
      
      // Если достигли куста то прячемся
      if (this.getDistance(nearestBush) <= nearestBush.size) {
        nearestBush.hidePrey(this);
        this.isHiding = true;
        this.currentBush = nearestBush;
      }
    } else if (closestPredator) {
      // Если есть хищник то убегаем от него
      this.direction = Math.atan2(this.y - closestPredator.y, this.x - closestPredator.x);
    } else if (targetFood) {
      // Если есть еда то идем к ней
      this.direction = Math.atan2(targetFood.y - this.y, targetFood.x - this.x);
    } else if (Math.random() < 0.05) {
      // 5% шанс сменить направление случайным образом
      this.direction = Math.random() * Math.PI * 2;
    }

    this.updatePosition();
  }

  // Поедание еды
  eat(foodList) {
    if (this.isHiding) return false; // Если прячется то не ест

    const food = this.getVisibleFood(foodList);
    if (!food || this.getDistance(food) >= 10) return false; // Проверка расстояния до еды

    if (!food.eat()) return false; // Пытаемся съесть еду
    
    this.foodEaten++;
    if (food.isPoisonous) {
      this.isPoisoned = true; // Если еда ядовитая то отравляемся
    }
    
    return true;
  }

  // Попытка размножения
  tryReproduce() {
    if (this.isPoisoned || this.foodEaten < this.reproductionThreshold || this.isHiding) {
      return null;
    }
    
    this.foodEaten = 0; // Сбрасываем счетчик еды
    return this.createOffspring(); // Создаем потомка
  }

  // Основной метод обновления состояния жертвы
  update(foodList, predatorList, bushList) {
    if (!this.alive) return { updatedPrey: null, offspring: null };
    
    // Логика выхода из куста
    if (this.isHiding && this.currentBush) {
      // Выходим если рядом нет хищников
      if (!this.currentBush.isPredatorNear(predatorList)) {
        this.isHiding = false;
        // Выходим с небольшим случайным смещением
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

  // Расчет расстояния до цели
  getDistance(target) {
    return Math.sqrt((this.x - target.x) ** 2 + (this.y - target.y) ** 2);
  }

  // Обновление позиции с учетом границ мира
  updatePosition() {
    this.x = Math.max(5, Math.min(this.worldWidth - 5, this.x + Math.cos(this.direction) * this.speed));
    this.y = Math.max(5, Math.min(this.worldHeight - 5, this.y + Math.sin(this.direction) * this.speed));
  }

  // Создание потомка
  createOffspring() {
    return new Prey(
      this.x + (Math.random() * 30 - 15), // Случайное смещение по x
      this.y + (Math.random() * 30 - 15), // Случайное смещение по y
      this.speed,
      this.worldWidth,
      this.worldHeight,
      this.reproductionThreshold,
      this.visionRadius,
      false // Потомок не наследует отравление
    );
  }
}