import { Weapon } from './Weapon.js';

export class HolyBible extends Weapon {
  constructor() {
    super('성경', 'orbit');
    this.damage = 25;
    this.cooldown = 5.0;
    this.projectileCount = 2;
    this.duration = 10.0;
    this.orbitalSpeed = 2.0;
    this.orbitalRadius = 80;
    this.active = false;
    this.orbitals = [];
    this.permanent = false;
    this.description = '플레이어 주위를 공전하는 성경이 적을 타격합니다.';
  }

  update(dt, player, enemies) {
    if (this.permanent) {
      this.activateOrbitals(player);
      this.updateOrbitals(dt, player, enemies);
    } else {
      super.update(dt, player, enemies);
      this.updateOrbitals(dt, player, enemies);
    }
  }

  activate(player, enemies) {
    if (!this.permanent) {
      this.activateOrbitals(player);
    }
  }

  activateOrbitals(player) {
    this.orbitals = [];
    for (let i = 0; i < this.projectileCount; i++) {
      this.orbitals.push({
        angle: (i / this.projectileCount) * Math.PI * 2,
        timeAlive: 0,
        hitEnemies: new Set()
      });
    }
    this.active = true;
  }

  updateOrbitals(dt, player, enemies) {
    if (!this.active) return;

    const radius = this.orbitalRadius * (1 + player.areaSizeBonus);

    this.orbitals = this.orbitals.filter(orbital => {
      orbital.angle += this.orbitalSpeed * dt;
      orbital.timeAlive += dt;

      // 위치 계산
      const x = player.x + Math.cos(orbital.angle) * radius;
      const y = player.y + Math.sin(orbital.angle) * radius;

      // 적과 충돌 검사
      enemies.forEach(enemy => {
        const dx = enemy.x - x;
        const dy = enemy.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 20 + enemy.radius && !orbital.hitEnemies.has(enemy)) {
          enemy.takeDamage(this.damage * (1 + player.damageBonus));
          orbital.hitEnemies.add(enemy);

          // 일정 시간 후 다시 타격 가능
          setTimeout(() => {
            orbital.hitEnemies.delete(enemy);
          }, 500);
        }
      });

      // 지속 시간 확인
      return this.permanent || orbital.timeAlive < this.duration;
    });

    if (!this.permanent && this.orbitals.length === 0) {
      this.active = false;
    }
  }

  render(ctx, player) {
    if (!this.active) return;

    const radius = this.orbitalRadius * (1 + player.areaSizeBonus);

    this.orbitals.forEach(orbital => {
      const x = player.x + Math.cos(orbital.angle) * radius;
      const y = player.y + Math.sin(orbital.angle) * radius;

      // 성경 그리기
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(orbital.angle);

      ctx.fillStyle = '#FFD700';
      ctx.fillRect(-15, -10, 30, 20);

      ctx.fillStyle = '#FFF';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✝', 0, 0);

      ctx.restore();
    });
  }

  applyLevelUpgrade() {
    switch (this.currentLevel) {
    case 2:
      this.projectileCount = 3;
      break;
    case 3:
      this.duration = 15.0;
      break;
    case 4:
      this.projectileCount = 4;
      break;
    case 5:
      this.cooldown = 4.0;
      break;
    case 6:
      this.damage = 35;
      break;
    case 7:
      this.projectileCount = 5;
      break;
    case 8:
      this.permanent = true;
      this.description = '영구적으로 공전하는 성경입니다.';
      break;
    }
  }
}
