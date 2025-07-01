export default class Food {
  constructor(x, y, poisonChance = 0.05, bushList = [], worldWidth, worldHeight) {
    let validPosition = false;
    let attempts = 0;
    let finalX, finalY;
    
    // Генерируем позицию которая будет не пересекаться с кустами
    do {
      finalX = Math.random() * worldWidth;
      finalY = Math.random() * worldHeight;
      validPosition = true;
      
      for (const bush of bushList) {
        const dx = finalX - bush.x;
        const dy = finalY - bush.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
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
    this.isEaten = false; // Съедена ли еда
    this.isPoisonous = Math.random() < poisonChance; // Ядовита ли еда
    this.recoveryTime = 0; // Время восстановления
    this.maxRecoveryTime = 100; // Максимальное время восстановления
  }

  // Обновление состояния еды
  update(recoverySpeed = 1) {
    if (this.isEaten && this.recoveryTime > 0) {
      this.recoveryTime -= recoverySpeed;
      if (this.recoveryTime <= 0) {
        this.recoveryTime = 0;
        this.isEaten = false;
      }
    }
  }

  // Поедание еды
  eat() {
    if (this.isEaten) return false;
    
    this.isEaten = true;
    this.recoveryTime = this.maxRecoveryTime;
    return true;
  }
}