const CONFIG = {
  canvas: { width: 800, height: 600 },
  player: { width: 32, height: 32, speed: 350, y: 540, lives: 3, shootCooldown: 0.25 },
  aliens: { rows: 5, cols: 11, width: 32, height: 32, padding: 16, offsetTop: 80, speed: 50, stepDown: 24, pointsPerRow: [50, 40, 30, 20, 10], shootInterval: [0.5, 3.0] },
  bullets: { playerSpeed: 700, alienSpeed: 350, width: 4, height: 14, color: '#FFFFFF', alienColor: '#FF4444' },
  bunkers: { count: 4, width: 80, height: 50, y: 460 },
  levels: { speedMultiplier: 1.3, bonus: 500 },
  starField: { count: 100, speed: 30 }
};
CONFIG.player.speedPerFrame = CONFIG.player.speed / 60;
CONFIG.bullets.playerSpeedPerFrame = CONFIG.bullets.playerSpeed / 60;
CONFIG.bullets.alienSpeedPerFrame = CONFIG.bullets.alienSpeed / 60;
CONFIG.aliens.speedPerFrame = CONFIG.aliens.speed / 60;
CONFIG.starField.speedPerFrame = CONFIG.starField.speed / 60;

const ASSETS = {
  ghost: null,
  sounds: {}
};

function loadAsset(el, timeout) {
  return new Promise(resolve => {
    const done = () => { clearTimeout(tid); resolve(); };
    const tid = setTimeout(done, timeout);
    el.addEventListener('error', done, { once: true });
    if (el instanceof HTMLAudioElement) {
      if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) { resolve(); return; }
      el.addEventListener('canplaythrough', done, { once: true });
      el.load();
    } else {
      if (el.complete) { resolve(); return; }
      el.addEventListener('load', done, { once: true });
    }
  });
}

async function preloadAssets() {
  console.log('Loading assets...');
  const img = new Image();
  img.src = 'assets/ghosty.png';
  const sounds = {};
  for (const [k, path] of [['shoot', 'assets/jump.wav'], ['hit', 'assets/game_over.wav'], ['FAH', 'assets/FAH.mp3']]) {
    try {
      const a = new Audio(path);
      await loadAsset(a, 3000);
      sounds[k] = a;
    } catch (e) { console.warn(`Audio ${path} failed:`, e); }
  }
  await loadAsset(img, 5000).catch(() => {});
  ASSETS.ghost = img;
  ASSETS.sounds = sounds;
  console.log('Assets loaded');
}

const STATE = { START: 'start', PLAYING: 'playing', GAMEOVER: 'gameover' };

const ALIEN_COLORS = ['#FF6B6B', '#FF9F43', '#FECA57', '#4ECDC4', '#45B7D1'];
const ALIEN_NAMES = ['squid', 'crab', 'crab', 'basic', 'basic'];

function checkAABB(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

function drawAlien(ctx, x, y, type, frame) {
  const c = ALIEN_COLORS[type];
  const w = 32, h = 32;

  ctx.fillStyle = c;

  if (type === 0) {
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2 - 2, 12, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + 6, y + 16, 6, frame === 0 ? 10 : 6);
    ctx.fillRect(x + 20, y + 16, 6, frame === 0 ? 10 : 6);
    ctx.fillRect(x + 8, y + 22, 4, frame === 0 ? 6 : 3);
    ctx.fillRect(x + 20, y + 22, 4, frame === 0 ? 6 : 3);
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 8, y + 8, 6, 6);
    ctx.fillRect(x + 18, y + 8, 6, 6);
    ctx.fillStyle = '#222';
    ctx.fillRect(x + 10, y + 10, 3, 3);
    ctx.fillRect(x + 20, y + 10, 3, 3);
  } else if (type <= 2) {
    ctx.fillRect(x + 2, y + 6, 28, 16);
    ctx.fillRect(x, y + 12, 6, 8);
    ctx.fillRect(x + 26, y + 12, 6, 8);
    if (frame === 0) {
      ctx.fillRect(x, y + 6, 4, 4);
      ctx.fillRect(x + 28, y + 6, 4, 4);
    }
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 7, y + 9, 6, 6);
    ctx.fillRect(x + 19, y + 9, 6, 6);
    ctx.fillStyle = '#222';
    ctx.fillRect(x + 9, y + 11, 3, 3);
    ctx.fillRect(x + 21, y + 11, 3, 3);
    ctx.fillStyle = c;
    ctx.fillRect(x + 14, y + 22, 4, 8);
  } else {
    ctx.fillRect(x + 4, y + 6, 24, 18);
    if (frame === 0) {
      ctx.fillRect(x + 6, y + 24, 5, 6);
      ctx.fillRect(x + 21, y + 24, 5, 6);
    }
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 8, y + 10, 6, 6);
    ctx.fillRect(x + 18, y + 10, 6, 6);
    ctx.fillStyle = '#222';
    ctx.fillRect(x + 10, y + 12, 3, 3);
    ctx.fillRect(x + 20, y + 12, 3, 3);
  }
}

class Player {
  constructor() {
    this.w = CONFIG.player.width;
    this.h = CONFIG.player.height;
    this.x = CONFIG.canvas.width / 2 - this.w / 2;
    this.y = CONFIG.player.y;
    this.speed = CONFIG.player.speedPerFrame;
    this.lives = CONFIG.player.lives;
    this.shootCooldown = 0;
    this.moveDir = 0;
    this.invuln = 0;
    this.tilt = 0;
    this.bob = 0;
  }

  update(dt) {
    this.x += this.moveDir * this.speed * dt * 60;
    this.x = Math.max(0, Math.min(CONFIG.canvas.width - this.w, this.x));
    if (this.invuln > 0) this.invuln -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    this.tilt += (this.moveDir * 8 - this.tilt) * 0.15;
    this.bob += dt * 3;
  }

  shoot() {
    if (this.shootCooldown <= 0) {
      this.shootCooldown = CONFIG.player.shootCooldown;
      return { x: this.x + this.w / 2, y: this.y };
    }
    return null;
  }

  hit() {
    if (this.invuln > 0) return false;
    this.lives--;
    this.invuln = 2;
    return true;
  }

  getBounds() {
    return { x: this.x + 2, y: this.y + 2, w: this.w - 4, h: this.h - 4 };
  }

  render(ctx) {
    if (this.invuln > 0 && Math.floor(this.invuln * 8) % 2 === 0) return;
    ctx.save();
    ctx.translate(this.x + this.w / 2, this.y + this.h / 2);
    ctx.rotate(this.tilt * Math.PI / 180);
    const bobY = Math.sin(this.bob) * 1.5;
    if (ASSETS.ghost && ASSETS.ghost.complete && ASSETS.ghost.naturalWidth > 0) {
      ctx.drawImage(ASSETS.ghost, -this.w / 2, -this.h / 2 + bobY, this.w, this.h);
      ctx.shadowColor = 'rgba(180, 180, 255, 0.4)';
      ctx.shadowBlur = 12;
      ctx.drawImage(ASSETS.ghost, -this.w / 2, -this.h / 2 + bobY, this.w, this.h);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = '#E8E8FF';
      ctx.shadowColor = 'rgba(180, 180, 255, 0.5)';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.ellipse(0, 2 + bobY, 14, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#333';
      ctx.fillRect(-5, -3 + bobY, 4, 4);
      ctx.fillRect(1, -3 + bobY, 4, 4);
      ctx.fillStyle = '#fff';
      ctx.fillRect(-7, -4 + bobY, 3, 3);
      ctx.fillRect(-1, -4 + bobY, 3, 3);
    }
    ctx.restore();
  }
}

class Alien {
  constructor(x, y, row) {
    this.x = x;
    this.y = y;
    this.row = row;
    this.type = row;
    this.w = CONFIG.aliens.width;
    this.h = CONFIG.aliens.height;
    this.alive = true;
    this.frame = 0;
    this.timer = 0;
  }

  update(dt) {
    this.timer += dt;
    if (this.timer > 0.4) {
      this.frame = 1 - this.frame;
      this.timer = 0;
    }
  }

  getBounds() {
    return { x: this.x + 2, y: this.y + 2, w: this.w - 4, h: this.h - 4 };
  }

  render(ctx) {
    if (!this.alive) return;
    drawAlien(ctx, this.x, this.y, this.type, this.frame);
  }
}

class AlienFleet {
  constructor() {
    this.aliens = [];
    this.dir = 1;
    this.baseSpeed = CONFIG.aliens.speedPerFrame;
    this.shootTimer = 0;
    this.moveDown = 0;
    this.spawn();
  }

  spawn() {
    this.aliens = [];
    const { rows, cols, padding, width, height, offsetTop } = CONFIG.aliens;
    const gridW = cols * (width + padding) - padding;
    const offX = (CONFIG.canvas.width - gridW) / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.aliens.push(new Alien(offX + c * (width + padding), offsetTop + r * (height + padding), r));
      }
    }
  }

  getAlive() { return this.aliens.filter(a => a.alive); }

  update(dt, level) {
    const alive = this.getAlive();
    if (alive.length === 0) return;

    const speedMul = 1 + (CONFIG.aliens.cols * CONFIG.aliens.rows - alive.length) / (CONFIG.aliens.cols * CONFIG.aliens.rows);
    const lvlMul = Math.pow(CONFIG.levels.speedMultiplier, level - 1);
    const speed = this.baseSpeed * speedMul * lvlMul;

    if (this.moveDown > 0) {
      this.moveDown -= dt;
      for (const a of alive) a.y += 60 * dt;
      return;
    }

    for (const a of alive) a.x += this.dir * speed * dt * 60;

    let hitEdge = false;
    for (const a of alive) {
      if ((this.dir > 0 && a.x + a.w >= CONFIG.canvas.width - 4) ||
          (this.dir < 0 && a.x <= 4)) {
        hitEdge = true;
        break;
      }
    }

    if (hitEdge) {
      this.dir *= -1;
      this.moveDown = 0.3;
      for (const a of this.aliens) a.y += CONFIG.aliens.stepDown;
    }

    for (const a of alive) a.update(dt);

    this.shootTimer -= dt;
    if (this.shootTimer <= 0) {
      this.shootTimer = CONFIG.aliens.shootInterval[0] + Math.random() * (CONFIG.aliens.shootInterval[1] - CONFIG.aliens.shootInterval[0]);
      this.shootTimer /= lvlMul;
      return this.fireBullet();
    }
    return null;
  }

  fireBullet() {
    const alive = this.getAlive();
    if (alive.length === 0) return null;
    const shooter = alive[Math.floor(Math.random() * alive.length)];
    return { x: shooter.x + shooter.w / 2, y: shooter.y + shooter.h };
  }

  checkCollision(bullet) {
    const bb = bullet.getBounds();
    for (const a of this.aliens) {
      if (!a.alive) continue;
      const ab = a.getBounds();
      if (checkAABB(ab, bb)) {
        a.alive = false;
        return a;
      }
    }
    return null;
  }

  allDead() { return this.getAlive().length === 0; }

  getBottomY() {
    const alive = this.getAlive();
    if (alive.length === 0) return 0;
    return Math.max(...alive.map(a => a.y + a.h));
  }

  reset() {
    this.spawn();
    this.dir = 1;
    this.shootTimer = 2;
    this.moveDown = 0;
  }
}

class Bullet {
  constructor(x, y, speed, isPlayer) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.isPlayer = isPlayer;
    this.w = CONFIG.bullets.width;
    this.h = CONFIG.bullets.height;
    this.alive = true;
  }

  update(dt) {
    this.y += this.speed * dt * (this.isPlayer ? -1 : 1);
    if (this.y < -20 || this.y > CONFIG.canvas.height + 20) this.alive = false;
  }

  getBounds() {
    return { x: this.x - this.w / 2, y: this.y, w: this.w, h: this.h };
  }

  render(ctx) {
    ctx.save();
    if (this.isPlayer) {
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#fff';
    } else {
      ctx.shadowColor = 'rgba(255, 68, 68, 0.8)';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#FF4444';
    }
    ctx.fillRect(this.x - this.w / 2, this.y, this.w, this.h);
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

class BulletManager {
  constructor() {
    this.bullets = [];
    this.playerBullet = null;
  }

  addBullet(x, y, speed, isPlayer) {
    if (isPlayer) {
      if (this.playerBullet) return;
      this.playerBullet = new Bullet(x, y, speed, true);
      this.bullets.push(this.playerBullet);
    } else {
      this.bullets.push(new Bullet(x, y, speed, false));
    }
  }

  update(dt) {
    for (const b of this.bullets) b.update(dt);
    this.bullets = this.bullets.filter(b => b.alive);
    if (this.playerBullet && !this.playerBullet.alive) this.playerBullet = null;
  }

  render(ctx) {
    for (const b of this.bullets) b.render(ctx);
  }

  reset() {
    this.bullets = [];
    this.playerBullet = null;
  }
}

class Bunker {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.cellSize = 5;
    this.cols = 16;
    this.rows = 10;
    this.cells = [];
    for (let r = 0; r < this.rows; r++) {
      this.cells[r] = [];
      for (let c = 0; c < this.cols; c++) {
        let present = true;
        if (r === 0) present = c >= 2 && c <= 13;
        else if (r === 1) present = c >= 1 && c <= 14;
        if (r === 5 && c >= 6 && c <= 8) present = false;
        if (r === 7 && c >= 4 && c <= 5) present = false;
        if (r === 7 && c >= 10 && c <= 11) present = false;
        if (r === 8 && c >= 6 && c <= 9) present = false;
        this.cells[r][c] = present;
      }
    }
  }

  hit(bx, by) {
    const col = Math.floor((bx - this.x) / this.cellSize);
    const row = Math.floor((by - this.y) / this.cellSize);
    if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
      this.cells[row][col] = false;
      if (row > 0) this.cells[row - 1][col] = false;
      if (row < this.rows - 1) this.cells[row + 1][col] = false;
      if (col > 0) this.cells[row][col - 1] = false;
      if (col < this.cols - 1) this.cells[row][col + 1] = false;
      return true;
    }
    return false;
  }

  render(ctx) {
    ctx.fillStyle = '#1a6b3c';
    ctx.strokeStyle = '#2a9d4c';
    ctx.lineWidth = 0.5;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.cells[r][c]) {
          const cx = this.x + c * this.cellSize;
          const cy = this.y + r * this.cellSize;
          ctx.fillRect(cx, cy, this.cellSize, this.cellSize);
          ctx.strokeRect(cx, cy, this.cellSize, this.cellSize);
        }
      }
    }
  }

  isDestroyed() {
    return this.cells.every(row => row.every(c => !c));
  }
}

class BunkerManager {
  constructor() {
    this.bunkers = [];
    const count = CONFIG.bunkers.count;
    const bw = CONFIG.bunkers.width;
    const bh = CONFIG.bunkers.height;
    const by = CONFIG.bunkers.y;
    const totalW = count * bw + (count - 1) * 30;
    const startX = (CONFIG.canvas.width - totalW) / 2;
    for (let i = 0; i < count; i++) {
      this.bunkers.push(new Bunker(startX + i * (bw + 30), by));
    }
  }

  render(ctx) {
    for (const b of this.bunkers) b.render(ctx);
  }

  checkHit(bullet) {
    if (!bullet.alive) return false;
    const bb = bullet.getBounds();
    for (const bunk of this.bunkers) {
      if (bunk.isDestroyed()) continue;
      if (checkAABB({ x: bunk.x, y: bunk.y, w: bunk.cols * bunk.cellSize, h: bunk.rows * bunk.cellSize }, bb)) {
        bunk.hit(bullet.x, bullet.y);
        bullet.alive = false;
        return true;
      }
    }
    return false;
  }

  reset() {
    this.bunkers = [];
    const count = CONFIG.bunkers.count;
    const bw = CONFIG.bunkers.width;
    const bh = CONFIG.bunkers.height;
    const by = CONFIG.bunkers.y;
    const totalW = count * bw + (count - 1) * 30;
    const startX = (CONFIG.canvas.width - totalW) / 2;
    for (let i = 0; i < count; i++) {
      this.bunkers.push(new Bunker(startX + i * (bw + 30), by));
    }
  }
}

class StarField {
  constructor() {
    this.layers = [
      { count: 50, speed: 10 / 60, size: 1, opacity: 0.3 },
      { count: 30, speed: 25 / 60, size: 2, opacity: 0.6 },
      { count: 20, speed: 45 / 60, size: 3, opacity: 1.0 }
    ];
    this.stars = [];
    for (const layer of this.layers) {
      for (let i = 0; i < layer.count; i++) {
        this.stars.push({
          x: Math.random() * CONFIG.canvas.width,
          y: Math.random() * CONFIG.canvas.height,
          speed: layer.speed,
          size: layer.size,
          opacity: layer.opacity
        });
      }
    }
  }

  update(dt) {
    for (const s of this.stars) {
      s.y += s.speed * dt * 60;
      if (s.y > CONFIG.canvas.height) {
        s.y = 0;
        s.x = Math.random() * CONFIG.canvas.width;
      }
    }
  }

  render(ctx) {
    for (const s of this.stars) {
      ctx.globalAlpha = s.opacity;
      ctx.fillStyle = '#fff';
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
    ctx.globalAlpha = 1;
  }
}

class ScoreManager {
  constructor() {
    this.score = 0;
    this.level = 1;
    this.lives = CONFIG.player.lives;
    this.highScore = parseInt(localStorage.getItem('siKiroHighScore') || '0');
    this.newHigh = false;
  }

  addPoints(p) {
    this.score += p;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.newHigh = true;
      localStorage.setItem('siKiroHighScore', this.highScore.toString());
    }
  }

  loseLife() { this.lives--; }

  nextLevel() {
    this.level++;
    this.addPoints(CONFIG.levels.bonus);
  }

  reset() {
    this.score = 0;
    this.level = 1;
    this.lives = CONFIG.player.lives;
    this.newHigh = false;
  }

  render(ctx) {
    ctx.fillStyle = '#fff';
    ctx.font = '20px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${this.score}`, 20, 30);
    ctx.textAlign = 'right';
    ctx.fillText(`LEVEL: ${this.level}`, CONFIG.canvas.width - 20, 30);
    ctx.textAlign = 'left';
    let livesStr = '';
    for (let i = 0; i < this.lives; i++) livesStr += '★ ';
    ctx.fillText(`LIVES: ${livesStr}`, 20, CONFIG.canvas.height - 20);
  }

  renderHighScore(ctx) {
    ctx.fillStyle = '#888';
    ctx.font = '18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`HIGH SCORE: ${this.highScore}`, CONFIG.canvas.width / 2, CONFIG.canvas.height - 20);
  }
}

class AudioManager {
  play(name, pitch, vol) {
    const src = ASSETS.sounds[name];
    if (!src) return;
    try {
      const clone = src.cloneNode();
      if (vol !== undefined) clone.volume = vol;
      else if (name === 'shoot') clone.volume = 0.4;
      else clone.volume = 0.6;
      if (pitch && clone.playbackRate !== undefined) clone.playbackRate = pitch;
      clone.play().catch(() => {});
    } catch (e) {}
  }

  playShoot() { this.play('shoot'); }
  playExplosion() { this.play('shoot', 1.6); }
  playHit() { this.play('hit'); }
  playGameOver() { this.play('FAH', 1, 0.8); }

  resume() {}
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = STATE.START;
    this.lastTime = 0;
    this.keys = {};
    this.prevSpace = false;
    this.prevEsc = false;
    this.prevLeft = false;
    this.prevRight = false;
    this.loaded = false;
    this.touchId = null;
    this.touchX = null;
    this.touchTap = false;
    this.setupInput();
    this.setupResize();
    this.setupTouch();
  }

  init() {
    this.player = new Player();
    this.alienFleet = new AlienFleet();
    this.bulletManager = new BulletManager();
    this.bunkerManager = new BunkerManager();
    this.starField = new StarField();
    this.scoreManager = new ScoreManager();
    this.audioManager = new AudioManager();
    this.loaded = true;
  }

  setupInput() {
    document.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Escape'].includes(e.code)) {
        e.preventDefault();
      }
    });
    document.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });
  }

  setupResize() {
    const resize = () => {
      const maxW = window.innerWidth;
      const maxH = window.innerHeight;
      const ratio = CONFIG.canvas.width / CONFIG.canvas.height;
      let w = maxW;
      let h = w / ratio;
      if (h > maxH) { h = maxH; w = h * ratio; }
      this.canvas.style.width = `${w}px`;
      this.canvas.style.height = `${h}px`;
    };
    window.addEventListener('resize', resize);
    resize();
  }

  setupTouch() {
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.audioManager.resume();
      const t = e.changedTouches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = (t.clientX - rect.left) / rect.width;
      this.touchId = t.identifier;
      this.touchX = x;
      if (x >= 0.35 && x <= 0.65) this.touchTap = true;
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === this.touchId) {
          const rect = this.canvas.getBoundingClientRect();
          this.touchX = (t.clientX - rect.left) / rect.width;
        }
      }
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) {
        if (t.identifier === this.touchId) {
          this.touchId = null;
          this.touchX = null;
        }
      }
    }, { passive: false });

    this.canvas.addEventListener('touchcancel', (e) => {
      this.touchId = null;
      this.touchX = null;
    }, { passive: false });
  }

  start() {
    this.lastTime = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - this.lastTime) / 1000, 0.05);
      this.lastTime = now;
      this.handleInput();
      this.update(dt);
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  handleInput() {
    const space = !!this.keys['Space'];
    const esc = !!this.keys['Escape'];
    const left = !!this.keys['ArrowLeft'];
    const right = !!this.keys['ArrowRight'];
    const touchLeft = this.touchX !== null && this.touchX < 0.35;
    const touchRight = this.touchX !== null && this.touchX > 0.65;
    const anyAction = space || this.touchTap;

    if (anyAction && !this.prevSpace) {
      this.audioManager.resume();
      this.touchTap = false;
      switch (this.state) {
        case STATE.START:
          this.startGame();
          break;
        case STATE.PLAYING:
          const b = this.player.shoot();
          if (b) {
            this.bulletManager.addBullet(b.x, b.y, CONFIG.bullets.playerSpeedPerFrame * 60, true);
            this.audioManager.playShoot();
          }
          break;
        case STATE.GAMEOVER:
          this.startGame();
          break;
      }
    }

    if (esc && !this.prevEsc && this.state === STATE.GAMEOVER) {
      this.setState(STATE.START);
    }

    if (this.state === STATE.PLAYING) {
      this.player.moveDir = (right || touchRight ? 1 : 0) - (left || touchLeft ? 1 : 0);
    }

    this.prevSpace = anyAction;
    this.prevEsc = esc;
    this.prevLeft = left;
    this.prevRight = right;
  }

  startGame() {
    this.setState(STATE.PLAYING);
    this.player = new Player();
    this.alienFleet.reset();
    this.bulletManager.reset();
    this.bunkerManager.reset();
    this.scoreManager.reset();
  }

  setState(s) {
    console.log(`State: ${this.state} → ${s}`);
    this.state = s;
  }

  update(dt) {
    this.starField.update(dt);

    if (this.state === STATE.PLAYING) {
      this.player.update(dt);
      this.bulletManager.update(dt);

      const alienBullet = this.alienFleet.update(dt, this.scoreManager.level);
      if (alienBullet) {
        this.bulletManager.addBullet(alienBullet.x, alienBullet.y, CONFIG.bullets.alienSpeedPerFrame * 60, false);
      }

      this.checkCollisions();

      if (this.alienFleet.allDead()) {
        this.scoreManager.nextLevel();
        this.alienFleet.reset();
        this.bulletManager.reset();
        this.bunkerManager.reset();
      }

      if (this.alienFleet.getBottomY() >= this.player.y - 10) {
        this.gameOver();
      }
    }
  }

  checkCollisions() {
    for (const b of this.bulletManager.bullets) {
      if (!b.alive) continue;

      if (this.bunkerManager.checkHit(b)) continue;

      if (b.isPlayer) {
        const hit = this.alienFleet.checkCollision(b);
        if (hit) {
          b.alive = false;
          if (this.bulletManager.playerBullet === b) this.bulletManager.playerBullet = null;
          this.scoreManager.addPoints(CONFIG.aliens.pointsPerRow[hit.row]);
          this.audioManager.playExplosion();
        }
      } else {
        const pb = this.player.getBounds();
        const bb = b.getBounds();
        if (checkAABB(pb, bb)) {
          b.alive = false;
          if (this.player.hit()) {
            this.audioManager.playHit();
            if (this.player.lives <= 0) {
              this.gameOver();
            }
          }
        }
      }
    }
  }

  gameOver() {
    this.setState(STATE.GAMEOVER);
    this.audioManager.playGameOver();
  }

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = '#0A0A2E';
    ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

    this.starField.render(ctx);

    if (this.state === STATE.START) {
      this.renderStartMenu(ctx);
      return;
    }

    this.bunkerManager.render(ctx);
    this.bulletManager.render(ctx);
    this.alienFleet.aliens.forEach(a => a.render(ctx));
    this.player.render(ctx);
    this.scoreManager.render(ctx);

    if (this.state === STATE.GAMEOVER) {
      this.renderGameOver(ctx);
    }
  }

  renderStartMenu(ctx) {
    ctx.fillStyle = 'rgba(10, 10, 46, 0.7)';
    ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

    ctx.fillStyle = '#FFD700';
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255, 215, 0, 0.3)';
    ctx.shadowBlur = 20;
    ctx.fillText('SPACE INVADERS', CONFIG.canvas.width / 2, 180);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#B0B0FF';
    ctx.font = '28px monospace';
    ctx.fillText('★ K I R O ★', CONFIG.canvas.width / 2, 230);

    const kiroY = 310 + Math.sin(Date.now() / 400) * 5;
    if (ASSETS.ghost && ASSETS.ghost.complete && ASSETS.ghost.naturalWidth > 0) {
      ctx.save();
      ctx.shadowColor = 'rgba(180, 180, 255, 0.5)';
      ctx.shadowBlur = 25;
      ctx.drawImage(ASSETS.ghost, CONFIG.canvas.width / 2 - 24, kiroY - 24, 48, 48);
      ctx.restore();
    }

    const blink = Math.floor(Date.now() / 500) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#fff';
      ctx.font = '22px monospace';
      ctx.fillText('Press SPACE to Start', CONFIG.canvas.width / 2, 420);
    }

    ctx.fillStyle = '#aaa';
    ctx.font = '16px monospace';
    ctx.fillText('← → Move  |  SPACE Fire', CONFIG.canvas.width / 2, 470);

    this.scoreManager.renderHighScore(ctx);
  }

  renderGameOver(ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);

    ctx.fillStyle = '#FF4444';
    ctx.font = '48px monospace';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(255, 68, 68, 0.4)';
    ctx.shadowBlur = 20;
    ctx.fillText('GAME OVER', CONFIG.canvas.width / 2, 220);
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fff';
    ctx.font = '28px monospace';
    ctx.fillText(`SCORE: ${this.scoreManager.score}`, CONFIG.canvas.width / 2, 290);

    if (this.scoreManager.newHigh) {
      ctx.fillStyle = '#FFD700';
      ctx.font = '22px monospace';
      ctx.fillText('★ NEW HIGH SCORE! ★', CONFIG.canvas.width / 2, 330);
    }

    ctx.fillStyle = '#aaa';
    ctx.font = '20px monospace';
    ctx.fillText(`LEVEL: ${this.scoreManager.level}`, CONFIG.canvas.width / 2, 370);
    ctx.fillText(`HIGH SCORE: ${this.scoreManager.highScore}`, CONFIG.canvas.width / 2, 400);

    const blink = Math.floor(Date.now() / 500) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#fff';
      ctx.font = '20px monospace';
      ctx.fillText('Press SPACE to Restart', CONFIG.canvas.width / 2, 460);
    }

    ctx.fillStyle = '#666';
    ctx.font = '14px monospace';
    ctx.fillText('ESC for Menu', CONFIG.canvas.width / 2, 500);
  }
}

async function init() {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0A0A2E';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#fff';
  ctx.font = '24px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LOADING...', canvas.width / 2, canvas.height / 2);

  try {
    await preloadAssets();

    const game = new Game(canvas);
    game.init();
    game.start();
  } catch (e) {
    console.error('Failed to initialize game:', e);
    ctx.fillStyle = '#FF4444';
    ctx.fillText('ERROR: Failed to load game', canvas.width / 2, canvas.height / 2 + 40);
    ctx.font = '16px monospace';
    ctx.fillText(e.message, canvas.width / 2, canvas.height / 2 + 70);
  }
}

document.addEventListener('DOMContentLoaded', init);
