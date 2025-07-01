export default class Food {
  constructor(x, y, poisonChance = 0.05, bushList = [], worldWidth, worldHeight) {
    let validPosition = false;
    let attempts = 0;
    let finalX, finalY;
    
    do {
      finalX = Math.random() * worldWidth;
      finalY = Math.random() * worldHeight;
      validPosition = true;
      
      // Проверяем расстояние до всех кустов
      for (const bush of bushList) {
        const dx = finalX - bush.x;
        const dy = finalY - bush.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Если еда внутри куста (с запасом 5px)
        if (distance < bush.size + 5) {
          validPosition = false;
          break;
        }
      }
      
      attempts++;
    } while (!validPosition && attempts < 20);

    this.x = finalX;
    this.y = finalY;
    this.size = 6;
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