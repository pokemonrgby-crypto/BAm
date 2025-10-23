export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {};
    this.mousePos = { x: 0, y: 0 };
    this.touch = null;
    this.listeners = {};

    this.setupKeyboard();
    this.setupTouch();
    this.setupMouse();
  }

  setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      this.emit('keydown', e.key);
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
      this.emit('keyup', e.key);
    });
  }

  setupTouch() {
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.touch = {
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY
      };
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.touch) {
        const touch = e.touches[0];
        this.touch.currentX = touch.clientX;
        this.touch.currentY = touch.clientY;
      }
    });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.touch = null;
    });
  }

  setupMouse() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos.x = e.clientX - rect.left;
      this.mousePos.y = e.clientY - rect.top;
    });
  }

  getInput() {
    const input = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    // 키보드 입력
    if (this.keys['w'] || this.keys['W'] || this.keys['ArrowUp']) {
      input.up = true;
    }
    if (this.keys['s'] || this.keys['S'] || this.keys['ArrowDown']) {
      input.down = true;
    }
    if (this.keys['a'] || this.keys['A'] || this.keys['ArrowLeft']) {
      input.left = true;
    }
    if (this.keys['d'] || this.keys['D'] || this.keys['ArrowRight']) {
      input.right = true;
    }

    // 터치 입력 (가상 조이스틱)
    if (this.touch) {
      const dx = this.touch.currentX - this.touch.startX;
      const dy = this.touch.currentY - this.touch.startY;
      const threshold = 20;

      if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx > 0) input.right = true;
          else input.left = true;
        } else {
          if (dy > 0) input.down = true;
          else input.up = true;
        }
      }
    }

    return input;
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  isKeyPressed(key) {
    return this.keys[key] === true;
  }
}
