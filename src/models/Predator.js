export default class Predator {
  constructor(x, y, speed, worldWidth, worldHeight) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.direction = Math.random() * Math.PI * 2;
    this.targetDirection = this.direction;
    this.turnSpeed = 0.1;
    this.targetPrey = null;
  }

  findClosestPrey(preyList) {
    let closestPrey = null;
    let minDistance = Infinity;

    preyList.forEach(prey => {
      const distance = Math.sqrt((this.x - prey.x) ** 2 + (this.y - prey.y) ** 2);
      if (distance < minDistance) {
        minDistance = distance;
        closestPrey = prey;
      }
    });

    return closestPrey;
  }

  move(preyList) {
    this.targetPrey = this.findClosestPrey(preyList);

    if (this.targetPrey) {
      this.targetDirection = Math.atan2(
        this.targetPrey.y - this.y,
        this.targetPrey.x - this.x
      );
    } else if (Math.random() < 0.02) {
      this.targetDirection = Math.random() * Math.PI * 2;
    }

    this.direction = this.direction + 
      (this.targetDirection - this.direction) * this.turnSpeed;
      
    this.x = Math.max(5, Math.min(
      this.worldWidth - 5, 
      this.x + Math.cos(this.direction) * this.speed
    ));
    this.y = Math.max(5, Math.min(
      this.worldHeight - 5, 
      this.y + Math.sin(this.direction) * this.speed
    ));
  }

  attack() {
    if (!this.targetPrey) return false;

    const distance = Math.sqrt(
      (this.x - this.targetPrey.x) ** 2 + 
      (this.y - this.targetPrey.y) ** 2
    );

    return distance < 15;
  }

  update(preyList) {
    this.move(preyList);
    return this;
  }
}