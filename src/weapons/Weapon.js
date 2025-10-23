export class Weapon {
  constructor(name, type) {
    this.name = name;
    this.type = type;
    this.currentLevel = 1;
    this.maxLevel = 8;

    // 기본 스탯
    this.damage = 10;
    this.cooldown = 1.0;
    this.cooldownTimer = 0;
    this.projectileCount = 1;
    this.areaSize = 1.0;
    this.duration = 1.0;
    this.pierce = false;
    this.knockback = 0;

    // 설명
    this.description = '';
  }

  update(dt, player, enemies) {
    this.cooldownTimer -= dt;
    if (this.cooldownTimer <= 0) {
      this.cooldownTimer = this.cooldown * (1 - player.cooldownReduction);
      this.activate(player, enemies);
    }
  }

  activate(player, enemies) {
    // 하위 클래스에서 구현
  }

  upgrade() {
    if (this.currentLevel >= this.maxLevel) return false;
    this.currentLevel++;
    this.applyLevelUpgrade();
    return true;
  }

  applyLevelUpgrade() {
    // 하위 클래스에서 구현
  }

  isMaxLevel() {
    return this.currentLevel >= this.maxLevel;
  }

  getInfo() {
    return {
      name: this.name,
      level: this.currentLevel,
      maxLevel: this.maxLevel,
      description: this.description
    };
  }
}
