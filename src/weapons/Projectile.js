export class Projectile {
  constructor(x, y, vx, vy, damage, options = {}) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.damage = damage;
    this.radius = options.radius || 5;
    this.color = options.color || '#00BCD4';
    this.pierce = options.pierce || false;
    this.pierceCount = options.pierceCount || 0;
    this.maxPierceCount = options.maxPierceCount || 0;
    this.lifetime = options.lifetime || 5.0;
    this.age = 0;
    this.alive = true;
    this.hitEnemies = new Set();
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.age += dt;

    if (this.age >= this.lifetime) {
      this.alive = false;
    }
  }

  hit(enemy) {
    if (this.hitEnemies.has(enemy)) return;

    this.hitEnemies.add(enemy);

    if (this.pierce) {
      this.pierceCount++;
      if (this.pierceCount >= this.maxPierceCount) {
        this.alive = false;
      }
    } else {
      this.alive = false;
    }
  }

  isAlive() {
    return this.alive;
  }

  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
