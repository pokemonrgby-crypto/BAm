export class Enemy {
  constructor(x, y, type = 'basic') {
    this.x = x;
    this.y = y;
    this.type = type;
    this.radius = 15;
    this.alive = true;

    // 기본 스탯
    this.maxHealth = 20;
    this.health = this.maxHealth;
    this.speed = 50;
    this.damage = 10;
    this.expValue = 5;

    // 색상
    this.color = '#FF5252';

    // 타입별 초기화
    this.initType(type);
  }

  initType(type) {
    switch (type) {
    case 'basic':
      // 기본 적
      this.maxHealth = 20;
      this.speed = 50;
      this.damage = 10;
      this.expValue = 5;
      this.radius = 15;
      this.color = '#FF5252';
      break;

    case 'fast':
      // 빠르지만 약한 적
      this.maxHealth = 10;
      this.speed = 120;
      this.damage = 5;
      this.expValue = 3;
      this.radius = 12;
      this.color = '#FFD700';
      break;

    case 'tank':
      // 느리지만 강한 적
      this.maxHealth = 100;
      this.speed = 30;
      this.damage = 20;
      this.expValue = 15;
      this.radius = 25;
      this.color = '#8B4513';
      break;

    case 'shooter':
      // 원거리 공격 적
      this.maxHealth = 15;
      this.speed = 40;
      this.damage = 8;
      this.expValue = 8;
      this.radius = 14;
      this.color = '#9C27B0';
      this.shootCooldown = 0;
      this.shootInterval = 2.0;
      this.shootRange = 300;
      break;

    case 'boss':
      // 보스
      this.maxHealth = 500;
      this.speed = 40;
      this.damage = 30;
      this.expValue = 100;
      this.radius = 40;
      this.color = '#FF0000';
      this.isBoss = true;
      break;
    }

    this.health = this.maxHealth;
  }

  update(dt, player) {
    if (!this.alive) return;

    // 플레이어를 향해 이동
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const moveX = (dx / distance) * this.speed * dt;
      const moveY = (dy / distance) * this.speed * dt;

      this.x += moveX;
      this.y += moveY;
    }

    // 원거리 공격 타입
    if (this.type === 'shooter') {
      this.shootCooldown -= dt;
      if (this.shootCooldown <= 0 && distance < this.shootRange) {
        this.shoot(player);
        this.shootCooldown = this.shootInterval;
      }
    }
  }

  shoot(player) {
    // 적의 투사체는 게임 엔진에서 처리
    this.lastShootDirection = {
      x: player.x - this.x,
      y: player.y - this.y
    };
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
    }
  }

  isAlive() {
    return this.alive;
  }

  render(ctx) {
    if (!this.alive) return;

    // 적 그리기
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // 보스 표시
    if (this.isBoss) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // 체력바
    this.renderHealthBar(ctx);
  }

  renderHealthBar(ctx) {
    const barWidth = this.radius * 2;
    const barHeight = 4;
    const x = this.x - barWidth / 2;
    const y = this.y - this.radius - 10;

    // 배경
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x, y, barWidth, barHeight);

    // 체력
    const healthPercent = this.health / this.maxHealth;
    ctx.fillStyle = healthPercent > 0.5 ? '#4CAF50' : '#FF5252';
    ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
  }
}
