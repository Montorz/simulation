export default class Predator {
  constructor(x, y, speed, worldWidth, worldHeight, reproductionThreshold, visionRadius) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    this.direction = Math.random() * Math.PI * 2;
    this.targetDirection = this.direction;
    this.turnSpeed = 0.1;
    this.preyEaten = 0;
    this.reproductionThreshold = reproductionThreshold;
    this.visionRadius = visionRadius;
    this.targetPrey = null;
    this.huntingCooldown = 0;
  }

  getVisiblePrey(preyList) {
    if (this.huntingCooldown > 0) {
      this.huntingCooldown--;
      return this.targetPrey 
        ? { prey: this.targetPrey, index: preyList.indexOf(this.targetPrey) }
        : { prey: null, index: -1 };
    }

    const visiblePrey = preyList.filter(p => 
      p && 
      Math.sqrt((this.x - p.x) ** 2 + (this.y - p.y) ** 2) < this.visionRadius
    );

    if (visiblePrey.length > 0) {
      const { prey, index } = visiblePrey.reduce((closest, prey, idx) => {
        const dist = Math.sqrt((this.x - prey.x) ** 2 + (this.y - prey.y) ** 2);
        return dist < closest.distance ? { prey, index: idx, distance: dist } : closest;
      }, { prey: visiblePrey[0], index: 0, distance: Infinity });

      this.huntingCooldown = 30;
      return { prey, index };
    }
    return { prey: null, index: -1 };
  }

  move() {
    if (!this.targetPrey && Math.random() < 0.02) {
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

  attack(preyList) {
    if (!this.targetPrey) return { eaten: false, index: -1 };

    const distance = Math.sqrt(
      (this.x - this.targetPrey.x) ** 2 + 
      (this.y - this.targetPrey.y) ** 2
    );

    if (distance < 15) {
      const { index } = this.getVisiblePrey(preyList);
      if (index !== -1) {
        this.preyEaten++;
        return { eaten: true, index };
      }
    }
    return { eaten: false, index: -1 };
  }

  tryReproduce() {
    if (this.preyEaten >= this.reproductionThreshold) {
      this.preyEaten = 0;
      return new Predator(
        this.x + (Math.random() * 30 - 15),
        this.y + (Math.random() * 30 - 15),
        this.speed,
        this.worldWidth,
        this.worldHeight,
        this.reproductionThreshold,
        this.visionRadius
      );
    }
    return null;
  }

  update(preyList) {
    const { prey: visiblePrey } = this.getVisiblePrey(preyList);
    this.targetPrey = visiblePrey;

    if (this.targetPrey) {
      this.targetDirection = Math.atan2(
        this.targetPrey.y - this.y,
        this.targetPrey.x - this.x
      );
    }

    this.move();
    const { eaten, index } = this.attack(preyList);
    const offspring = this.tryReproduce();

    return {
      updatedPredator: this,
      offspring: offspring,
      eatenPreyIndex: eaten ? index : -1
    };
  }
}