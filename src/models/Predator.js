export default class Predator {
  constructor(x, y, speed, worldWidth, worldHeight, reproductionThreshold, visionRadius) {
    this.x = x; // Позиция X
    this.y = y; // Позиция Y
    this.speed = speed; // Скорость движения
    this.worldWidth = worldWidth; // Ширина мира
    this.worldHeight = worldHeight; // Высота мира
    this.direction = Math.random() * Math.PI * 2; // Направление движения
    this.targetDirection = this.direction; // Целевое направление
    this.turnSpeed = 0.1; // Скорость поворота
    this.preyEaten = 0; // Счетчик съеденных жертв
    this.reproductionThreshold = reproductionThreshold; // Порог для размножения
    this.visionRadius = visionRadius; // Радиус зрения
    this.targetPrey = null; // Текущая цель
    this.huntingCooldown = 0; // Время между сменами целей
    this.alive = true; // Флаг жизненного состояния
  }

  // Поиск видимой добычи
  getVisiblePrey(preyList) {
    // Если в режиме охлаждения после смены цели
    if (this.huntingCooldown > 0) {
      this.huntingCooldown--;
      return this.targetPrey 
        ? { prey: this.targetPrey, index: preyList.indexOf(this.targetPrey) }
        : { prey: null, index: -1 };
    }

    // Фильтрация живых жертв в радиусе зрения
    const visiblePrey = preyList.filter(p => 
      p?.alive && this.getDistance(p) < this.visionRadius
    );
    
    // Если нет видимых жертв
    if (!visiblePrey.length) return { prey: null, index: -1 };

    // Поиск ближайшей жертвы
    const closest = visiblePrey.reduce((closest, prey, idx) => {
      const distance = this.getDistance(prey);
      return distance < closest.distance 
        ? { prey, index: idx, distance } 
        : closest;
    }, { distance: Infinity });

    this.huntingCooldown = 30; // Установка времени охлаждения
    return closest;
  }

  // Движение хищника
  move() {
    // Случайное изменение направления если нет цели
    if (!this.targetPrey && Math.random() < 0.02) {
      this.targetDirection = Math.random() * Math.PI * 2;
    }

    // Плавный поворот к целевому направлению
    this.direction += (this.targetDirection - this.direction) * this.turnSpeed;
    this.updatePosition();
  }

  // Атака жертвы
  attack(preyList) {
    // Если нет цели или цель далеко - нет атаки
    if (!this.targetPrey || this.getDistance(this.targetPrey) >= 15) {
      return this.noAttackResult();
    }

    // Проверка видимости цели
    const { index } = this.getVisiblePrey(preyList);
    if (index === -1) return this.noAttackResult();

    // Если жертва ядовита - оба умирают
    if (this.targetPrey.isPoisoned) {
      this.alive = false;
      this.targetPrey.alive = false;
      return this.attackResult(index, true, true);
    }

    // Успешная атака
    this.preyEaten++;
    return this.attackResult(index, false, true);
  }

  // Попытка размножения
  tryReproduce() {
    if (this.preyEaten < this.reproductionThreshold) return null;
    
    this.preyEaten = 0; // Сброс счетчика
    return this.createOffspring(); // Создание потомка
  }

  // Основное обновление состояния
  update(preyList) {
    // Поиск видимой добычи
    const { prey: visiblePrey } = this.getVisiblePrey(preyList);
    this.targetPrey = visiblePrey;
    
    // Поворот к цели если есть
    if (this.targetPrey) {
      this.targetDirection = Math.atan2(
        this.targetPrey.y - this.y,
        this.targetPrey.x - this.x
      );
    }

    this.move(); // Движение
    const attackResult = this.attack(preyList); // Атака
    const offspring = this.tryReproduce(); // Размножение

    return {
      updatedPredator: attackResult.predatorDied ? null : this,
      offspring,
      eatenPreyIndex: attackResult.eaten ? attackResult.index : -1,
      preyDied: attackResult.preyDied
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

  // Результат при отсутствии атаки
  noAttackResult() {
    return { eaten: false, index: -1, predatorDied: false, preyDied: false };
  }

  // Результат атаки
  attackResult(index, predatorDied, preyDied) {
    return { eaten: true, index, predatorDied, preyDied };
  }

  // Создание потомка
  createOffspring() {
    return new Predator(
      this.x + (Math.random() * 30 - 15), // Случайное смещение
      this.y + (Math.random() * 30 - 15),
      this.speed,
      this.worldWidth,
      this.worldHeight,
      this.reproductionThreshold,
      this.visionRadius
    );
  }
}