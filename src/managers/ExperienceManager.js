export class ExperienceManager {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.currentExp = 0;
    this.level = 1;
    this.expToNextLevel = 10;
    this.expCurve = 1.5; // 레벨업 곡선
  }

  reset() {
    this.currentExp = 0;
    this.level = 1;
    this.expToNextLevel = 10;
  }

  addExperience(amount) {
    this.currentExp += amount;

    while (this.currentExp >= this.expToNextLevel) {
      this.levelUp();
    }
  }

  levelUp() {
    this.currentExp -= this.expToNextLevel;
    this.level++;
    this.expToNextLevel = Math.floor(10 * Math.pow(this.level, this.expCurve));

    // 레벨업 시 스킬 선택 UI 표시
    this.gameEngine.gameState = 'levelup';
    this.gameEngine.levelUpManager.showSkillChoices();
  }
}
