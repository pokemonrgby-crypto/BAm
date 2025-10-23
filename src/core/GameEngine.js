import { Player } from '../entities/Player.js';
import { EnemySpawner } from '../enemies/EnemySpawner.js';
import { CollisionDetector } from '../utils/CollisionDetector.js';
import { Camera } from '../utils/Camera.js';
import { InputManager } from '../managers/InputManager.js';
import { WeaponManager } from '../managers/WeaponManager.js';
import { ExperienceManager } from '../managers/ExperienceManager.js';
import { LevelUpManager } from '../managers/LevelUpManager.js';
import { ActiveSkillManager } from '../managers/ActiveSkillManager.js';
import { ItemManager } from '../managers/ItemManager.js';

export class GameEngine {
  constructor(canvas, uiManager) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.uiManager = uiManager;

    // 게임 상태
    this.gameState = 'menu'; // menu, playing, paused, gameover
    this.gameTime = 0;
    this.deltaTime = 0;
    this.lastFrameTime = 0;

    // 무한 맵 크기
    this.worldSize = { width: 10000, height: 10000 };

    // 게임 매니저들
    this.camera = new Camera(canvas.width, canvas.height);
    this.inputManager = new InputManager(canvas);
    this.collisionDetector = new CollisionDetector();

    // 플레이어
    this.player = new Player(0, 0);
    this.player.gameEngine = this; // 플레이어가 게임 엔진 참조

    // 적 관리
    this.enemySpawner = new EnemySpawner(this);
    this.enemies = [];

    // 아이템 관리
    this.itemManager = new ItemManager(this);
    this.items = [];

    // 무기 시스템
    this.weaponManager = new WeaponManager(this.player);

    // 경험치 및 레벨업
    this.experienceManager = new ExperienceManager(this);
    this.levelUpManager = new LevelUpManager(this);

    // 액티브 스킬
    this.activeSkillManager = new ActiveSkillManager(this.player);

    // 투사체
    this.projectiles = [];

    // 이벤트 리스너 설정
    this.setupEventListeners();

    // UI 초기화
    this.uiManager.showMainMenu(() => this.startGame());
  }

  setupEventListeners() {
    // 뒤로가기 버튼 처리
    window.addEventListener('popstate', (e) => {
      if (this.gameState === 'playing') {
        e.preventDefault();
        this.pauseGame();
      }
    });

    // 키보드 입력
    this.inputManager.on('keydown', (key) => {
      if (key === 'Escape') {
        this.togglePause();
      } else if (key === ' ') {
        this.activeSkillManager.useSkill('dash');
      } else if (key === 'q' || key === 'Q') {
        this.activeSkillManager.useSkill('bomb');
      }
    });
  }

  startGame() {
    this.gameState = 'playing';
    this.gameTime = 0;
    this.player.reset();
    this.enemies = [];
    this.projectiles = [];
    this.items = [];
    this.weaponManager.reset();
    this.experienceManager.reset();
    this.activeSkillManager.reset();
    this.enemySpawner.reset();

    this.uiManager.hideMainMenu();
    this.uiManager.showGameHUD();
  }

  pauseGame() {
    if (this.gameState === 'playing') {
      this.gameState = 'paused';
      this.uiManager.showPauseMenu(
        () => this.resumeGame(),
        () => this.backToMenu()
      );
    }
  }

  resumeGame() {
    this.gameState = 'playing';
    this.uiManager.hidePauseMenu();
  }

  togglePause() {
    if (this.gameState === 'playing') {
      this.pauseGame();
    } else if (this.gameState === 'paused') {
      this.resumeGame();
    }
  }

  backToMenu() {
    this.gameState = 'menu';
    this.uiManager.hidePauseMenu();
    this.uiManager.hideGameHUD();
    this.uiManager.showMainMenu(() => this.startGame());
  }

  gameOver() {
    this.gameState = 'gameover';
    this.uiManager.showGameOver(
      this.gameTime,
      this.experienceManager.level,
      () => this.startGame(),
      () => this.backToMenu()
    );
  }

  start() {
    this.lastFrameTime = performance.now();
    this.gameLoop();
  }

  gameLoop() {
    requestAnimationFrame(() => this.gameLoop());

    const currentTime = performance.now();
    this.deltaTime = (currentTime - this.lastFrameTime) / 1000;
    this.lastFrameTime = currentTime;

    // 델타타임 제한 (렉 방지)
    if (this.deltaTime > 0.1) {
      this.deltaTime = 0.1;
    }

    if (this.gameState === 'playing') {
      this.update(this.deltaTime);
    }

    this.render();
  }

  update(dt) {
    this.gameTime += dt;

    // 플레이어 업데이트
    const input = this.inputManager.getInput();
    this.player.update(dt, input);

    // 카메라를 플레이어 추적
    this.camera.follow(this.player.x, this.player.y);

    // 무기 업데이트
    this.weaponManager.update(dt, this.enemies);

    // 액티브 스킬 업데이트
    this.activeSkillManager.update(dt);

    // 적 스폰 및 업데이트
    this.enemySpawner.update(dt);
    this.enemies.forEach(enemy => {
      enemy.update(dt, this.player);
    });

    // 투사체 업데이트
    this.projectiles = this.projectiles.filter(projectile => {
      projectile.update(dt);
      return projectile.isAlive();
    });

    // 아이템 업데이트
    this.items = this.items.filter(item => {
      item.update(dt, this.player);
      return item.isAlive();
    });

    // 충돌 처리
    this.handleCollisions();

    // 죽은 적 제거 및 보상 생성
    this.enemies = this.enemies.filter(enemy => {
      if (!enemy.isAlive()) {
        this.itemManager.spawnExperienceGem(enemy.x, enemy.y, enemy.expValue);
        return false;
      }
      return true;
    });

    // UI 업데이트
    this.uiManager.updateGameHUD({
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      level: this.experienceManager.level,
      exp: this.experienceManager.currentExp,
      expToNext: this.experienceManager.expToNextLevel,
      time: this.gameTime,
      weapons: this.weaponManager.getWeaponSlots(),
      activeSkills: this.activeSkillManager.getSkillStates()
    });

    // 게임 오버 확인
    if (this.player.health <= 0) {
      this.gameOver();
    }
  }

  handleCollisions() {
    // 투사체와 적 충돌
    this.projectiles.forEach(projectile => {
      this.enemies.forEach(enemy => {
        if (this.collisionDetector.checkCircleCollision(
          projectile.x, projectile.y, projectile.radius,
          enemy.x, enemy.y, enemy.radius
        )) {
          projectile.hit(enemy);
          enemy.takeDamage(projectile.damage);
        }
      });
    });

    // 플레이어와 적 충돌
    this.enemies.forEach(enemy => {
      if (this.collisionDetector.checkCircleCollision(
        this.player.x, this.player.y, this.player.radius,
        enemy.x, enemy.y, enemy.radius
      )) {
        if (!this.player.isInvincible()) {
          this.player.takeDamage(enemy.damage);
        }
      }
    });

    // 플레이어와 아이템 충돌 (자석 효과 포함)
    this.items.forEach(item => {
      const distance = Math.hypot(
        item.x - this.player.x,
        item.y - this.player.y
      );

      if (distance < this.player.magnetRange) {
        item.moveTowardsPlayer(this.player.x, this.player.y, this.deltaTime);
      }

      if (distance < this.player.radius + item.radius) {
        item.collect(this.player, this.experienceManager);
      }
    });
  }

  render() {
    // 화면 클리어
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 카메라 변환 적용
    this.ctx.save();
    this.camera.apply(this.ctx);

    // 배경 그리드 그리기
    this.renderBackground();

    // 아이템 렌더링
    this.items.forEach(item => item.render(this.ctx));

    // 플레이어 렌더링
    this.player.render(this.ctx);

    // 무기 이펙트 렌더링
    this.weaponManager.render(this.ctx);

    // 적 렌더링
    this.enemies.forEach(enemy => enemy.render(this.ctx));

    // 투사체 렌더링
    this.projectiles.forEach(projectile => projectile.render(this.ctx));

    // 카메라 변환 해제
    this.ctx.restore();
  }

  renderBackground() {
    const gridSize = 50;
    const ctx = this.ctx;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    const startX = Math.floor(-this.camera.x / gridSize) * gridSize;
    const startY = Math.floor(-this.camera.y / gridSize) * gridSize;
    const endX = startX + this.canvas.width + gridSize;
    const endY = startY + this.canvas.height + gridSize;

    for (let x = startX; x < endX; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
      ctx.stroke();
    }

    for (let y = startY; y < endY; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
      ctx.stroke();
    }
  }

  addEnemy(enemy) {
    this.enemies.push(enemy);
  }

  addProjectile(projectile) {
    this.projectiles.push(projectile);
  }

  addItem(item) {
    this.items.push(item);
  }
}
