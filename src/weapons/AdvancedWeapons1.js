import { Weapon } from './Weapon.js';

// 전기장 - 적을 감전시키는 범위 공격
export class Lightning extends Weapon {
  constructor() {
    super('전기장', 'area');
    this.damage = 30;
    this.cooldown = 4.0;
    this.areaSize = 120;
    this.chainCount = 3;
    this.description = '적을 감전시키고 주변으로 전이되는 번개를 생성합니다.';
  }

  activate(player, enemies) {
    if (enemies.length === 0) return;

    // 가장 가까운 적 찾기
    let closestEnemy = null;
    let minDistance = Infinity;

    enemies.forEach(enemy => {
      const distance = Math.hypot(enemy.x - player.x, enemy.y - player.y);
      if (distance < minDistance) {
        minDistance = distance;
        closestEnemy = enemy;
      }
    });

    if (closestEnemy) {
      this.chainLightning(closestEnemy, enemies, player, this.chainCount);
    }
  }

  chainLightning(startEnemy, enemies, player, remaining, hitEnemies = new Set()) {
    if (remaining <= 0 || !startEnemy) return;

    hitEnemies.add(startEnemy);
    startEnemy.takeDamage(this.damage * (1 + player.damageBonus));

    // 다음 대상 찾기
    let nextEnemy = null;
    let minDistance = Infinity;

    enemies.forEach(enemy => {
      if (hitEnemies.has(enemy)) return;

      const distance = Math.hypot(enemy.x - startEnemy.x, enemy.y - startEnemy.y);
      if (distance < this.areaSize && distance < minDistance) {
        minDistance = distance;
        nextEnemy = enemy;
      }
    });

    if (nextEnemy) {
      this.chainLightning(nextEnemy, enemies, player, remaining - 1, hitEnemies);
    }
  }

  applyLevelUpgrade() {
    switch (this.currentLevel) {
    case 2:
      this.chainCount = 4;
      break;
    case 3:
      this.damage = 40;
      break;
    case 4:
      this.chainCount = 5;
      break;
    case 5:
      this.areaSize = 150;
      break;
    case 6:
      this.damage = 55;
      break;
    case 7:
      this.chainCount = 7;
      break;
    case 8:
      this.cooldown = 2.5;
      this.description = '더 빠르고 강력한 연쇄 번개입니다.';
      break;
    }
  }
}

// 위성 - 플레이어 주변을 도는 공격형 위성
export class Satellite extends Weapon {
  constructor() {
    super('위성', 'orbit');
    this.damage = 20;
    this.cooldown = 0.5;
    this.satelliteCount = 2;
    this.orbitalRadius = 100;
    this.shootRange = 250;
    this.satellites = [];
    this.description = '플레이어 주위를 돌며 적을 자동으로 공격하는 위성입니다.';
  }

  update(dt, player, enemies) {
    // 위성 초기화
    if (this.satellites.length === 0) {
      for (let i = 0; i < this.satelliteCount; i++) {
        this.satellites.push({
          angle: (i / this.satelliteCount) * Math.PI * 2,
          shootTimer: 0
        });
      }
    }

    // 위성 업데이트
    this.satellites.forEach(satellite => {
      satellite.angle += 1.5 * dt;
      satellite.shootTimer += dt;

      if (satellite.shootTimer >= this.cooldown) {
        satellite.shootTimer = 0;

        // 사거리 내 가장 가까운 적 찾기
        const satX = player.x + Math.cos(satellite.angle) * this.orbitalRadius;
        const satY = player.y + Math.sin(satellite.angle) * this.orbitalRadius;

        let target = null;
        let minDist = this.shootRange;

        enemies.forEach(enemy => {
          const dist = Math.hypot(enemy.x - satX, enemy.y - satY);
          if (dist < minDist) {
            minDist = dist;
            target = enemy;
          }
        });

        if (target && player.gameEngine) {
          const dx = target.x - satX;
          const dy = target.y - satY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const projectile = {
            x: satX,
            y: satY,
            vx: (dx / dist) * 400,
            vy: (dy / dist) * 400,
            damage: this.damage * (1 + player.damageBonus),
            radius: 4,
            color: '#FF9800',
            age: 0,
            lifetime: 2.0,
            alive: true,
            hitEnemies: new Set(),
            update(dt) {
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
              ctx.fillStyle = this.color;
              ctx.beginPath();
              ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
              ctx.fill();
            }
          };

          player.gameEngine.addProjectile(projectile);
        }
      }
    });
  }

  render(ctx, player) {
    this.satellites.forEach(satellite => {
      const x = player.x + Math.cos(satellite.angle) * this.orbitalRadius;
      const y = player.y + Math.sin(satellite.angle) * this.orbitalRadius;

      // 위성 그리기
      ctx.fillStyle = '#FF9800';
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  activate(player, enemies) {
    // 패시브 스킬이므로 비워둠
  }

  applyLevelUpgrade() {
    switch (this.currentLevel) {
    case 2:
      this.satelliteCount = 3;
      this.satellites = [];
      break;
    case 3:
      this.damage = 28;
      break;
    case 4:
      this.shootRange = 300;
      break;
    case 5:
      this.cooldown = 0.4;
      break;
    case 6:
      this.satelliteCount = 4;
      this.satellites = [];
      break;
    case 7:
      this.damage = 38;
      break;
    case 8:
      this.satelliteCount = 6;
      this.satellites = [];
      this.description = '6개의 위성이 강력한 공격을 수행합니다.';
      break;
    }
  }
}
