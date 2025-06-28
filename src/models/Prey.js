export default class Prey {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.isAlive = true;
    this.energy = 50;
    this.direction = Math.random() * Math.PI * 2;
  }

  move() {
    this.x += Math.cos(this.direction) * this.speed;
    this.y += Math.sin(this.direction) * this.speed;
    if (Math.random() < 0.05) {
      this.direction = Math.random() * Math.PI * 2;
    }
  }

  eat(foodList) {
    foodList.forEach(food => {
      if (food.isEaten) return;
      const distance = Math.sqrt((this.x - food.x) ** 2 + (this.y - food.y) ** 2);
      if (distance < 5) {
        food.isEaten = true;
        this.energy += 30;
      }
    });
  }

  tryReproduce(chance) {
    if (this.energy > 80 && Math.random() * 100 < chance) {
      this.energy /= 2;
      return new Prey(
        this.x + (Math.random() * 20 - 10),
        this.y + (Math.random() * 20 - 10),
        this.speed * (0.9 + Math.random() * 0.2)
      );
    }
    return null;
  }

  update(foodList, reproductionChance) {
    this.move();
    this.eat(foodList);
    this.energy -= 0.2;
    if (this.energy <= 0) this.isAlive = false;
    return this.tryReproduce(reproductionChance);
  }
}