import { Enemy } from './Enemy.js';

export class EnemySpawner {
  constructor(gameEngine) {
    this.gameEngine = gameEngine;
    this.spawnTimer = 0;
    this.spawnInterval = 2.0; // 초당 스폰
    this.spawnDistance = 600; // 플레이어로부터의 스폰 거리

    // 난이도 증가
    this.difficultyTimer = 0;
    this.difficultyInterval = 30; // 30초마다 난이도 증가
    this.difficultyLevel = 1;

    // 보스 스폰
    this.bossTimer = 0;
    this.bossInterval = 120; // 2분마다 보스
  }

  reset() {
    this.spawnTimer = 0;
    this.difficultyTimer = 0;
    this.difficultyLevel = 1;
    this.bossTimer = 0;
  }

  update(dt) {
    this.spawnTimer += dt;
    this.difficultyTimer += dt;
    this.bossTimer += dt;

    // 난이도 증가
    if (this.difficultyTimer >= this.difficultyInterval) {
      this.difficultyTimer = 0;
      this.difficultyLevel++;
      this.spawnInterval = Math.max(0.5, this.spawnInterval - 0.1);
    }

    // 보스 스폰
    if (this.bossTimer >= this.bossInterval) {
      this.bossTimer = 0;
      this.spawnBoss();
    }

    // 일반 적 스폰
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnEnemies();
    }
  }

  spawnEnemies() {
    const player = this.gameEngine.player;
    const count = Math.min(1 + Math.floor(this.difficultyLevel / 3), 5);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const x = player.x + Math.cos(angle) * this.spawnDistance;
      const y = player.y + Math.sin(angle) * this.spawnDistance;

      const type = this.getRandomEnemyType();
      const enemy = new Enemy(x, y, type);

      // 난이도에 따른 스탯 증가
      enemy.maxHealth *= (1 + this.difficultyLevel * 0.1);
      enemy.health = enemy.maxHealth;
      enemy.damage *= (1 + this.difficultyLevel * 0.05);
      enemy.expValue = Math.floor(enemy.expValue * (1 + this.difficultyLevel * 0.1));

      this.gameEngine.addEnemy(enemy);
    }
  }

  getRandomEnemyType() {
    const rand = Math.random();
    const difficultyFactor = Math.min(this.difficultyLevel / 10, 1);

    if (rand < 0.5) return 'basic';
    if (rand < 0.7) return 'fast';
    if (rand < 0.85) return 'tank';
    if (rand < 1.0 && difficultyFactor > 0.3) return 'shooter';

    return 'basic';
  }

  spawnBoss() {
    const player = this.gameEngine.player;
    const angle = Math.random() * Math.PI * 2;
    const x = player.x + Math.cos(angle) * this.spawnDistance;
    const y = player.y + Math.sin(angle) * this.spawnDistance;

    const boss = new Enemy(x, y, 'boss');
    boss.maxHealth *= this.difficultyLevel;
    boss.health = boss.maxHealth;
    boss.damage *= (1 + this.difficultyLevel * 0.1);

    this.gameEngine.addEnemy(boss);
  }
}
