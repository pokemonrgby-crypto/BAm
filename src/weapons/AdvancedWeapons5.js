import { Weapon } from './Weapon.js';
import { Projectile } from './Projectile.js';

// 독침 - 중독 효과
export class PoisonDart extends Weapon {
  constructor() {
    super('독침', 'projectile');
    this.damage = 10;
    this.cooldown = 0.8;
    this.dartCount = 3;
    this.poisonDuration = 5.0;
    this.poisonDamage = 5;
    this.description = '중독 효과가 있는 독침을 발사합니다.';
  }

  activate(player, enemies) {
    if (enemies.length === 0) return;
    const sorted = enemies.sort((a, b) => 
      Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y)
    );
    
    for (let i = 0; i < Math.min(this.dartCount, sorted.length); i++) {
      const target = sorted[i];
      const dx = target.x - player.x;
      const dy = target.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        const proj = new Projectile(
          player.x, player.y, (dx/dist) * 450, (dy/dist) * 450,
          this.damage * (1 + player.damageBonus),
          { radius: 4, color: '#9C27B0', lifetime: 2.0 }
        );
        proj.poisonDuration = this.poisonDuration;
        proj.poisonDamage = this.poisonDamage;
        proj.originalHit = proj.hit;
        proj.hit = function(enemy) {
          this.originalHit(enemy);
          enemy.poisonDebuff = { damage: this.poisonDamage, duration: this.poisonDuration, timer: 0 };
        };
        if (player.gameEngine) player.gameEngine.addProjectile(proj);
      }
    }
  }

  applyLevelUpgrade() {
    if (this.currentLevel % 2 === 0) this.dartCount++;
    else { this.damage += 3; this.poisonDamage += 2; }
  }
}

// 소환수 - 플레이어를 따라다니는 친구
export class Minion extends Weapon {
  constructor() {
    super('소환수', 'minion');
    this.damage = 15;
    this.cooldown = 1.5;
    this.minionCount = 1;
    this.minions = [];
    this.description = '플레이어를 따라다니며 적을 공격하는 소환수입니다.';
  }

  update(dt, player, enemies) {
    // 소환수 초기화
    while (this.minions.length < this.minionCount) {
      this.minions.push({
        x: player.x,
        y: player.y,
        angle: (this.minions.length / this.minionCount) * Math.PI * 2,
        shootTimer: 0
      });
    }

    // 소환수 업데이트
    this.minions.forEach(minion => {
      minion.angle += 2 * dt;
      const targetX = player.x + Math.cos(minion.angle) * 50;
      const targetY = player.y + Math.sin(minion.angle) * 50;
      minion.x += (targetX - minion.x) * 5 * dt;
      minion.y += (targetY - minion.y) * 5 * dt;

      minion.shootTimer += dt;
      if (minion.shootTimer >= this.cooldown && enemies.length > 0) {
        minion.shootTimer = 0;
        const target = enemies[0];
        const dx = target.x - minion.x;
        const dy = target.y - minion.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && player.gameEngine) {
          const proj = new Projectile(
            minion.x, minion.y, (dx/dist) * 300, (dy/dist) * 300,
            this.damage * (1 + player.damageBonus),
            { radius: 5, color: '#FFC107', lifetime: 3.0 }
          );
          player.gameEngine.addProjectile(proj);
        }
      }
    });
  }

  render(ctx, player) {
    this.minions.forEach(minion => {
      ctx.fillStyle = '#FFC107';
      ctx.beginPath();
      ctx.arc(minion.x, minion.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(minion.x - 3, minion.y - 3, 3, 0, Math.PI * 2);
      ctx.arc(minion.x + 3, minion.y - 3, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  activate(player, enemies) {}

  applyLevelUpgrade() {
    if (this.currentLevel % 3 === 0) this.minionCount++;
    else this.damage += 5;
  }
}

// 폭탄 비 - 여러 폭탄 투하
export class BombRain extends Weapon {
  constructor() {
    super('폭탄 비', 'area');
    this.damage = 50;
    this.cooldown = 10.0;
    this.bombCount = 5;
    this.description = '하늘에서 여러 폭탄을 떨어뜨립니다.';
  }

  activate(player, enemies) {
    for (let i = 0; i < this.bombCount; i++) {
      setTimeout(() => {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 300;
        const x = player.x + Math.cos(angle) * dist;
        const y = player.y + Math.sin(angle) * dist;
        
        enemies.forEach(enemy => {
          if (Math.hypot(enemy.x - x, enemy.y - y) < 80 * (1 + player.areaSizeBonus)) {
            enemy.takeDamage(this.damage * (1 + player.damageBonus));
          }
        });
      }, i * 150);
    }
  }

  applyLevelUpgrade() {
    if (this.currentLevel % 2 === 0) this.bombCount += 2;
    else this.damage += 15;
  }
}

// 전기 충격 - 주변 감전
export class ElectricShock extends Weapon {
  constructor() {
    super('전기 충격', 'aura');
    this.damage = 20;
    this.cooldown = 3.0;
    this.range = 120;
    this.stunDuration = 1.0;
    this.description = '주변 적을 감전시켜 기절시킵니다.';
  }

  activate(player, enemies) {
    enemies.forEach(enemy => {
      if (Math.hypot(enemy.x - player.x, enemy.y - player.y) < this.range) {
        enemy.takeDamage(this.damage * (1 + player.damageBonus));
        enemy.stunDebuff = { duration: this.stunDuration };
      }
    });
  }

  applyLevelUpgrade() {
    this.damage += 5;
    if (this.currentLevel >= 6) this.stunDuration = 1.5;
  }
}

// 회전 검 - 플레이어 주변 회전
export class SpinningSword extends Weapon {
  constructor() {
    super('회전 검', 'orbit');
    this.damage = 18;
    this.cooldown = 0.1;
    this.swordCount = 2;
    this.radius = 60;
    this.description = '플레이어 주위를 도는 검입니다.';
  }

  activate(player, enemies) {
    const time = Date.now() / 1000;
    for (let i = 0; i < this.swordCount; i++) {
      const angle = time * 3 + (i / this.swordCount) * Math.PI * 2;
      const x = player.x + Math.cos(angle) * this.radius;
      const y = player.y + Math.sin(angle) * this.radius;
      
      enemies.forEach(enemy => {
        if (Math.hypot(enemy.x - x, enemy.y - y) < 20) {
          enemy.takeDamage(this.damage * (1 + player.damageBonus) * this.cooldown);
        }
      });
    }
  }

  render(ctx, player) {
    const time = Date.now() / 1000;
    ctx.fillStyle = '#C0C0C0';
    for (let i = 0; i < this.swordCount; i++) {
      const angle = time * 3 + (i / this.swordCount) * Math.PI * 2;
      const x = player.x + Math.cos(angle) * this.radius;
      const y = player.y + Math.sin(angle) * this.radius;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillRect(-15, -3, 30, 6);
      ctx.restore();
    }
  }

  applyLevelUpgrade() {
    if (this.currentLevel % 3 === 0) this.swordCount++;
    else this.damage += 4;
  }
}

// 분신 - 복제 공격
export class Clone extends Weapon {
  constructor() {
    super('분신', 'clone');
    this.damage = 0;
    this.cooldown = 999;
    this.cloneCount = 1;
    this.damageMultiplier = 0.5;
    this.description = '플레이어의 공격을 복제합니다.';
  }

  activate(player, enemies) {}

  applyLevelUpgrade() {
    if (this.currentLevel % 4 === 0) this.cloneCount++;
    else this.damageMultiplier += 0.1;
  }
}

// 중력장 - 적을 끌어당김
export class GravityField extends Weapon {
  constructor() {
    super('중력장', 'aura');
    this.damage = 5;
    this.cooldown = 0.2;
    this.range = 200;
    this.pullStrength = 100;
    this.description = '적을 플레이어에게 끌어당깁니다.';
  }

  activate(player, enemies) {
    enemies.forEach(enemy => {
      const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
      if (dist < this.range && dist > 0) {
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        enemy.x += (dx / dist) * this.pullStrength * this.cooldown;
        enemy.y += (dy / dist) * this.pullStrength * this.cooldown;
        enemy.takeDamage(this.damage * (1 + player.damageBonus) * this.cooldown);
      }
    });
  }

  render(ctx, player) {
    ctx.strokeStyle = 'rgba(138, 43, 226, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x, player.y, this.range, 0, Math.PI * 2);
    ctx.stroke();
  }

  applyLevelUpgrade() {
    this.damage += 2;
    if (this.currentLevel >= 5) this.pullStrength = 150;
  }
}

// 광선검 - 거대한 검 휘두르기
export class BeamSaber extends Weapon {
  constructor() {
    super('광선검', 'melee');
    this.damage = 45;
    this.cooldown = 1.5;
    this.range = 100;
    this.width = 30;
    this.swings = [];
    this.description = '거대한 광선검을 휘두릅니다.';
  }

  update(dt, player, enemies) {
    super.update(dt, player, enemies);
    this.swings = this.swings.filter(swing => {
      swing.age += dt;
      return swing.age < 0.3;
    });
  }

  activate(player, enemies) {
    const dir = player.getDirection();
    const angle = Math.atan2(dir.y, dir.x);
    this.swings.push({ angle, age: 0 });

    enemies.forEach(enemy => {
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.range) {
        const angleToEnemy = Math.atan2(dy, dx);
        const angleDiff = Math.abs(angleToEnemy - angle);
        if (angleDiff < 0.7 || angleDiff > Math.PI * 2 - 0.7) {
          enemy.takeDamage(this.damage * (1 + player.damageBonus));
        }
      }
    });
  }

  render(ctx, player) {
    this.swings.forEach(swing => {
      const alpha = 1 - swing.age / 0.3;
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(swing.angle);
      ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
      ctx.fillRect(0, -this.width / 2, this.range, this.width);
      ctx.restore();
    });
  }

  applyLevelUpgrade() {
    this.damage += 10;
    if (this.currentLevel >= 6) this.range = 130;
  }
}

// 카운터 - 피격 시 반격
export class Counter extends Weapon {
  constructor() {
    super('카운터', 'passive');
    this.damage = 50;
    this.cooldown = 5.0;
    this.counterChance = 0.3;
    this.description = '피격 시 일정 확률로 반격합니다.';
  }

  activate(player, enemies) {}

  applyLevelUpgrade() {
    this.damage += 15;
    this.counterChance = Math.min(0.8, this.counterChance + 0.1);
  }
}

// 바람 - 투사체 밀어내기
export class WindBlast extends Weapon {
  constructor() {
    super('바람', 'wave');
    this.damage = 15;
    this.cooldown = 6.0;
    this.pushForce = 300;
    this.description = '적과 투사체를 밀어냅니다.';
  }

  activate(player, enemies) {
    enemies.forEach(enemy => {
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 250 && dist > 0) {
        enemy.x += (dx / dist) * this.pushForce;
        enemy.y += (dy / dist) * this.pushForce;
        enemy.takeDamage(this.damage * (1 + player.damageBonus));
      }
    });
  }

  applyLevelUpgrade() {
    this.damage += 5;
    this.pushForce += 50;
  }
}
