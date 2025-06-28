export default class Predator {
  constructor(x, y, speed, energy) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.energy = energy;
    this.direction = Math.random() * Math.PI * 2;
  }

  move() {
    this.x += Math.cos(this.direction) * this.speed;
    this.y += Math.sin(this.direction) * this.speed;
    if (Math.random() < 0.05) {
      this.direction = Math.random() * Math.PI * 2;
    }
  }

  hunt(preyList) {
    preyList.forEach(prey => {
      if (!prey.isAlive) return;
      const distance = Math.sqrt((this.x - prey.x) ** 2 + (this.y - prey.y) ** 2);
      if (distance < 10) {
        prey.isAlive = false;
        this.energy += 20;
      }
    });
  }

  update(preyList) {
    this.move();
    this.hunt(preyList);
    this.energy -= 0.1;
    return this.energy > 0;
  }
}