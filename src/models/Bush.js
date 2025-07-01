export default class Bush {
  constructor(x, y, worldWidth, worldHeight) {
    this.x = x;
    this.y = y;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.size = 30;
    this.safeRadius = 150;
    this.hidingPrey = null;
    this.isObstacle = true;
  }

  getDistance(target) {
    return Math.sqrt((this.x - target.x) ** 2 + (this.y - target.y) ** 2);
  }

  contains(x, y) {
    return this.getDistance({ x, y }) <= this.size;
  }

  isInSafeRadius(x, y) {
    return this.getDistance({ x, y }) <= this.safeRadius;
  }

  hidePrey(prey) {
    if (!this.hidingPrey) {
      prey.x = this.x;
      prey.y = this.y;
      this.hidingPrey = prey;
      return true;
    }
    return false;
  }

  releasePrey() {
    const releasedPrey = this.hidingPrey;
    this.hidingPrey = null;
    return releasedPrey;
  }

  isPredatorNear(predators) {
    return predators.some(predator => 
      predator.alive && this.getDistance(predator) < this.safeRadius
    );
  }
}