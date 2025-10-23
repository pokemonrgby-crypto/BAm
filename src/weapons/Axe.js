import { Weapon } from './Weapon.js';
import { Projectile } from './Projectile.js';

export class Axe extends Weapon {
  constructor() {
    super('도끼', 'projectile');
    this.damage = 20;
    this.cooldown = 2.0;
    this.projectileCount = 1;
    this.projectileSpeed = 250;
    this.areaSize = 1.0;
    this.pierce = true;
    this.maxDistance = 400;
    this.description = '플레이어가 바라보는 방향으로 포물선을 그리며 도끼를 던집니다.';
  }

  activate(player, enemies) {
    const direction = player.getDirection();

    for (let i = 0; i < this.projectileCount; i++) {
      const angle = Math.atan2(direction.y, direction.x);
      const spreadAngle = (i - (this.projectileCount - 1) / 2) * 0.3;
      const finalAngle = angle + spreadAngle;

      const vx = Math.cos(finalAngle) * this.projectileSpeed;
      const vy = Math.sin(finalAngle) * this.projectileSpeed;

      const projectile = new AxeProjectile(
        player.x,
        player.y,
        vx,
        vy,
        this.damage * (1 + player.damageBonus),
        {
          radius: 8 * this.areaSize * (1 + player.areaSizeBonus),
          color: '#795548',
          pierce: true,
          maxPierceCount: 999,
          lifetime: this.maxDistance / this.projectileSpeed,
          rotationSpeed: 10,
          infinite: this.currentLevel >= 8
        }
      );

      if (player.gameEngine) {
        player.gameEngine.addProjectile(projectile);
      }
    }
  }

  applyLevelUpgrade() {
    switch (this.currentLevel) {
    case 2:
      this.damage = 30;
      break;
    case 3:
      this.areaSize = 1.3;
      break;
    case 4:
      this.projectileCount = 2;
      this.description = '2개의 도끼를 던집니다.';
      break;
    case 5:
      this.cooldown = 1.5;
      break;
    case 6:
      this.damage = 45;
      break;
    case 7:
      this.areaSize = 1.6;
      break;
    case 8:
      this.maxDistance = 9999;
      this.description = '화면 끝까지 날아가는 도끼를 던집니다.';
      break;
    }
  }
}

// 도끼 전용 투사체 (회전 효과)
class AxeProjectile extends Projectile {
  constructor(x, y, vx, vy, damage, options) {
    super(x, y, vx, vy, damage, options);
    this.rotation = 0;
    this.rotationSpeed = options.rotationSpeed || 10;
    this.infinite = options.infinite || false;
  }

  update(dt) {
    super.update(dt);
    this.rotation += this.rotationSpeed * dt;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // 도끼 모양
    ctx.fillStyle = '#795548';
    ctx.beginPath();
    ctx.moveTo(-this.radius, 0);
    ctx.lineTo(0, -this.radius * 1.5);
    ctx.lineTo(this.radius, 0);
    ctx.lineTo(0, this.radius * 0.5);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }
}
