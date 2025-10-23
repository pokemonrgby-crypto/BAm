import { Weapon } from './Weapon.js';
import { Projectile } from './Projectile.js';

// 회오리 - 플레이어 주변 회전
export class Whirlwind extends Weapon {
  constructor() {
    super('회오리', 'orbit');
    this.damage = 12;
    this.cooldown = 0.1;
    this.radius = 70;
    this.description = '플레이어 주변을 도는 회오리 공격입니다.';
  }

  activate(player, enemies) {
    const range = this.radius * (1 + player.areaSizeBonus);
    enemies.forEach(enemy => {
      const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
      if (dist < range && dist > range - 30) {
        enemy.takeDamage(this.damage * (1 + player.damageBonus) * this.cooldown);
      }
    });
  }

  render(ctx, player) {
    const time = Date.now() / 1000;
    const range = this.radius * (1 + player.areaSizeBonus);
    ctx.strokeStyle = 'rgba(135, 206, 250, 0.6)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(player.x, player.y, range - i * 7, time * 3 + i, time * 3 + i + Math.PI / 2);
      ctx.stroke();
    }
  }

  applyLevelUpgrade() {
    this.radius += 15;
    this.damage += 3;
  }
}

// 운석 낙하
export class Meteor extends Weapon {
  constructor() {
    super('운석', 'area');
    this.damage = 80;
    this.cooldown = 8.0;
    this.meteorCount = 3;
    this.description = '하늘에서 운석을 떨어뜨립니다.';
  }

  activate(player, enemies) {
    for (let i = 0; i < this.meteorCount; i++) {
      setTimeout(() => {
        let targetX, targetY;
        if (enemies.length > 0) {
          const target = enemies[Math.floor(Math.random() * enemies.length)];
          targetX = target.x;
          targetY = target.y;
        } else {
          const angle = Math.random() * Math.PI * 2;
          targetX = player.x + Math.cos(angle) * 200;
          targetY = player.y + Math.sin(angle) * 200;
        }

        enemies.forEach(enemy => {
          const dist = Math.hypot(enemy.x - targetX, enemy.y - targetY);
          if (dist < 100 * (1 + player.areaSizeBonus)) {
            enemy.takeDamage(this.damage * (1 + player.damageBonus));
          }
        });
      }, i * 200);
    }
  }

  applyLevelUpgrade() {
    if (this.currentLevel % 2 === 0) this.meteorCount++;
    else this.damage += 20;
  }
}

// 체인 소 - 회전하는 사슬
export class ChainWhip extends Weapon {
  constructor() {
    super('체인 소', 'orbit');
    this.damage = 22;
    this.cooldown = 2.0;
    this.duration = 3.0;
    this.chains = [];
    this.description = '플레이어 주위를 휘두르는 체인입니다.';
  }

  update(dt, player, enemies) {
    super.update(dt, player, enemies);
    this.chains = this.chains.filter(chain => {
      chain.age += dt;
      chain.angle += 8 * dt;
      const x = player.x + Math.cos(chain.angle) * 90;
      const y = player.y + Math.sin(chain.angle) * 90;
      enemies.forEach(enemy => {
        if (Math.hypot(enemy.x - x, enemy.y - y) < 25 && !chain.hit.has(enemy)) {
          enemy.takeDamage(this.damage * (1 + player.damageBonus));
          chain.hit.add(enemy);
        }
      });
      return chain.age < this.duration;
    });
  }

  activate(player, enemies) {
    this.chains.push({ angle: 0, age: 0, hit: new Set() });
  }

  render(ctx, player) {
    this.chains.forEach(chain => {
      const x = player.x + Math.cos(chain.angle) * 90;
      const y = player.y + Math.sin(chain.angle) * 90;
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.fillStyle = '#444';
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  applyLevelUpgrade() {
    this.damage += 5;
    if (this.currentLevel >= 6) this.duration += 1;
  }
}

// 펄스 웨이브 - 확장 충격파
export class PulseWave extends Weapon {
  constructor() {
    super('펄스 웨이브', 'wave');
    this.damage = 30;
    this.cooldown = 4.0;
    this.waves = [];
    this.description = '플레이어로부터 확장되는 충격파입니다.';
  }

  update(dt, player, enemies) {
    super.update(dt, player, enemies);
    this.waves = this.waves.filter(wave => {
      wave.radius += 400 * dt;
      enemies.forEach(enemy => {
        const dist = Math.hypot(enemy.x - player.x, enemy.y - player.y);
        if (Math.abs(dist - wave.radius) < 30 && !wave.hit.has(enemy)) {
          enemy.takeDamage(this.damage * (1 + player.damageBonus));
          wave.hit.add(enemy);
        }
      });
      return wave.radius < 500;
    });
  }

  activate(player, enemies) {
    this.waves.push({ radius: 0, hit: new Set() });
  }

  render(ctx, player) {
    this.waves.forEach(wave => {
      ctx.strokeStyle = `rgba(100, 150, 255, ${1 - wave.radius / 500})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(player.x, player.y, wave.radius, 0, Math.PI * 2);
      ctx.stroke();
    });
  }

  applyLevelUpgrade() {
    this.damage += 8;
    if (this.currentLevel >= 5) this.cooldown = 3.0;
  }
}

// 샷건 - 산탄 공격
export class Shotgun extends Weapon {
  constructor() {
    super('샷건', 'projectile');
    this.damage = 8;
    this.cooldown = 1.2;
    this.pelletCount = 5;
    this.description = '여러 발의 산탄을 발사합니다.';
  }

  activate(player, enemies) {
    const dir = player.getDirection();
    const baseAngle = Math.atan2(dir.y, dir.x);
    for (let i = 0; i < this.pelletCount; i++) {
      const spread = (Math.random() - 0.5) * 0.6;
      const angle = baseAngle + spread;
      const projectile = new Projectile(
        player.x, player.y,
        Math.cos(angle) * 400,
        Math.sin(angle) * 400,
        this.damage * (1 + player.damageBonus),
        { radius: 4, color: '#FFD700', lifetime: 1.0 }
      );
      if (player.gameEngine) player.gameEngine.addProjectile(projectile);
    }
  }

  applyLevelUpgrade() {
    if (this.currentLevel % 2 === 0) this.pelletCount += 2;
    else this.damage += 3;
  }
}

// 드릴 - 전방 관통
export class Drill extends Weapon {
  constructor() {
    super('드릴', 'beam');
    this.damage = 25;
    this.cooldown = 2.0;
    this.duration = 1.5;
    this.drills = [];
    this.description = '전방을 관통하는 드릴 공격입니다.';
  }

  update(dt, player, enemies) {
    super.update(dt, player, enemies);
    this.drills = this.drills.filter(drill => {
      drill.age += dt;
      const x = player.x + Math.cos(drill.angle) * 60;
      const y = player.y + Math.sin(drill.angle) * 60;
      enemies.forEach(enemy => {
        if (Math.hypot(enemy.x - x, enemy.y - y) < 40) {
          enemy.takeDamage(this.damage * (1 + player.damageBonus) * dt);
        }
      });
      return drill.age < this.duration;
    });
  }

  activate(player, enemies) {
    const dir = player.getDirection();
    this.drills.push({ angle: Math.atan2(dir.y, dir.x), age: 0 });
  }

  render(ctx, player) {
    this.drills.forEach(drill => {
      const x = player.x + Math.cos(drill.angle) * 60;
      const y = player.y + Math.sin(drill.angle) * 60;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(drill.angle + drill.age * 20);
      ctx.fillStyle = '#666';
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.fillRect(Math.cos(a) * 15, Math.sin(a) * 15, 25, 8);
      }
      ctx.restore();
    });
  }

  applyLevelUpgrade() {
    this.damage += 6;
    if (this.currentLevel >= 6) this.duration = 2.0;
  }
}

// 시간 정지 - 적 느리게
export class TimeStop extends Weapon {
  constructor() {
    super('시간 정지', 'debuff');
    this.damage = 0;
    this.cooldown = 15.0;
    this.duration = 5.0;
    this.slowAmount = 0.8;
    this.description = '적의 시간을 느리게 만듭니다.';
  }

  activate(player, enemies) {
    enemies.forEach(enemy => {
      enemy.timeStopDebuff = {
        amount: this.slowAmount,
        duration: this.duration
      };
    });
  }

  applyLevelUpgrade() {
    if (this.currentLevel % 2 === 0) this.duration += 2;
    else this.slowAmount = Math.min(0.95, this.slowAmount + 0.05);
  }
}

// 폭풍검 - 검기 투사
export class StormBlade extends Weapon {
  constructor() {
    super('폭풍검', 'projectile');
    this.damage = 35;
    this.cooldown = 2.0;
    this.bladeCount = 1;
    this.description = '강력한 검기를 날립니다.';
  }

  activate(player, enemies) {
    const dir = player.getDirection();
    const baseAngle = Math.atan2(dir.y, dir.x);
    for (let i = 0; i < this.bladeCount; i++) {
      const angle = baseAngle + (i - (this.bladeCount - 1) / 2) * 0.4;
      const projectile = new Projectile(
        player.x, player.y,
        Math.cos(angle) * 500,
        Math.sin(angle) * 500,
        this.damage * (1 + player.damageBonus),
        { radius: 15, color: '#00FFFF', pierce: true, maxPierceCount: 999, lifetime: 2.0 }
      );
      if (player.gameEngine) player.gameEngine.addProjectile(projectile);
    }
  }

  applyLevelUpgrade() {
    if (this.currentLevel % 3 === 0) this.bladeCount++;
    else this.damage += 10;
  }
}

// 방패 - 데미지 반사
export class Shield extends Weapon {
  constructor() {
    super('방패', 'passive');
    this.damage = 0;
    this.cooldown = 999;
    this.reflectAmount = 0.2;
    this.description = '받는 피해의 일부를 반사합니다.';
  }

  activate(player, enemies) {}

  applyLevelUpgrade() {
    this.reflectAmount += 0.05;
  }
}

// 흡혈 오라
export class LifeSteal extends Weapon {
  constructor() {
    super('흡혈 오라', 'passive');
    this.damage = 0;
    this.cooldown = 999;
    this.lifeStealPercent = 0.05;
    this.description = '피해의 일부를 체력으로 회복합니다.';
  }

  activate(player, enemies) {}

  applyLevelUpgrade() {
    this.lifeStealPercent += 0.02;
  }
}
