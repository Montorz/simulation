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
    this.alive = true;
  }

  getVisiblePrey(preyList) {
    if (this.huntingCooldown > 0) {
      this.huntingCooldown--;
      return this.targetPrey 
        ? { prey: this.targetPrey, index: preyList.indexOf(this.targetPrey) }
        : { prey: null, index: -1 };
    }

    const visiblePrey = preyList.filter(p => p?.alive && this.getDistance(p) < this.visionRadius);
    if (!visiblePrey.length) return { prey: null, index: -1 };

    const closest = visiblePrey.reduce((closest, prey, idx) => {
      const distance = this.getDistance(prey);
      return distance < closest.distance ? { prey, index: idx, distance } : closest;
    }, { distance: Infinity });

    this.huntingCooldown = 30;
    return closest;
  }

  move() {
    if (!this.targetPrey && Math.random() < 0.02) {
      this.targetDirection = Math.random() * Math.PI * 2;
    }

    this.direction += (this.targetDirection - this.direction) * this.turnSpeed;
    this.updatePosition();
  }

  attack(preyList) {
    if (!this.targetPrey || this.getDistance(this.targetPrey) >= 15) {
      return { eaten: false, index: -1, predatorDied: false, preyDied: false };
    }

    const { index } = this.getVisiblePrey(preyList);
    if (index === -1) return { eaten: false, index: -1, predatorDied: false, preyDied: false };

    if (this.targetPrey.isPoisoned) {
      this.alive = false;
      this.targetPrey.alive = false;
      return { eaten: true, index, predatorDied: true, preyDied: true };
    }

    this.preyEaten++;
    return { eaten: true, index, predatorDied: false, preyDied: true };
  }

  tryReproduce() {
    if (this.preyEaten < this.reproductionThreshold) return null;
    
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
    const attackResult = this.attack(preyList);
    const offspring = this.tryReproduce();

    return {
      updatedPredator: attackResult.predatorDied ? null : this,
      offspring,
      eatenPreyIndex: attackResult.eaten ? attackResult.index : -1,
      preyDied: attackResult.preyDied
    };
  }

  getDistance(target) {
    return Math.sqrt((this.x - target.x) ** 2 + (this.y - target.y) ** 2);
  }

  updatePosition() {
    this.x = Math.max(5, Math.min(this.worldWidth - 5, this.x + Math.cos(this.direction) * this.speed));
    this.y = Math.max(5, Math.min(this.worldHeight - 5, this.y + Math.sin(this.direction) * this.speed));
  }
}