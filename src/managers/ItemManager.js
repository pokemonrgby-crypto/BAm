export class ItemManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
  }

  spawnExperienceGem(x, y, expValue) {
    const gem = new ExperienceGem(x, y, expValue);
    this.gameEngine.addItem(gem);
  }

  spawnHealthPack(x, y, healAmount = 20) {
    const health = new HealthPack(x, y, healAmount);
    this.gameEngine.addItem(health);
  }

  spawnChest(x, y) {
    const chest = new Chest(x, y);
    this.gameEngine.addItem(chest);
  }
}

class ExperienceGem {
  constructor(x, y, expValue) {
    this.x = x;
    this.y = y;
    this.expValue = expValue;
    this.radius = 8;
    this.alive = true;
    this.velocityX = (Math.random() - 0.5) * 50;
    this.velocityY = (Math.random() - 0.5) * 50;
    this.magnetized = false;

    // 경험치 양에 따른 색상
    if (expValue < 5) {
      this.color = '#4CAF50';
      this.size = 'small';
    } else if (expValue < 20) {
      this.color = '#2196F3';
      this.size = 'medium';
      this.radius = 10;
    } else {
      this.color = '#9C27B0';
      this.size = 'large';
      this.radius = 12;
    }
  }

  update(dt, player) {
    // 마찰
    this.velocityX *= 0.9;
    this.velocityY *= 0.9;

    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;
  }

  moveTowardsPlayer(playerX, playerY, dt) {
    this.magnetized = true;
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const speed = 300;
      this.x += (dx / distance) * speed * dt;
      this.y += (dy / distance) * speed * dt;
    }
  }

  collect(player, experienceManager) {
    experienceManager.addExperience(this.expValue);
    this.alive = false;
  }

  isAlive() {
    return this.alive;
  }

  render(ctx) {
    // 반짝이는 효과
    const pulse = 1 + Math.sin(Date.now() / 100) * 0.2;

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
    ctx.fill();

    // 하이라이트
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.3, this.radius * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

class HealthPack {
  constructor(x, y, healAmount) {
    this.x = x;
    this.y = y;
    this.healAmount = healAmount;
    this.radius = 12;
    this.alive = true;
    this.color = '#FF5252';
  }

  update(dt, player) {
    // 체력팩은 움직이지 않음
  }

  moveTowardsPlayer(playerX, playerY, dt) {
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const speed = 200;
      this.x += (dx / distance) * speed * dt;
      this.y += (dy / distance) * speed * dt;
    }
  }

  collect(player, experienceManager) {
    player.heal(this.healAmount);
    this.alive = false;
  }

  isAlive() {
    return this.alive;
  }

  render(ctx) {
    // 십자가 모양
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - 3, this.y - 10, 6, 20);
    ctx.fillRect(this.x - 10, this.y - 3, 20, 6);

    // 하얀 테두리
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x - 3, this.y - 10, 6, 20);
    ctx.strokeRect(this.x - 10, this.y - 3, 20, 6);
  }
}

class Chest {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.alive = true;
    this.color = '#FFD700';
  }

  update(dt, player) {
    // 상자는 움직이지 않음
  }

  moveTowardsPlayer(playerX, playerY, dt) {
    // 상자는 자석 효과 없음
  }

  collect(player, experienceManager) {
    // 랜덤 보상
    const rewards = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < rewards; i++) {
      experienceManager.addExperience(20);
    }
    player.heal(30);
    this.alive = false;
  }

  isAlive() {
    return this.alive;
  }

  render(ctx) {
    // 상자 그리기
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);

    // 잠금장치
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(this.x - 5, this.y - 5, 10, 10);

    ctx.strokeStyle = '#FFA500';
    ctx.lineWidth = 3;
    ctx.strokeRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
  }
}
