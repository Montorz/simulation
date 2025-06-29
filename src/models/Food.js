export default class Food {
  constructor(x, y, poisonChance = 0.05) {
    this.x = x; // Позиция по X
    this.y = y; // Позиция по Y
    this.size = 6; // Размер отрисовки
    this.isEaten = false; // Флаг съеденности
    this.isPoisonous = Math.random() < poisonChance; // Ядовитая или нет
    this.recoveryTime = 0; // Таймер восстановления
    this.maxRecoveryTime = 100; // Максимальное время восстановления в кадрах
  }

  // Обновление состояния восстановления
  update(recoverySpeed = 1) {
    // Если трава съедена и еще восстанавливается
    if (this.isEaten && this.recoveryTime > 0) {
      this.recoveryTime -= recoverySpeed; // Уменьшение таймера
      
      // Если время восстановления закончилось
      if (this.recoveryTime <= 0) {
        this.recoveryTime = 0;
        this.isEaten = false; // Трава восстановилась
      }
    }
  }

  // Метод поедания травы
  eat() {
    if (this.isEaten) return false; // Если уже съедена
    
    this.isEaten = true;
    this.recoveryTime = this.maxRecoveryTime; // Запуск таймера восстановления
    return true; // Успешное поедание
  }
}