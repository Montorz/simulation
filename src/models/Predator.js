export default class Predator {
  constructor(x, y, speed, worldWidth, worldHeight, reproductionThreshold, visionRadius) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.direction = Math.random() * Math.PI * 2; // Направление движения
    this.preyEaten = 0; // Количество съеденных жертв
    this.reproductionThreshold = reproductionThreshold; // Порог для размножения
    this.visionRadius = visionRadius; // Радиус обзора
    this.alive = true; // Жив ли хищник
  }

  // Находим видимую жертву
  getVisiblePrey(preyList) {
    for (let i = 0; i < preyList.length; i++) {
      const prey = preyList[i];
      if (prey?.alive && !prey.isHiding && this.getDistance(prey) < this.visionRadius) {
        return { prey, index: i };
      }
    }
    return { prey: null, index: -1 };
  }

  // Проверяем столкновение с кустом
  checkBushCollision(bushList, newX, newY) {
    for (const bush of bushList) {
      if (bush.isObstacle && bush.getDistance({ x: newX, y: newY }) < bush.size) {
        return true;
      }
    }
    return false;
  }

  // Основная логика движения
  move(targetPrey, bushList) {
    const baseSpeed = this.speed;
    let newDirection = this.direction;
    
    if (targetPrey) {
      // Движется к жертве
      newDirection = Math.atan2(targetPrey.y - this.y, targetPrey.x - this.x);
    } else if (Math.random() < 0.05) {
      // Случайное направление
      newDirection = Math.random() * Math.PI * 2;
    }

    // Пробуем двигаться в выбранном направлении
    let newX = this.x + Math.cos(newDirection) * baseSpeed;
    let newY = this.y + Math.sin(newDirection) * baseSpeed;

    // Обходим кусты
    if (this.checkBushCollision(bushList, newX, newY)) {
      const avoidAngle = Math.random() * Math.PI / 2 - Math.PI / 4;
      newDirection += avoidAngle;
      newX = this.x + Math.cos(newDirection) * baseSpeed;
      newY = this.y + Math.sin(newDirection) * baseSpeed;
      
      // Остаёмся на месте если сталкиваемся
      if (this.checkBushCollision(bushList, newX, newY)) {
        newX = this.x;
        newY = this.y;
      }
    }

    this.direction = newDirection;
    this.x = Math.max(5, Math.min(this.worldWidth - 5, newX));
    this.y = Math.max(5, Math.min(this.worldHeight - 5, newY));
  }

  // Атака жертвы
  attack(preyList) {
    const { prey: targetPrey, index } = this.getVisiblePrey(preyList);
    
    if (!targetPrey || this.getDistance(targetPrey) >= 15) {
      return { eaten: false, index: -1, predatorDied: false, preyDied: false };
    }

    if (targetPrey.isPoisoned) {
      // Умирает если жертва отравлена
      this.alive = false;
      targetPrey.alive = false;
      return { eaten: true, index, predatorDied: true, preyDied: true };
    }

    this.preyEaten++; // Увеличиваем счетчик
    return { eaten: true, index, predatorDied: false, preyDied: true };
  }

  // Попытка размножения
  tryReproduce() {
    if (this.preyEaten < this.reproductionThreshold) return null;
    
    this.preyEaten = 0; // Сбрасываем счетчик жертв
    return this.createOffspring(); // Создаем потомка
  }

  // Обновление состояния хищника
  update(preyList, bushList) {
    const { prey: targetPrey } = this.getVisiblePrey(preyList);
    
    this.move(targetPrey, bushList);
    const attackResult = this.attack(preyList);
    const offspring = this.tryReproduce();

    return {
      updatedPredator: attackResult.predatorDied ? null : this,
      offspring,
      eatenPreyIndex: attackResult.eaten ? attackResult.index : -1,
      preyDied: attackResult.preyDied
    };
  }

  // Расчет расстояния до цели
  getDistance(target) {
    return Math.sqrt((this.x - target.x) ** 2 + (this.y - target.y) ** 2);
  }

  // Создание потомка
  createOffspring() {
    return new Predator(
      this.x + (Math.random() * 30 - 15),
      this.y + (Math.random() * 30 - 15),
      this.speed,
      this.worldWidth,
      this.worldHeight,
      this.reproductionThreshold,
      this.visionRadius
    );
  }
}