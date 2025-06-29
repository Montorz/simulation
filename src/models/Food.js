export default class Food {
  constructor(x, y, poisonChance = 0.05) {
    this.x = x;
    this.y = y;
    this.size = 3;
    this.isEaten = false;
    this.isPoisonous = Math.random() < poisonChance;
    this.recoveryTime = 0;
    this.maxRecoveryTime = 100;
  }

  update(recoverySpeed = 1) {
    if (this.isEaten && this.recoveryTime > 0) {
      this.recoveryTime -= recoverySpeed;
      if (this.recoveryTime <= 0) {
        this.recoveryTime = 0;
        this.isEaten = false;
      }
    }
  }

  eat() {
    if (this.isEaten) return false;
    this.isEaten = true;
    this.recoveryTime = this.maxRecoveryTime;
    return true;
  }
}