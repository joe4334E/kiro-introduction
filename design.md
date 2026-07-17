# Space Invaders Kiro — Design Document

## Configuration

All game constants, assets, and parameters are centralized in `game-config.json`.

### Asset Paths
```javascript
const ASSETS = {
  PLAYER_SPRITE: 'assets/ghosty.png',
  SOUND_SHOOT: 'assets/jump.wav',
  SOUND_HIT: 'assets/game_over.wav',
  SOUND_EXPLOSION: 'assets/jump.wav',
  SOUND_GAME_OVER: 'assets/game_over.wav'
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
│           Game Manager               │
│  - State machine (START/PLAY/OVER)   │
│  - Game loop (requestAnimationFrame) │
│  - Input handling (arrows + space)   │
└──────────┬───────────────────────────┘
           │
    ┌──────┼──────┬──────────┬──────────┐
    │      │      │          │          │
┌───▼──┐ ┌─▼───┐ ┌▼──────┐ ┌▼──────┐ ┌▼──────┐
│Player│ │Alien│ │Bunker │ │Bullet │ │Star   │
│      │ │Fleet│ │Mgr    │ │Mgr    │ │Field  │
└───┬──┘ └──┬──┘ └───────┘ └──┬───┘ └───────┘
    │       │                  │
    │  ┌────▼────┐             │
    │  │  Alien  │             │
    │  │ (individual)          │
    │  └─────────┘             │
    │                          │
┌───▼──────────────────────────▼──────────┐
│           ScoreManager                  │
│  - Score, lives, levels                │
│  - localStorage persistence             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│           AudioManager                  │
│  - Sound playback with cloneNode        │
│  - Pitch shifting (Web Audio API)       │
└─────────────────────────────────────────┘
```

---

## Core Systems

### 1. Game Manager
Controls state machine and game loop.

```javascript
class Game {
  constructor()
  init()              // Initialize all systems
  start()             // Begin game loop
  update(dt)          // Update all systems
  render()            // Draw all layers
  handleInput(key)    // Process arrow keys & space
  setState(newState)  // Transition between states
  reset()             // Restart from menu
}
```

**State Transitions:**
```
START → PLAYING → GAMEOVER
  ↑_______________________↓
    (Spacebar restarts)
```

### 2. Player System
Kiro the ghost — movement, rendering, lives.

```javascript
class Player {
  constructor(x, y, image)
  update(dt)           // Handle movement input
  moveLeft() / moveRight()
  shoot()              // Fire a bullet if cooldown ready
  hit()                // Lose a life, respawn
  render(ctx)          // Draw Kiro with lean animation
  reset()              // Return to starting position
}
```

**Movement:**
- Speed: 350 px/s (from config)
- Clamped to canvas bounds
- Visual lean: rotate ±10° based on direction

**Lives:**
- Start with 3
- 1 second respawn delay after hit
- 0 lives → game over

### 3. Alien Fleet System
Grid of 55 aliens that move and shoot as a group.

```javascript
class Alien {
  constructor(x, y, row)
  update(dt)
  render(ctx)          // Draw with 2-frame walk animation
  getBounds()          // Collision rectangle
}

class AlienFleet {
  constructor()
  update(dt)           // Move grid, check edges, step down
  render(ctx)          // Draw all aliens
  checkCollisions(bullet)  // Returns hit alien or null
  shoot()              // Random alien fires a bullet
  reset(level)         // Respawn for new level
  getSpeed()           // Speed increases with fewer aliens
}
```

**Movement Algorithm:**
```
each frame:
  if moving right:
    if rightmost alien hits edge → reverse, step down
  if moving left:
    if leftmost alien hits edge → reverse, step down
  speed = baseSpeed × (1 + (total - remaining) / total)
```

**Shooting:**
- Random interval per alien group: 0.5–3.0s
- Random alien near center fires

### 4. Bullet System
Manages all projectiles.

```javascript
class Bullet {
  constructor(x, y, speed, isPlayer)
  update(dt)           // Move in direction
  render(ctx)          // Draw with glow effect
  isOffScreen()        // Check bounds
}

class BulletManager {
  constructor()
  addBullet(x, y, speed, isPlayer)
  update(dt)
  render(ctx)
  checkCollisions(targets)   // Return hit or miss
  reset()
}
```

**Bullet Properties:**
| Property | Player | Alien |
|---|---|---|
| Speed | 700 px/s | 350 px/s |
| Color | #FFFFFF | #FF4444 |
| Width | 4px | 4px |
| Height | 14px | 14px |

### 5. Bunker System
Destructible barriers providing cover.

```javascript
class Bunker {
  constructor(x, y)
  hit(bulletX, bulletY)    // Remove pixel data at impact point
  render(ctx)               // Draw remaining structure
  isDestroyed()             // Check if fully gone
}
```

**Structure:**
- 4 bunkers evenly spaced across lower area
- Each: 80×50px block
- Pixel-level destruction on impact
- Pattern: solid block with rounded top

### 6. Starfield System
Parallax scrolling star background.

```javascript
class StarField {
  constructor()
  update(dt)           // Scroll stars downward
  render(ctx)          // Draw 3 layers of stars
}
```

**Layers:**
| Layer | Count | Speed | Size | Opacity |
|---|---|---|---|---|
| Far | 50 | 10 px/s | 1px | 0.3 |
| Mid | 30 | 25 px/s | 2px | 0.6 |
| Near | 20 | 45 px/s | 3px | 1.0 |

### 7. Score System
Tracks score, lives, levels, and high score persistence.

```javascript
class ScoreManager {
  constructor()
  addPoints(points)        // Add to current score
  addLife() / loseLife()
  nextLevel()              // Increment level, apply speed multiplier
  reset()                  // Reset for new game
  loadHighScore()          // From localStorage
  saveHighScore()          // To localStorage
  render(ctx)              // Draw score, lives, level
}
```

**Score Table:**
| Alien Row | Points |
|---|---|
| 1 (top) | 50 |
| 2 | 40 |
| 3 | 30 |
| 4 | 20 |
| 5 (bottom) | 10 |

**Level Progression:**
- Speed multiplier: ×1.3 per level
- Bonus: +500 pts for clearing a level
- Max level: unlimited (wraps difficulty)

### 8. Audio System
Sound effects with pitch shifting.

```javascript
class AudioManager {
  constructor()
  preload()                // Load all audio
  playShoot()              // Laser sound
  playExplosion()          // Alien destroyed (higher pitch)
  playHit()                // Player damaged
  playGameOver()           // Game over
}
```

**Sound Mapping:**
| Sound | File | Volume | Pitch |
|---|---|---|---|
| Shoot | jump.wav | 0.5 | normal |
| Explosion | jump.wav | 0.4 | ×1.5 |
| Hit | game_over.wav | 0.7 | normal |
| Game Over | game_over.wav | 0.8 | normal |

---

## Rendering Pipeline

**Draw Order (Back to Front):**
1. Clear canvas (#0A0A2E)
2. Starfield (far → mid → near)
3. Bunkers
4. Alien bullets
5. Alien fleet
6. Player bullet
7. Player (Kiro)
8. HUD: Score, Level, Lives
9. State overlays (START / GAMEOVER)

---

## Input Handling

| Key | START | PLAYING | GAMEOVER |
|---|---|---|---|
| SPACE | Start game | Shoot | Restart |
| ← | — | Move left | — |
| → | — | Move right | — |
| ESC | — | — | Return to menu |

---

## Collision Detection (AABB)

```javascript
function checkAABB(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y
}
```

**Collision Pairs:**
- Player bullet → Aliens
- Alien bullet → Player
- Player bullet → Bunker
- Alien bullet → Bunker
- Alien reaches bottom → Game Over

---

## File Structure

```
kiro-introduction/
├── index.html              # Canvas + script references
├── game.js                 # All game logic
├── styles.css              # Page styling
├── game-config.json        # Game constants
├── kiro-sprites.md         # Sprite specifications
├── audio-assets.md         # Audio mapping
├── ui-mockups.md           # UI layouts
├── requirements.md
├── design.md
├── tasks.md
├── assets/
│   ├── ghosty.png         # Kiro sprite
│   ├── jump.wav           # Shoot & explosion sounds
│   └── game_over.wav      # Hit & game over sounds
└── img/
    └── example-ui.png
```
