export default class Bush {
  constructor(x, y, worldWidth, worldHeight) {
    this.x = Math.max(30, Math.min(worldWidth - 30, x));
    this.y = Math.max(30, Math.min(worldHeight - 30, y));
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.size = 30;
    this.safeRadius = 300;
    this.hidingPrey = null; // Жертва спрятавшаяся в кусте
    this.isObstacle = true; // Является ли куст препятствием
  }

  // Расстояние до цели
  getDistance(target) {
    return Math.sqrt((this.x - target.x) ** 2 + (this.y - target.y) ** 2);
  }

  // Прячем жертву в кусте
  hidePrey(prey) {
    if (!this.hidingPrey) {
      prey.x = this.x;
      prey.y = this.y;
      this.hidingPrey = prey;
      return true;
    }
    return false;
  }

  // Освобождаем жертву из куста
  releasePrey() {
    const releasedPrey = this.hidingPrey;
    this.hidingPrey = null;
    return releasedPrey;
  }

  // Проверяем есть ли рядом хищники
  isPredatorNear(predators) {
    return predators.some(predator => 
      predator.alive && this.getDistance(predator) < this.safeRadius
    );
  }
}