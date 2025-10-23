import { Weapon } from './Weapon.js';
import { Projectile } from './Projectile.js';

// 유도탄 - 적을 추적하는 미사일
export class HomingMissile extends Weapon {
  constructor() {
    super('유도탄', 'projectile');
    this.damage = 35;
    this.cooldown = 3.0;
    this.projectileCount = 2;
    this.description = '적을 자동으로 추적하는 유도 미사일입니다.';
  }

  activate(player, enemies) {
    if (enemies.length === 0) return;

    for (let i = 0; i < this.projectileCount; i++) {
      const target = enemies[Math.floor(Math.random() * enemies.length)];

      const missile = {
        x: player.x,
        y: player.y,
        vx: 0,
        vy: 0,
        speed: 200,
        target: target,
        damage: this.damage * (1 + player.damageBonus),
        radius: 6,
        color: '#E91E63',
        age: 0,
        lifetime: 10.0,
        alive: true,
        turnSpeed: 3,
        hitEnemies: new Set(),

        update(dt) {
          if (this.target && this.target.isAlive()) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 0) {
              const targetVx = (dx / dist) * this.speed;
              const targetVy = (dy / dist) * this.speed;

              this.vx += (targetVx - this.vx) * this.turnSpeed * dt;
              this.vy += (targetVy - this.vy) * this.turnSpeed * dt;
            }
          }

          this.x += this.vx * dt;
          this.y += this.vy * dt;
          this.age += dt;
          if (this.age >= this.lifetime) this.alive = false;
        },

        hit(enemy) {
          this.alive = false;
        },

        isAlive() {
          return this.alive;
        },

        render(ctx) {
          ctx.save();
          ctx.translate(this.x, this.y);
          const angle = Math.atan2(this.vy, this.vx);
          ctx.rotate(angle);

          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.moveTo(10, 0);
          ctx.lineTo(-5, 5);
          ctx.lineTo(-5, -5);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#FFD700';
          ctx.beginPath();
          ctx.arc(-5, 0, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      };

      if (player.gameEngine) {
        player.gameEngine.addProjectile(missile);
      }
    }
  }

  applyLevelUpgrade() {
    switch (this.currentLevel) {
    case 2:
      this.projectileCount = 3;
      break;
    case 3:
      this.damage = 45;
      break;
    case 4:
      this.projectileCount = 4;
      break;
    case 5:
      this.cooldown = 2.5;
      break;
    case 6:
      this.damage = 60;
      break;
    case 7:
      this.projectileCount = 6;
      break;
    case 8:
      this.projectileCount = 8;
      this.description = '8개의 강력한 유도 미사일을 발사합니다.';
      break;
    }
  }
}

// 화염탄 - 폭발하는 화염 발사체
export class FireBall extends Weapon {
  constructor() {
    super('화염탄', 'projectile');
    this.damage = 40;
    this.cooldown = 2.5;
    this.projectileCount = 1;
    this.explosionRadius = 80;
    this.description = '폭발하여 범위 피해를 주는 화염탄을 발사합니다.';
  }

  activate(player, enemies) {
    const direction = player.getDirection();

    for (let i = 0; i < this.projectileCount; i++) {
      const angle = Math.atan2(direction.y, direction.x) + (i - (this.projectileCount - 1) / 2) * 0.4;

      const fireball = {
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * 250,
        vy: Math.sin(angle) * 250,
        damage: this.damage * (1 + player.damageBonus),
        explosionRadius: this.explosionRadius * (1 + player.areaSizeBonus),
        radius: 10,
        color: '#FF5722',
        age: 0,
        lifetime: 4.0,
        alive: true,
        exploded: false,
        hitEnemies: new Set(),

        update(dt) {
          this.x += this.vx * dt;
          this.y += this.vy * dt;
          this.age += dt;
          if (this.age >= this.lifetime) {
            this.explode();
          }
        },

        hit(enemy) {
          this.explode();
        },

        explode() {
          if (this.exploded) return;
          this.exploded = true;
          this.alive = false;

          // 폭발 효과는 게임 엔진에서 처리
          if (this.gameEngine) {
            const enemies = this.gameEngine.enemies;
            enemies.forEach(enemy => {
              const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
              if (dist < this.explosionRadius) {
                enemy.takeDamage(this.damage);
              }
            });
          }
        },

        isAlive() {
          return this.alive;
        },

        render(ctx) {
          // 화염 효과
          const pulse = 1 + Math.sin(this.age * 20) * 0.2;
          ctx.fillStyle = '#FF5722';
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius * pulse, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#FFC107';
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius * pulse * 0.6, 0, Math.PI * 2);
          ctx.fill();

          // 궤적
          ctx.strokeStyle = 'rgba(255, 87, 34, 0.3)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x - this.vx * 0.1, this.y - this.vy * 0.1);
          ctx.stroke();
        }
      };

      fireball.gameEngine = player.gameEngine;

      if (player.gameEngine) {
        player.gameEngine.addProjectile(fireball);
      }
    }
  }

  applyLevelUpgrade() {
    switch (this.currentLevel) {
    case 2:
      this.damage = 50;
      break;
    case 3:
      this.explosionRadius = 100;
      break;
    case 4:
      this.projectileCount = 2;
      break;
    case 5:
      this.damage = 65;
      break;
    case 6:
      this.explosionRadius = 120;
      break;
    case 7:
      this.projectileCount = 3;
      break;
    case 8:
      this.explosionRadius = 150;
      this.description = '거대한 폭발을 일으키는 화염탄입니다.';
      break;
    }
  }
}

// 얼음 창 - 적을 느리게 만드는 투사체
export class IceSpear extends Weapon {
  constructor() {
    super('얼음 창', 'projectile');
    this.damage = 25;
    this.cooldown = 1.8;
    this.projectileCount = 1;
    this.slowDuration = 3.0;
    this.slowAmount = 0.5;
    this.description = '적을 느리게 만드는 얼음 창을 발사합니다.';
  }

  activate(player, enemies) {
    if (enemies.length === 0) return;

    const sortedEnemies = enemies
      .map(enemy => ({
        enemy,
        distance: Math.hypot(enemy.x - player.x, enemy.y - player.y)
      }))
      .sort((a, b) => a.distance - b.distance);

    for (let i = 0; i < Math.min(this.projectileCount, sortedEnemies.length); i++) {
      const target = sortedEnemies[i].enemy;
      const dx = target.x - player.x;
      const dy = target.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        const spear = new Projectile(
          player.x,
          player.y,
          (dx / distance) * 350,
          (dy / distance) * 350,
          this.damage * (1 + player.damageBonus),
          {
            radius: 7,
            color: '#00BCD4',
            pierce: true,
            maxPierceCount: 3,
            lifetime: 3.0,
            slowDuration: this.slowDuration,
            slowAmount: this.slowAmount,
            onHit: (enemy) => {
              enemy.slowDebuff = {
                amount: this.slowAmount,
                duration: this.slowDuration
              };
            }
          }
        );

        spear.originalHit = spear.hit;
        spear.hit = function(enemy) {
          this.originalHit(enemy);
          enemy.slowDebuff = {
            amount: this.slowAmount,
            duration: this.slowDuration
          };
        };

        if (player.gameEngine) {
          player.gameEngine.addProjectile(spear);
        }
      }
    }
  }

  applyLevelUpgrade() {
    switch (this.currentLevel) {
    case 2:
      this.projectileCount = 2;
      break;
    case 3:
      this.damage = 35;
      break;
    case 4:
      this.slowDuration = 4.0;
      break;
    case 5:
      this.projectileCount = 3;
      break;
    case 6:
      this.damage = 45;
      break;
    case 7:
      this.slowAmount = 0.7;
      break;
    case 8:
      this.projectileCount = 5;
      this.description = '5개의 강력한 얼음 창을 발사합니다.';
      break;
    }
  }
}
