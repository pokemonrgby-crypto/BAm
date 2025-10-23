export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 20;

    // 기본 스탯
    this.baseMaxHealth = 100;
    this.baseSpeed = 150;
    this.baseDamage = 10;

    // 현재 스탯
    this.maxHealth = this.baseMaxHealth;
    this.health = this.maxHealth;
    this.speed = this.baseSpeed;
    this.damage = this.baseDamage;

    // 패시브 보너스
    this.moveSpeedBonus = 0; // 퍼센트 (0.1 = 10%)
    this.maxHealthBonus = 0;
    this.damageBonus = 0;
    this.cooldownReduction = 0;
    this.areaSizeBonus = 0;
    this.magnetBonus = 0;
    this.baseMagnetRange = 100;
    this.magnetRange = this.baseMagnetRange;

    // 무적 상태
    this.invincibleTime = 0;
    this.invincibleDuration = 1.0; // 피격 후 1초 무적

    // 방향 (마지막 이동 방향)
    this.directionX = 1;
    this.directionY = 0;

    // 렌더링
    this.color = '#4CAF50';
  }

  reset() {
    this.x = 0;
    this.y = 0;
    this.health = this.maxHealth;
    this.invincibleTime = 0;
    this.directionX = 1;
    this.directionY = 0;
  }

  update(dt, input) {
    // 이동
    let moveX = 0;
    let moveY = 0;

    if (input.up) moveY -= 1;
    if (input.down) moveY += 1;
    if (input.left) moveX -= 1;
    if (input.right) moveX += 1;

    // 대각선 이동 보정
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.707; // 1/sqrt(2)
      moveY *= 0.707;
    }

    // 방향 업데이트
    if (moveX !== 0 || moveY !== 0) {
      this.directionX = moveX;
      this.directionY = moveY;
    }

    // 이동 속도 적용
    const currentSpeed = this.speed * (1 + this.moveSpeedBonus);
    this.x += moveX * currentSpeed * dt;
    this.y += moveY * currentSpeed * dt;

    // 무적 시간 감소
    if (this.invincibleTime > 0) {
      this.invincibleTime -= dt;
    }
  }

  takeDamage(amount) {
    if (this.isInvincible()) return;

    this.health -= amount;
    if (this.health < 0) this.health = 0;

    // 피격 후 무적 시간
    this.invincibleTime = this.invincibleDuration;
  }

  heal(amount) {
    this.health += amount;
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  isInvincible() {
    return this.invincibleTime > 0;
  }

  updateStats() {
    // 패시브 보너스 적용
    this.maxHealth = this.baseMaxHealth + this.maxHealthBonus;
    this.speed = this.baseSpeed * (1 + this.moveSpeedBonus);
    this.damage = this.baseDamage * (1 + this.damageBonus);
    this.magnetRange = this.baseMagnetRange + this.magnetBonus;

    // 체력이 최대치를 넘지 않도록
    if (this.health > this.maxHealth) {
      this.health = this.maxHealth;
    }
  }

  addPassiveStat(statName, value) {
    switch (statName) {
    case 'moveSpeed':
      this.moveSpeedBonus += value;
      break;
    case 'maxHealth':
      this.maxHealthBonus += value;
      break;
    case 'damage':
      this.damageBonus += value;
      break;
    case 'cooldown':
      this.cooldownReduction += value;
      break;
    case 'areaSize':
      this.areaSizeBonus += value;
      break;
    case 'magnet':
      this.magnetBonus += value;
      break;
    }
    this.updateStats();
  }

  getDirection() {
    return { x: this.directionX, y: this.directionY };
  }

  render(ctx) {
    // 무적 상태 시 깜빡임
    if (this.isInvincible() && Math.floor(this.invincibleTime * 10) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // 플레이어 그리기
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // 방향 표시
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(
      this.x + this.directionX * this.radius * 0.5,
      this.y + this.directionY * this.radius * 0.5,
      this.radius * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.globalAlpha = 1;
  }
}
