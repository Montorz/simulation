export default class Predator {
  constructor(x, y, speed, worldWidth, worldHeight, reproductionThreshold, visionRadius) {
    this.x = x; // Позиция X
    this.y = y; // Позиция Y
    this.speed = speed; // Скорость движения
    this.worldWidth = worldWidth; // Ширина мира
    this.worldHeight = worldHeight; // Высота мира
    this.direction = Math.random() * Math.PI * 2; // Направление движения
    this.preyEaten = 0; // Счетчик съеденной добычи
    this.reproductionThreshold = reproductionThreshold; // Сколько нужно съесть для размножения
    this.visionRadius = visionRadius; // Как далеко видит добычу
    this.alive = true; // Жив ли хищник
  }

  // Находит первую видимую добычу в списке
  getVisiblePrey(preyList) {
    for (let i = 0; i < preyList.length; i++) {
      const prey = preyList[i];
      if (prey?.alive && this.getDistance(prey) < this.visionRadius) {
        return { prey, index: i }; // Возвращаем добычу и ее индекс
      }
    }
    return { prey: null, index: -1 };
  }

  // Идет к добыче или случайно меняет направление
  move(targetPrey) {
    if (targetPrey) {
      this.direction = Math.atan2(targetPrey.y - this.y, targetPrey.x - this.x);
    } else if (Math.random() < 0.05) {
      this.direction = Math.random() * Math.PI * 2; // 5% шанс изменить направление
    }

    this.updatePosition();
  }

  // Атакует добычу, если достаточно близко
  attack(preyList) {
    const { prey: targetPrey, index } = this.getVisiblePrey(preyList);
    
    if (!targetPrey || this.getDistance(targetPrey) >= 15) {
      return { eaten: false, index: -1, predatorDied: false, preyDied: false };
    }

    if (targetPrey.isPoisoned) {
      // Если добыча отравлена хищник умирает
      this.alive = false;
      targetPrey.alive = false;
      return { eaten: true, index, predatorDied: true, preyDied: true };
    }

    this.preyEaten++; // Увеличиваем счетчик съеденной добычи
    return { eaten: true, index, predatorDied: false, preyDied: true };
  }

  // Пытается размножиться, если съел достаточно добычи
  tryReproduce() {
    if (this.preyEaten < this.reproductionThreshold) return null;
    
    this.preyEaten = 0; // Сбрасываем счетчик
    return this.createOffspring(); // Создаем потомка
  }

  // Основной метод обновления состояния
  update(preyList) {
    const { prey: targetPrey } = this.getVisiblePrey(preyList);
    
    this.move(targetPrey); // Двигаемся
    const attackResult = this.attack(preyList); // Атакуем
    const offspring = this.tryReproduce(); // Пытаемся размножиться

    return {
      updatedPredator: attackResult.predatorDied ? null : this, // null если хищник умер
      offspring, // Потомок или null
      eatenPreyIndex: attackResult.eaten ? attackResult.index : -1, // Индекс съеденной добычи
      preyDied: attackResult.preyDied // Умерла ли добыча
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
    return new Predator(
      this.x + (Math.random() * 30 - 15), // Случайное смещение по X
      this.y + (Math.random() * 30 - 15), // Случайное смещение по Y
      this.speed,
      this.worldWidth,
      this.worldHeight,
      this.reproductionThreshold,
      this.visionRadius
    );
  }
}