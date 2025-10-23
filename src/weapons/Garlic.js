import { Weapon } from './Weapon.js';

export class Garlic extends Weapon {
  constructor() {
    super('마늘', 'aura');
    this.damage = 5;
    this.cooldown = 0.1; // 지속형이므로 빠른 틱
    this.areaSize = 80;
    this.knockback = 50;
    this.defenseReduction = 0;
    this.description = '플레이어 주변의 적에게 지속 피해를 주고 밀쳐냅니다.';
  }

  activate(player, enemies) {
    const range = this.areaSize * (1 + player.areaSizeBonus);

    enemies.forEach(enemy => {
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < range) {
        // 피해 적용
        enemy.takeDamage(this.damage * (1 + player.damageBonus) * this.cooldown);

        // 넉백 적용
        if (distance > 0) {
          const pushForce = this.knockback * this.cooldown;
          enemy.x += (dx / distance) * pushForce;
          enemy.y += (dy / distance) * pushForce;
        }

        // 방어력 감소 (극대화)
        if (this.defenseReduction > 0) {
          enemy.defenseDebuff = {
            amount: this.defenseReduction,
            duration: 3.0
          };
        }
      }
    });
  }

  render(ctx, player) {
    const range = this.areaSize * (1 + player.areaSizeBonus);

    // 마늘 오라 효과
    const alpha = 0.2 + Math.sin(Date.now() / 200) * 0.1;
    ctx.fillStyle = `rgba(255, 235, 59, ${alpha})`;
    ctx.beginPath();
    ctx.arc(player.x, player.y, range, 0, Math.PI * 2);
    ctx.fill();

    // 테두리
    ctx.strokeStyle = 'rgba(255, 235, 59, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  applyLevelUpgrade() {
    switch (this.currentLevel) {
    case 2:
      this.areaSize = 100;
      break;
    case 3:
      this.damage = 8;
      break;
    case 4:
      this.areaSize = 120;
      break;
    case 5:
      this.knockback = 80;
      break;
    case 6:
      this.damage = 12;
      break;
    case 7:
      this.areaSize = 150;
      break;
    case 8:
      this.defenseReduction = 0.3;
      this.description = '적의 방어력을 감소시키는 마늘 오라입니다.';
      break;
    }
  }
}
