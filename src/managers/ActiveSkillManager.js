export class ActiveSkillManager {
  constructor(player) {
    this.player = player;
    this.skills = {
      dash: {
        name: 'Dash',
        maxCharges: 2,
        currentCharges: 2,
        chargeCooldown: 3.0,
        chargeTimer: 0,
        isUsing: false
      },
      bomb: {
        name: 'Bomb',
        cooldown: 60.0,
        cooldownTimer: 0,
        isReady: true
      }
    };
  }

  reset() {
    this.skills.dash.currentCharges = this.skills.dash.maxCharges;
    this.skills.dash.chargeTimer = 0;
    this.skills.bomb.cooldownTimer = 0;
    this.skills.bomb.isReady = true;
  }

  update(dt) {
    // Dash 충전 업데이트
    if (this.skills.dash.currentCharges < this.skills.dash.maxCharges) {
      this.skills.dash.chargeTimer += dt;
      if (this.skills.dash.chargeTimer >= this.skills.dash.chargeCooldown) {
        this.skills.dash.chargeTimer = 0;
        this.skills.dash.currentCharges++;
      }
    }

    // Bomb 쿨다운 업데이트
    if (!this.skills.bomb.isReady) {
      this.skills.bomb.cooldownTimer += dt;
      if (this.skills.bomb.cooldownTimer >= this.skills.bomb.cooldown) {
        this.skills.bomb.cooldownTimer = 0;
        this.skills.bomb.isReady = true;
      }
    }
  }

  useSkill(skillName) {
    if (skillName === 'dash') {
      return this.useDash();
    } else if (skillName === 'bomb') {
      return this.useBomb();
    }
    return false;
  }

  useDash() {
    if (this.skills.dash.currentCharges > 0 && !this.skills.dash.isUsing) {
      this.skills.dash.currentCharges--;
      this.skills.dash.isUsing = true;

      // 대시 실행
      const direction = this.player.getDirection();
      const dashDistance = 150;
      const dashDuration = 0.2;

      this.player.x += direction.x * dashDistance;
      this.player.y += direction.y * dashDistance;
      this.player.invincibleTime = dashDuration;

      // 대시 상태 해제
      setTimeout(() => {
        this.skills.dash.isUsing = false;
      }, dashDuration * 1000);

      return true;
    }
    return false;
  }

  useBomb() {
    if (this.skills.bomb.isReady) {
      this.skills.bomb.isReady = false;
      this.skills.bomb.cooldownTimer = 0;

      // 폭탄 실행 - 모든 일반 적 제거
      if (this.player.gameEngine) {
        const enemies = this.player.gameEngine.enemies;
        enemies.forEach(enemy => {
          if (!enemy.isBoss) {
            enemy.takeDamage(enemy.health); // 즉사
          } else {
            enemy.takeDamage(500); // 보스는 큰 피해
          }
        });
      }

      return true;
    }
    return false;
  }

  getSkillStates() {
    return {
      dash: {
        charges: this.skills.dash.currentCharges,
        maxCharges: this.skills.dash.maxCharges,
        chargeProgress: this.skills.dash.chargeTimer / this.skills.dash.chargeCooldown
      },
      bomb: {
        isReady: this.skills.bomb.isReady,
        cooldownProgress: this.skills.bomb.cooldownTimer / this.skills.bomb.cooldown
      }
    };
  }
}
