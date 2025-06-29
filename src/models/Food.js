export default class Food {
  constructor(x, y, poisonChance = 0.05) {
    this.x = x; // Позиция X
    this.y = y; // Позиция Y
    this.size = 6; // Размер еды
    this.isEaten = false; // Съедена ли
    this.isPoisonous = Math.random() < poisonChance; // Ядовитая (5% шанс)
    this.recoveryTime = 0; // Таймер восстановления
    this.maxRecoveryTime = 100; // Время до восстановления
  }

  // Обновляет состояние еды (восстановление после съедения)
  update(recoverySpeed = 1) {
    if (this.isEaten && this.recoveryTime > 0) {
      this.recoveryTime -= recoverySpeed;
      if (this.recoveryTime <= 0) {
        this.recoveryTime = 0;
        this.isEaten = false; // Восстанавливаем еду
      }
    }
  }

  // Пытается съесть еду
  eat() {
    if (this.isEaten) return false; // Уже съедена
    
    this.isEaten = true;
    this.recoveryTime = this.maxRecoveryTime; // Запускаем таймер восстановления
    return true; // Успешно съедена
  }
}