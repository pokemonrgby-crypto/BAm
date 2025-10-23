import { Weapon } from './Weapon.js';
import { Projectile } from './Projectile.js';

export class MagicMissile extends Weapon {
  constructor() {
    super('마법 지팡이', 'projectile');
    this.damage = 15;
    this.cooldown = 1.5;
    this.projectileCount = 1;
    this.projectileSpeed = 300;
    this.description = '가장 가까운 적을 향해 마법 미사일을 발사합니다.';
  }

  activate(player, enemies) {
    if (enemies.length === 0) return;

    // 가장 가까운 적들 찾기
    const sortedEnemies = enemies
      .map(enemy => ({
        enemy,
        distance: Math.hypot(enemy.x - player.x, enemy.y - player.y)
      }))
      .sort((a, b) => a.distance - b.distance);

    // 투사체 발사
    for (let i = 0; i < Math.min(this.projectileCount, sortedEnemies.length); i++) {
      const target = sortedEnemies[i].enemy;
      const dx = target.x - player.x;
      const dy = target.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        const vx = (dx / distance) * this.projectileSpeed;
        const vy = (dy / distance) * this.projectileSpeed;

        const projectile = new Projectile(
          player.x,
          player.y,
          vx,
          vy,
          this.damage * (1 + player.damageBonus),
          {
            radius: 6,
            color: '#00BCD4',
            pierce: this.pierce,
            maxPierceCount: this.pierce ? 999 : 0,
            lifetime: 3.0
          }
        );

        // 게임 엔진에 추가 (player를 통해 접근)
        if (player.gameEngine) {
          player.gameEngine.addProjectile(projectile);
        }
      }
    }
  }

  applyLevelUpgrade() {
    switch (this.currentLevel) {
    case 2:
      this.projectileCount = 2;
      this.description = '가장 가까운 2개의 적을 향해 마법 미사일을 발사합니다.';
      break;
    case 3:
      this.damage = 25;
      this.description = '강화된 마법 미사일을 2개 발사합니다.';
      break;
    case 4:
      this.projectileCount = 3;
      this.description = '가장 가까운 3개의 적을 향해 마법 미사일을 발사합니다.';
      break;
    case 5:
      this.damage = 35;
      break;
    case 6:
      this.cooldown = 1.0;
      break;
    case 7:
      this.projectileCount = 4;
      break;
    case 8:
      this.pierce = true;
      this.description = '관통하는 마법 미사일을 4개 발사합니다.';
      break;
    }
  }
}
