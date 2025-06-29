export default class Food {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.isEaten = false;
    this.id = Math.random().toString(36).substr(2, 9);
    this.isPoisonous = Math.random() < 0.1;
  }
}