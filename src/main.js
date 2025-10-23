import { GameEngine } from './core/GameEngine.js';
import { UIManager } from './managers/UIManager.js';

// 게임 초기화
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const uiOverlay = document.getElementById('uiOverlay');
  const loadingScreen = document.getElementById('loadingScreen');

  // 캔버스 크기 설정
  function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    const aspectRatio = 16 / 9;
    let width = container.clientWidth;
    let height = container.clientHeight;

    if (width / height > aspectRatio) {
      width = height * aspectRatio;
    } else {
      height = width / aspectRatio;
    }

    canvas.width = Math.min(width, 1920);
    canvas.height = Math.min(height, 1080);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // UI 매니저 초기화
  const uiManager = new UIManager(uiOverlay);

  // 게임 엔진 초기화
  const gameEngine = new GameEngine(canvas, uiManager);

  // 로딩 완료
  setTimeout(() => {
    loadingScreen.style.display = 'none';
    gameEngine.start();
  }, 500);
});
