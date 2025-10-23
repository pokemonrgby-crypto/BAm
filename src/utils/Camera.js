export class Camera {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.x = 0;
    this.y = 0;
  }

  follow(targetX, targetY) {
    this.x = targetX - this.width / 2;
    this.y = targetY - this.height / 2;
  }

  apply(ctx) {
    ctx.translate(-this.x, -this.y);
  }

  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.x,
      y: worldY - this.y
    };
  }

  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.x,
      y: screenY + this.y
    };
  }

  isInView(x, y, margin = 100) {
    return x > this.x - margin &&
           x < this.x + this.width + margin &&
           y > this.y - margin &&
           y < this.y + this.height + margin;
  }
}
