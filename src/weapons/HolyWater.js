import { Weapon } from './Weapon.js';

export class HolyWater extends Weapon {
  constructor() {
    super('성수', 'area');
    this.damage = 10;
    this.cooldown = 3.0;
    this.projectileCount = 1;
    this.areaSize = 60;
    this.duration = 5.0;
    this.explosionOnEnd = false;
    this.zones = [];
    this.description = '무작위 위치에 성수를 던져 지속 피해 장판을 생성합니다.';
  }

  update(dt, player, enemies) {
    super.update(dt, player, enemies);

    // 장판 업데이트
    this.zones = this.zones.filter(zone => {
      zone.timeAlive += dt;
      zone.damageTimer += dt;

      // 지속 피해
      if (zone.damageTimer >= 0.5) {
        zone.damageTimer = 0;
        enemies.forEach(enemy => {
          const dx = enemy.x - zone.x;
          const dy = enemy.y - zone.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < zone.radius) {
            enemy.takeDamage(this.damage * (1 + player.damageBonus));
          }
        });
      }

      // 장판 종료 시 폭발
      if (zone.timeAlive >= this.duration) {
        if (this.explosionOnEnd) {
          this.createExplosion(zone, player, enemies);
        }
        return false;
      }

      return true;
    });
  }

  activate(player, enemies) {
    // 무작위 적 위치 또는 플레이어 주변
    let targetX, targetY;

    if (enemies.length > 0 && Math.random() > 0.3) {
      const randomEnemy = enemies[Math.floor(Math.random() * enemies.length)];
      targetX = randomEnemy.x;
      targetY = randomEnemy.y;
    } else {
      const angle = Math.random() * Math.PI * 2;
      const distance = 100 + Math.random() * 200;
      targetX = player.x + Math.cos(angle) * distance;
      targetY = player.y + Math.sin(angle) * distance;
    }

    for (let i = 0; i < this.projectileCount; i++) {
      const offsetX = (Math.random() - 0.5) * 50;
      const offsetY = (Math.random() - 0.5) * 50;

      this.zones.push({
        x: targetX + offsetX,
        y: targetY + offsetY,
        radius: this.areaSize * (1 + player.areaSizeBonus),
        timeAlive: 0,
        damageTimer: 0
      });
    }
  }

  createExplosion(zone, player, enemies) {
    const explosionRadius = zone.radius * 2;

    enemies.forEach(enemy => {
      const dx = enemy.x - zone.x;
      const dy = enemy.y - zone.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < explosionRadius) {
        enemy.takeDamage(this.damage * 3 * (1 + player.damageBonus));
      }
    });
  }

  render(ctx, player) {
    this.zones.forEach(zone => {
      // 장판 효과
      const alpha = 0.3 - (zone.timeAlive / this.duration) * 0.2;
      ctx.fillStyle = `rgba(100, 200, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
      ctx.fill();

      // 물결 효과
      const wave = Math.sin(zone.timeAlive * 5) * 5;
      ctx.strokeStyle = `rgba(100, 200, 255, ${alpha * 2})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, zone.radius + wave, 0, Math.PI * 2);
      ctx.stroke();

      // 종료 임박 표시
      if (zone.timeAlive > this.duration - 1) {
        ctx.strokeStyle = 'rgba(255, 100, 100, 0.8)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });
  }

  applyLevelUpgrade() {
    switch (this.currentLevel) {
    case 2:
      this.areaSize = 80;
      break;
    case 3:
      this.damage = 15;
      break;
    case 4:
      this.projectileCount = 2;
      break;
    case 5:
      this.areaSize = 100;
      break;
    case 6:
      this.damage = 20;
      break;
    case 7:
      this.projectileCount = 3;
      break;
    case 8:
      this.explosionOnEnd = true;
      this.description = '장판이 사라질 때 큰 폭발을 일으킵니다.';
      break;
    }
  }
}
