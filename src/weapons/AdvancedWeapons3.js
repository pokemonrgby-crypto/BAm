import { Weapon } from './Weapon.js';
import { Projectile } from './Projectile.js';

// 레이저 빔 - 직선 관통 레이저
export class LaserBeam extends Weapon {
  constructor() {
    super('레이저 빔', 'beam');
    this.damage = 15;
    this.cooldown = 0.8;
    this.beamCount = 1;
    this.beamDuration = 0.3;
    this.beamLength = 500;
    this.beams = [];
    this.description = '전방으로 관통하는 레이저 빔을 발사합니다.';
  }

  update(dt, player, enemies) {
    super.update(dt, player, enemies);

    this.beams = this.beams.filter(beam => {
      beam.age += dt;
      return beam.age < beam.duration;
    });
  }

  activate(player, enemies) {
    const direction = player.getDirection();
    const angle = Math.atan2(direction.y, direction.x);

    for (let i = 0; i < this.beamCount; i++) {
      const spreadAngle = (i - (this.beamCount - 1) / 2) * 0.3;
      const finalAngle = angle + spreadAngle;

      const beam = {
        x: player.x,
        y: player.y,
        angle: finalAngle,
        length: this.beamLength,
        width: 8,
        damage: this.damage * (1 + player.damageBonus),
        duration: this.beamDuration,
        age: 0,
        hitEnemies: new Set()
      };

      // 레이저가 적중한 적 찾기
      enemies.forEach(enemy => {
        const dx = enemy.x - beam.x;
        const dy = enemy.y - beam.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < beam.length) {
          const angleToEnemy = Math.atan2(dy, dx);
          const angleDiff = Math.abs(angleToEnemy - beam.angle);

          if (angleDiff < 0.1 || angleDiff > Math.PI * 2 - 0.1) {
            enemy.takeDamage(beam.damage);
            beam.hitEnemies.add(enemy);
          }
        }
      });

      this.beams.push(beam);
    }
  }

  render(ctx, player) {
    this.beams.forEach(beam => {
      const alpha = 1 - (beam.age / beam.duration);

      ctx.save();
      ctx.translate(beam.x, beam.y);
      ctx.rotate(beam.angle);

      // 레이저 빔
      const gradient = ctx.createLinearGradient(0, 0, beam.length, 0);
      gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha})`);
      gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(0, -beam.width / 2, beam.length, beam.width);

      ctx.restore();
    });
  }

  applyLevelUpgrade() {
    switch (this.currentLevel) {
    case 2:
      this.damage = 22;
      break;
    case 3:
      this.beamLength = 600;
      break;
    case 4:
      this.beamCount = 2;
      break;
    case 5:
      this.damage = 30;
      break;
    case 6:
      this.cooldown = 0.6;
      break;
    case 7:
      this.beamCount = 3;
      break;
    case 8:
      this.beamDuration = 0.5;
      this.description = '3개의 강력한 레이저 빔을 발사합니다.';
      break;
    }
  }
}

// 부메랑 - 돌아오는 투사체
export class Boomerang extends Weapon {
  constructor() {
    super('부메랑', 'projectile');
    this.damage = 18;
    this.cooldown = 3.0;
    this.projectileCount = 1;
    this.description = '플레이어에게 돌아오는 부메랑을 던집니다.';
  }

  activate(player, enemies) {
    const direction = player.getDirection();

    for (let i = 0; i < this.projectileCount; i++) {
      const angle = Math.atan2(direction.y, direction.x) + (i - (this.projectileCount - 1) / 2) * 0.5;

      const boomerang = {
        x: player.x,
        y: player.y,
        startX: player.x,
        startY: player.y,
        angle: angle,
        distance: 0,
        maxDistance: 300,
        speed: 400,
        returning: false,
        damage: this.damage * (1 + player.damageBonus),
        radius: 10,
        rotation: 0,
        age: 0,
        lifetime: 3.0,
        alive: true,
        hitEnemies: new Set(),

        update(dt) {
          this.rotation += 15 * dt;
          this.age += dt;

          if (this.age >= this.lifetime) {
            this.alive = false;
            return;
          }

          if (!this.returning) {
            this.distance += this.speed * dt;
            if (this.distance >= this.maxDistance) {
              this.returning = true;
            }
            this.x = this.startX + Math.cos(this.angle) * this.distance;
            this.y = this.startY + Math.sin(this.angle) * this.distance;
          } else {
            // 플레이어에게 돌아가기
            const playerX = this.startX;
            const playerY = this.startY;
            const dx = playerX - this.x;
            const dy = playerY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 20) {
              this.alive = false;
              return;
            }

            if (dist > 0) {
              this.x += (dx / dist) * this.speed * dt;
              this.y += (dy / dist) * this.speed * dt;
            }
          }
        },

        hit(enemy) {
          if (!this.hitEnemies.has(enemy)) {
            this.hitEnemies.add(enemy);
            setTimeout(() => {
              this.hitEnemies.delete(enemy);
            }, 200);
          }
        },

        isAlive() {
          return this.alive;
        },

        render(ctx) {
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.rotate(this.rotation);

          ctx.fillStyle = '#8BC34A';
          ctx.beginPath();
          ctx.moveTo(0, -this.radius);
          ctx.quadraticCurveTo(this.radius, -this.radius, this.radius, 0);
          ctx.quadraticCurveTo(this.radius, this.radius, 0, this.radius);
          ctx.quadraticCurveTo(-this.radius, this.radius, -this.radius, 0);
          ctx.quadraticCurveTo(-this.radius, -this.radius, 0, -this.radius);
          ctx.fill();

          ctx.restore();
        }
      };

      if (player.gameEngine) {
        player.gameEngine.addProjectile(boomerang);
      }
    }
  }

  applyLevelUpgrade() {
    switch (this.currentLevel) {
    case 2:
      this.damage = 25;
      break;
    case 3:
      this.projectileCount = 2;
      break;
    case 4:
      this.damage = 35;
      break;
    case 5:
      this.cooldown = 2.5;
      break;
    case 6:
      this.projectileCount = 3;
      break;
    case 7:
      this.damage = 45;
      break;
    case 8:
      this.projectileCount = 4;
      this.description = '4개의 강력한 부메랑을 던집니다.';
      break;
    }
  }
}

// 독구름 - 지속 피해 구름
export class PoisonCloud extends Weapon {
  constructor() {
    super('독구름', 'area');
    this.damage = 8;
    this.cooldown = 5.0;
    this.cloudCount = 2;
    this.cloudRadius = 80;
    this.cloudDuration = 8.0;
    this.clouds = [];
    this.description = '독 구름을 생성하여 지속 피해를 입힙니다.';
  }

  update(dt, player, enemies) {
    super.update(dt, player, enemies);

    this.clouds = this.clouds.filter(cloud => {
      cloud.age += dt;
      cloud.damageTimer += dt;

      if (cloud.damageTimer >= 0.5) {
        cloud.damageTimer = 0;
        enemies.forEach(enemy => {
          const dist = Math.hypot(enemy.x - cloud.x, enemy.y - cloud.y);
          if (dist < cloud.radius) {
            enemy.takeDamage(this.damage * (1 + player.damageBonus));
          }
        });
      }

      return cloud.age < cloud.duration;
    });
  }

  activate(player, enemies) {
    for (let i = 0; i < this.cloudCount; i++) {
      const angle = (i / this.cloudCount) * Math.PI * 2;
      const distance = 150;

      this.clouds.push({
        x: player.x + Math.cos(angle) * distance,
        y: player.y + Math.sin(angle) * distance,
        radius: this.cloudRadius * (1 + player.areaSizeBonus),
        duration: this.cloudDuration,
        age: 0,
        damageTimer: 0
      });
    }
  }

  render(ctx, player) {
    this.clouds.forEach(cloud => {
      const alpha = 0.4 - (cloud.age / cloud.duration) * 0.2;
      const pulse = Math.sin(cloud.age * 2) * 10;

      ctx.fillStyle = `rgba(100, 200, 50, ${alpha})`;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.radius + pulse, 0, Math.PI * 2);
      ctx.fill();

      // 내부 효과
      ctx.fillStyle = `rgba(150, 255, 100, ${alpha * 0.5})`;
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.radius * 0.6 + pulse, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  applyLevelUpgrade() {
    switch (this.currentLevel) {
    case 2:
      this.damage = 12;
      break;
    case 3:
      this.cloudRadius = 100;
      break;
    case 4:
      this.cloudCount = 3;
      break;
    case 5:
      this.damage = 16;
      break;
    case 6:
      this.cloudDuration = 12.0;
      break;
    case 7:
      this.cloudCount = 4;
      break;
    case 8:
      this.cloudRadius = 130;
      this.description = '거대한 독 구름을 생성합니다.';
      break;
    }
  }
}
