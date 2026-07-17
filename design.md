# Flappy Kiro - Design Document

## Configuration

All game constants, assets, and parameters are centralized here for easy modification.

### Asset Paths
```javascript
const ASSETS = {
  PLAYER_SPRITE: 'assets/ghosty.png',
  SOUND_JUMP: 'assets/jump.wav',
  SOUND_GAME_OVER: 'assets/game_over.wav'
}
```

### Canvas Configuration
```javascript
const CANVAS = {
  WIDTH: 800,
  HEIGHT: 600
}
```

### Physics Parameters
```javascript
const PHYSICS = {
  GRAVITY: 0.5,              // Pixels per frame²
  JUMP_FORCE: -10,           // Upward velocity on jump
  TERMINAL_VELOCITY: 12,     // Maximum fall speed
  ROTATION_FACTOR: 3         // Rotation sensitivity to velocity
}
```

### Player Configuration
```javascript
const PLAYER = {
  START_X: 150,              // Initial X position
  START_Y: 300,              // Initial Y position (center)
  SIZE: 40,                  // Sprite width/height
  HITBOX_SCALE: 0.85         // Collision box scale (forgiving)
}
```

### Obstacle Configuration
```javascript
const PIPES = {
  WIDTH: 60,                 // Pipe width in pixels
  GAP_SIZE: 165,             // Vertical gap between pipes
  SPEED: 3,                  // Pixels per frame
  SPAWN_INTERVAL: 2000,      // Milliseconds between spawns
  MIN_HEIGHT: 100,           // Minimum pipe height
  MAX_HEIGHT: 400,           // Maximum pipe height
  COLOR: '#2D5016',          // Pipe fill color (dark green)
  BORDER_COLOR: '#1A3309'    // Pipe border color
}
```

### Background Configuration
```javascript
const BACKGROUND = {
  SKY_COLOR: '#87CEEB',      // Light blue sky
  CLOUD_COUNT: 8,            // Total clouds across all layers
  
  // Parallax layers (front to back)
  LAYERS: [
    { SPEED: 0.5,  OPACITY: 0.8, SIZE_SCALE: 1.2 },  // Front
    { SPEED: 0.3,  OPACITY: 0.5, SIZE_SCALE: 1.0 },  // Middle
    { SPEED: 0.15, OPACITY: 0.3, SIZE_SCALE: 0.8 }   // Back
  ]
}
```

### UI Configuration
```javascript
const UI = {
  FONT_FAMILY: 'monospace',
  FONT_SIZE_LARGE: 48,       // Title text
  FONT_SIZE_MEDIUM: 32,      // Subtitle text
  FONT_SIZE_SMALL: 24,       // Score text
  TEXT_COLOR: '#FFFFFF',     // White text
  TEXT_SHADOW_COLOR: '#000000', // Black shadow
  SCORE_Y_OFFSET: 30         // Distance from bottom
}
```

### Storage Keys
```javascript
const STORAGE = {
  HIGH_SCORE_KEY: 'flappyKiroHighScore'
}
```

### Game States
```javascript
const STATE = {
  START: 'start',
  PLAYING: 'playing',
  GAMEOVER: 'gameover'
}
```

---

## Architecture Overview

### Component Architecture
```
┌──────────────────────────────────────┐
│          Game Manager                │
│  - State machine (START/PLAY/OVER)   │
│  - Game loop (requestAnimationFrame) │
│  - Input handling (spacebar)         │
└──────────┬───────────────────────────┘
           │
    ┌──────┴──────┬──────────┬──────────┐
    │             │          │          │
┌───▼───┐  ┌─────▼─────┐  ┌─▼────┐  ┌──▼────┐
│Player │  │ Obstacles │  │Score │  │ Audio │
└───────┘  └─────┬─────┘  └──────┘  └───────┘
                 │
          ┌──────┴──────┐
     ┌────▼────┐  ┌─────▼──────┐
     │  Pipes  │  │ Background │
     └─────────┘  └────────────┘
```

## Core Systems

### 1. Game Manager

Controls state machine and game loop.

```javascript
class Game {
  constructor()
  init()              // Initialize all systems
  start()             // Begin game loop (requestAnimationFrame)
  update(deltaTime)   // Update all systems
  render()            // Draw all systems (back to front)
  handleInput(key)    // Process spacebar
  setState(newState)  // Transition states
  reset()             // Restart game
}
```

**State Transitions:**
```
START → PLAYING → GAMEOVER
  ↑_______________________↓
      (Spacebar restarts)
```

### 2. Player System

Manages ghost physics, rendering, and collision.

```javascript
class Player {
  constructor(x, y, image)
  update(deltaTime)   // Apply gravity and update position
  jump()              // Apply upward velocity
  render(ctx)         // Draw with rotation based on velocity
  reset()             // Return to start position
  getBounds()         // Return collision rectangle
}
```

**Physics:**
- Gravity accelerates downward (see `PHYSICS.GRAVITY`)
- Jump applies instant upward velocity (see `PHYSICS.JUMP_FORCE`)
- Rotation: `angle = velocityY * PHYSICS.ROTATION_FACTOR` (clamped ±90°)
- Collision box: Slightly smaller than sprite for forgiving gameplay

### 3. Obstacle System

Manages pipe generation, movement, and collision.

```javascript
class Pipe {
  constructor(x, gapY, gapSize)
  update(deltaTime)        // Move left
  render(ctx)              // Draw top and bottom rectangles
  isOffScreen()            // Check if past left edge
  collidesWith(player)     // AABB collision detection
}

class ObstacleManager {
  constructor()
  update(deltaTime)        // Move pipes, spawn new ones
  checkCollision(player)   // Returns true if collision
  checkScore(player)       // Returns true if player passed pipe
  render(ctx)              // Draw all pipes
  reset()                  // Clear all pipes
}
```

**Pipe Spawning:**
- Interval: `PIPES.SPAWN_INTERVAL` milliseconds
- Gap Y: Random between `PIPES.MIN_HEIGHT` and `PIPES.MAX_HEIGHT`
- Gap size: `PIPES.GAP_SIZE` (constant)
- Spawn position: Canvas right edge

### 4. Background System

Renders sky and parallax clouds.

```javascript
class Cloud {
  constructor(x, y, width, height, speed, opacity)
  update(deltaTime)   // Scroll left and wrap
  render(ctx)         // Draw fluffy shape (overlapping circles)
}

class BackgroundManager {
  constructor()
  update(deltaTime)   // Update all cloud layers
  render(ctx)         // Draw sky + clouds (back to front)
}
```

**Parallax Layers:**
- 3 layers with different speeds (see `BACKGROUND.LAYERS`)
- Front clouds: Faster, more opaque, larger
- Back clouds: Slower, more transparent, smaller
- Clouds wrap around when they exit left edge

### 5. Score System

Tracks and persists scores.

```javascript
class ScoreManager {
  constructor()
  increment()             // Add 1 point
  reset()                 // Reset current score to 0
  loadHighScore()         // Load from localStorage
  saveHighScore()         // Save to localStorage
  render(ctx)             // Draw "Score: X | High: Y"
}
```

**Display:**
- Position: Bottom center (`CANVAS.HEIGHT - UI.SCORE_Y_OFFSET`)
- Format: "Score: X | High: Y"
- Font: See `UI` config
- Storage key: `STORAGE.HIGH_SCORE_KEY`

### 6. Audio System

Plays sound effects.

```javascript
class AudioManager {
  constructor()
  preload()           // Load assets (ASSETS.SOUND_JUMP, ASSETS.SOUND_GAME_OVER)
  playJump()          // Play jump sound
  playGameOver()      // Play game over sound
}
```

**Implementation:**
- Load Audio objects from `ASSETS.SOUND_*` paths
- Use `cloneNode()` for overlapping sound effects
- Graceful degradation if audio fails

## Rendering Pipeline

**Draw Order (Back to Front):**
1. Clear canvas
2. Fill sky (`BACKGROUND.SKY_COLOR`)
3. Draw clouds (back → front layers)
4. Draw pipes
5. Draw player (with rotation)
6. Draw score
7. Draw state overlays (start menu / game over)

```javascript
function render(ctx) {
  ctx.clearRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
  ctx.fillStyle = BACKGROUND.SKY_COLOR
  ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT)
  
  backgroundManager.render(ctx)
  obstacleManager.render(ctx)
  player.render(ctx)
  scoreManager.render(ctx)
  
  if (state === STATE.START) renderStartMenu(ctx)
  if (state === STATE.GAMEOVER) renderGameOver(ctx)
}
```

## Algorithms

### Collision Detection (AABB)
```javascript
function checkCollision(rect1, rect2) {
  return rect1.x < rect2.x + rect2.width &&
         rect1.x + rect1.width > rect2.x &&
         rect1.y < rect2.y + rect2.height &&
         rect1.y + rect1.height > rect2.y
}
```

### Random Gap Position
```javascript
function randomGapY() {
  const min = PIPES.MIN_HEIGHT + PIPES.GAP_SIZE / 2
  const max = CANVAS.HEIGHT - PIPES.MIN_HEIGHT - PIPES.GAP_SIZE / 2
  return Math.random() * (max - min) + min
}
```

### Score Detection
```javascript
function checkPipePass(player, pipe) {
  if (!pipe.scored && player.x > pipe.x + PIPES.WIDTH) {
    pipe.scored = true
    return true
  }
  return false
}
```

## File Structure

```
kiro-introduction/
├── index.html              # Canvas and script references
├── game.js                 # All game logic
├── styles.css              # Page styling
├── assets/
│   ├── ghosty.png         # Player sprite
│   ├── jump.wav           # Jump sound
│   └── game_over.wav      # Game over sound
├── requirements.md
├── design.md
└── tasks.md
```

---

## Implementation Notes

**Asset Loading:** Preload all assets before starting game loop

**Performance:** Use `requestAnimationFrame` for consistent 60 FPS

**Collision:** Use AABB with slightly smaller hitbox for forgiving gameplay

**Storage:** Use localStorage for high score persistence (key: `STORAGE.HIGH_SCORE_KEY`)

**Input:** Single spacebar handler with different behavior per state
