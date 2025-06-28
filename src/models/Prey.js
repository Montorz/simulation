export default class Prey {
  constructor(x, y, speed, worldWidth, worldHeight, hungerThreshold) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.direction = Math.random() * Math.PI * 2;
    this.targetDirection = this.direction;
    this.turnSpeed = 0.1;
    this.foodEaten = 0;
    this.hungerThreshold = hungerThreshold;
    this.targetFood = null;
  }

  findClosestFood(foodList) {
    let closestFood = null;
    let minDistance = Infinity;

    foodList.forEach(food => {
      if (food.isEaten) return;
      const distance = Math.sqrt((this.x - food.x) ** 2 + (this.y - food.y) ** 2);
      if (distance < minDistance) {
        minDistance = distance;
        closestFood = food;
      }
    });

    return closestFood;
  }

  move(foodList) {
    // Ищем ближайшую еду
    this.targetFood = this.findClosestFood(foodList);

    // Если нашли еду - двигаемся к ней
    if (this.targetFood && !this.targetFood.isEaten) {
      this.targetDirection = Math.atan2(
        this.targetFood.y - this.y,
        this.targetFood.x - this.x
      );
    } else if (Math.random() < 0.02) {
      // Иначе случайно меняем направление
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

  eat(foodList) {
    if (!this.targetFood || this.targetFood.isEaten) return false;

    const distance = Math.sqrt(
      (this.x - this.targetFood.x) ** 2 + 
      (this.y - this.targetFood.y) ** 2
    );

    if (distance < 10) {
      this.targetFood.isEaten = true;
      this.foodEaten++;
      return true;
    }
    return false;
  }

  tryReproduce() {
    if (this.foodEaten >= this.hungerThreshold) {
      this.foodEaten = 0;
      return new Prey(
        this.x + (Math.random() * 30 - 15),
        this.y + (Math.random() * 30 - 15),
        this.speed,
        this.worldWidth,
        this.worldHeight,
        this.hungerThreshold
      );
    }
    return null;
  }

  update(foodList) {
    this.move(foodList);
    this.eat(foodList);
    const offspring = this.tryReproduce();

    return {
      updatedPrey: this,
      offspring: offspring
    };
  }
}