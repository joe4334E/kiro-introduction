# Space Invaders Kiro — Implementation Tasks

## Phase 0: Project Documentation & Configuration

### Task 0.1: Create game-config.json
**Description**: Define all game parameters in JSON format.

**Implementation**: See `game-config.json` — canvas size, player speed, alien grid, bullet speeds, bunker layout, starfield config.

**Acceptance Criteria**:
- File parses as valid JSON
- Player, alien, bullet, bunker, level, and starfield sections present
- All values use px/s for velocities

---

### Task 0.2: Create kiro-sprites.md
**Description**: Document Kiro character specs and alien visuals.

**Implementation**: See `kiro-sprites.md` — Kiro dimensions (32×32), alien types per row, color palette, animation frames.

**Acceptance Criteria**:
- Kiro size documented (32×32px)
- 5 alien types documented with distinct colors
- 2-frame walk animation specified per alien
- Hitbox dimensions specified

---

### Task 0.3: Create audio-assets.md
**Description**: Map all sound effects from assets folder.

**Implementation**: See `audio-assets.md` — jump.wav → shoot/explosion, game_over.wav → hit/game over.

**Acceptance Criteria**:
- Maps jump.wav to laser shoot and alien explosion
- Maps game_over.wav to player hit and game over
- Specifies volume levels, triggers, and pitch shifting

---

### Task 0.4: Create ui-mockups.md
**Description**: Document UI screens and layouts.

**Implementation**: See `ui-mockups.md` — start menu, in-game HUD, game over screen with all elements positioned.

**Acceptance Criteria**:
- Three screens documented (menu, playing, game over)
- Score, lives, level display specified
- Color palette and typography defined
- All UI elements positioned and sized

---

## Phase 1: Core Setup

### Task 1.1: Create Project Structure
**Description**: Set up HTML, CSS, and JavaScript files.

**Implementation**:
- Create `index.html` with canvas element (800×600)
- Create `styles.css` for page layout with dark theme
- Create `game.js` as main game file
- Link all files properly

**File Structure**:
```
kiro-introduction/
├── index.html
├── styles.css
├── game.js
├── game-config.json
├── kiro-sprites.md
├── audio-assets.md
├── ui-mockups.md
├── assets/
│   ├── ghosty.png
│   ├── jump.wav
│   └── game_over.wav
├── requirements.md
├── design.md
└── tasks.md
```

**Acceptance Criteria**:
- All HTML/CSS/JS files created
- Canvas renders in browser
- No console errors
- Dark background displayed

---

### Task 1.2: Load Configuration
**Description**: Load and parse game-config.json in JavaScript.

**Implementation**:
```javascript
let CONFIG = null;

async function loadConfig() {
  const response = await fetch('game-config.json');
  CONFIG = await response.json();

  // Convert px/s to px/frame (÷ 60)
  CONFIG.player.speedPerFrame = CONFIG.player.speed / 60;
  CONFIG.bullets.playerSpeedPerFrame = CONFIG.bullets.playerSpeed / 60;
  CONFIG.bullets.alienSpeedPerFrame = CONFIG.bullets.alienSpeed / 60;
  CONFIG.aliens.speedPerFrame = CONFIG.aliens.speed / 60;
  CONFIG.starField.speedPerFrame = CONFIG.starField.speed / 60;
}
```

**Acceptance Criteria**:
- Config loads successfully
- Per-frame conversions calculated
- Error handling for fetch failures

---

### Task 1.3: Preload Assets
**Description**: Load ghosty.png and audio files.

**Implementation**:
```javascript
const ASSETS = {
  ghost: null,
  sounds: {
    jump: null,
    gameOver: null
  }
};

async function preloadAssets() {
  const ghostImage = new Image();
  ghostImage.src = 'assets/ghosty.png';

  const jumpAudio = new Audio('assets/jump.wav');
  const gameOverAudio = new Audio('assets/game_over.wav');

  await Promise.all([
    new Promise(resolve => ghostImage.onload = resolve),
    new Promise(resolve => jumpAudio.oncanplaythrough = resolve),
    new Promise(resolve => gameOverAudio.oncanplaythrough = resolve)
  ]);

  ASSETS.ghost = ghostImage;
  ASSETS.sounds.jump = jumpAudio;
  ASSETS.sounds.gameOver = gameOverAudio;
}
```

**Acceptance Criteria**:
- ghosty.png loads (32×32px)
- Both audio files load
- Loading completes before game starts

---

## Phase 2: Game Manager

### Task 2.1: Create Game State Machine
**Description**: Implement game states and transitions.

**Implementation**:
```javascript
const STATE = {
  START: 'start',
  PLAYING: 'playing',
  GAMEOVER: 'gameover'
};

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = STATE.START;
    this.lastTime = 0;
  }

  setState(newState) {
    console.log(`State: ${this.state} → ${newState}`);
    this.state = newState;
  }
}
```

**Acceptance Criteria**:
- Three states defined (START, PLAYING, GAMEOVER)
- State transitions logged
- Game starts in START state

---

### Task 2.2: Game Loop
**Description**: requestAnimationFrame loop with delta time.

**Implementation**:
```javascript
start() {
  this.lastTime = performance.now();
  this.loop = (currentTime) => {
    const dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    this.update(dt);
    this.render();
    requestAnimationFrame(this.loop);
  };
  requestAnimationFrame(this.loop);
}

update(dt) {
  switch (this.state) {
    case STATE.START:
      this.starField.update(dt);
      break;
    case STATE.PLAYING:
      this.player.update(dt);
      this.alienFleet.update(dt);
      this.bulletManager.update(dt);
      this.bunkerManager.update(dt);
      this.starField.update(dt);
      this.checkCollisions();
      break;
    case STATE.GAMEOVER:
      break;
  }
}
```

**Acceptance Criteria**:
- Loop runs at 60 FPS
- Delta time used for frame-independent movement
- All systems updated per state

---

### Task 2.3: Input Handling
**Description**: Handle keyboard input for all states.

**Implementation**:
```javascript
handleInput(key) {
  switch (this.state) {
    case STATE.START:
      if (key === 'SPACE') this.startGame();
      break;
    case STATE.PLAYING:
      if (key === 'SPACE') this.player.shoot();
      if (key === 'LEFT') this.player.moveLeft();
      if (key === 'RIGHT') this.player.moveRight();
      break;
    case STATE.GAMEOVER:
      if (key === 'SPACE') this.startGame();
      if (key === 'ESC') this.setState(STATE.START);
      break;
  }
}
```

**Acceptance Criteria**:
- SPACE starts/restarts game
- ← → moves player during gameplay
- SPACE shoots during gameplay
- ESC returns to menu on game over

---

## Phase 3: Game Objects

### Task 3.1: Create Player
**Description**: Implement Kiro the ghost character.

**Implementation**:
```javascript
class Player {
  constructor() {
    this.x = CONFIG.canvas.width / 2 - CONFIG.player.width / 2;
    this.y = CONFIG.player.y;
    this.width = CONFIG.player.width;
    this.height = CONFIG.player.height;
    this.speed = CONFIG.player.speedPerFrame;
    this.lives = CONFIG.player.lives;
    this.shootCooldown = 0;
    this.isMoving = false;
    this.moveDirection = 0; // -1 left, 0 none, 1 right
    this.invulnerable = 0;
  }

  update(dt) {
    this.x += this.moveDirection * this.speed * dt * 60;
    this.x = Math.max(0, Math.min(CONFIG.canvas.width - this.width, this.x));
    if (this.invulnerable > 0) this.invulnerable -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
  }

  shoot() {
    if (this.shootCooldown <= 0) {
      this.shootCooldown = CONFIG.player.shootCooldown;
      return { x: this.x + this.width / 2, y: this.y };
    }
    return null;
  }

  hit() {
    if (this.invulnerable > 0) return false;
    this.lives--;
    this.invulnerable = 1;
    return true;
  }
}
```

**Acceptance Criteria**:
- Kiro renders with ghost sprite at correct position
- ← → moves Kiro
- Movement clamped to canvas edges
- Shoot cooldown works correctly

---

### Task 3.2: Create Alien Fleet
**Description**: Implement alien grid movement and shooting.

**Implementation**:
```javascript
class Alien {
  constructor(x, y, row) {
    this.x = x;
    this.y = y;
    this.row = row;
    this.width = CONFIG.aliens.width;
    this.height = CONFIG.aliens.height;
    this.alive = true;
    this.frame = 0;
    this.frameTimer = 0;
  }

  update(dt) {
    this.frameTimer += dt;
    if (this.frameTimer > 0.5) {
      this.frame = 1 - this.frame;
      this.frameTimer = 0;
    }
  }

  render(ctx) { /* Canvas-drawn alien per row type */ }
}

class AlienFleet {
  constructor() {
    this.aliens = [];
    this.direction = 1; // 1 right, -1 left
    this.speed = CONFIG.aliens.speedPerFrame;
    this.shootTimer = 0;
    this.spawn();
  }

  spawn() {
    const { rows, cols, padding, width, height, offsetTop } = CONFIG.aliens;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * (width + padding) + padding;
        const y = row * (height + padding) + offsetTop;
        this.aliens.push(new Alien(x, y, row));
      }
    }
  }

  update(dt) {
    // Move horizontally, check edges, step down, shoot
  }
}
```

**Acceptance Criteria**:
- 55 aliens spawn in 5×11 grid
- Aliens move as block, reverse on edge, step down
- Speed increases as aliens are destroyed
- Aliens shoot randomly

---

### Task 3.3: Create Bullet System
**Description**: Implement player and alien bullets.

**Acceptance Criteria**:
- Player bullet fires upward from Kiro
- Alien bullets fire downward from random alien
- Bullets disappear on collision or off-screen
- Max 1 player bullet at a time

---

### Task 3.4: Create Bunkers
**Description**: Implement destructible barriers.

**Acceptance Criteria**:
- 4 bunkers rendered in lower area
- Bullets destroy pixels on impact
- Remaining bunker blocks still provide cover

---

### Task 3.5: Create Starfield
**Description**: Parallax scrolling star background.

**Acceptance Criteria**:
- 100 stars across 3 depth layers
- Stars scroll at different speeds
- Stars wrap around when exiting bottom

---

### Task 3.6: Create Score Manager
**Description**: Track score, lives, levels, persistence.

**Acceptance Criteria**:
- Score displayed top-left, level top-right
- Lives shown as star icons bottom-left
- High score persisted in localStorage
- Level speed multiplier applied

---

### Task 3.7: Create Audio Manager
**Description**: Play sound effects with pitch shifting.

**Acceptance Criteria**:
- Laser sound on player shoot
- Explosion sound on alien death (pitch shifted)
- Hit sound on player damage
- Game over sound on defeat

---

## Phase 4: UI Screens

### Task 4.1: Start Menu
**Description**: Render start screen with title and instructions.

**Acceptance Criteria**:
- "SPACE INVADERS ★ KIRO ★" title displayed
- Kiro sprite shown floating
- "Press SPACE to Start" prompt
- High score displayed
- Controls hint shown

---

### Task 4.2: In-Game HUD
**Description**: Render score, lives, level during gameplay.

**Acceptance Criteria**:
- Score top-left, level top-right
- Lives shown as star icons
- Real-time updates

---

### Task 4.3: Game Over Screen
**Description**: Render game over overlay with results.

**Acceptance Criteria**:
- Semi-transparent overlay over frozen game
- "GAME OVER" title
- Final score and level reached
- New high score indicator if applicable
- Restart prompt

---

## Phase 5: Polish

### Task 5.1: Progressive Difficulty
**Description**: Speed increases per level and per alien kill.

**Acceptance Criteria**:
- Each new level multiplies speed by 1.3
- Speed increases gradually as aliens are destroyed

---

### Task 5.2: Visual Effects
**Description**: Add glow effects, particles, screen shake.

**Acceptance Criteria**:
- Bullets have glow effect
- Aliens flash on death
- Kiro has ghostly aura

---

### Task 5.3: Edge Cases
**Description**: Handle boundary conditions.

**Acceptance Criteria**:
- Game over when aliens reach Kiro's y-position
- Wrap star positions
- Handle tab-away (pause on blur)
- Handle audio context restrictions
