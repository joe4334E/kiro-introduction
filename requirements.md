# Space Invaders Kiro — Requirements

## Overview
Space Invaders Kiro is a browser-based retro game where Kiro (a ghost) defends against waves of alien invaders. Built with HTML5 Canvas and vanilla JavaScript.

---

## Functional Requirements

### FR-1: Player Character (Kiro)
- **FR-1.1**: Render Kiro the ghost as the player character near the bottom of the screen
- **FR-1.2**: Move Kiro left and right using ← → arrow keys
- **FR-1.3**: Clamp Kiro within canvas boundaries
- **FR-1.4**: Visual feedback when moving (slight lean)
- **FR-1.5**: Kiro has 3 lives; losing all triggers game over

### FR-2: Shooting
- **FR-2.1**: Press SPACE to fire a laser upward from Kiro's position
- **FR-2.2**: Maximum 1 player bullet on screen at a time
- **FR-2.3**: Player bullet moves upward at 700 px/s
- **FR-2.4**: Bullet disappears when hitting alien, bunker, or top of screen
- **FR-2.5**: Shoot cooldown of 0.25 seconds

### FR-3: Alien Fleet
- **FR-3.1**: Spawn 55 aliens in a 5×11 grid at the top of the screen
- **FR-3.2**: Aliens move as a block: right → down → left → down (zigzag)
- **FR-3.3**: Aliens step down 24px when reaching horizontal edge
- **FR-3.4**: Alien speed increases as fewer remain (proportional)
- **FR-3.5**: Aliens occasionally shoot bullets downward at random intervals
- **FR-3.6**: Top row aliens are worth 50pts, descending to 10pts for bottom row

### FR-4: Bunkers
- **FR-4.1**: Render 4 destructible bunkers in the lower area
- **FR-4.2**: Bunkers block both player and alien bullets
- **FR-4.3**: Bunkers degrade pixel-by-pixel on impact
- **FR-4.4**: Bunkers are positioned at y=460, evenly spaced

### FR-5: Scoring & Progression
- **FR-5.1**: Display current score at top-left during gameplay
- **FR-5.2**: Display current level at top-right
- **FR-5.3**: Score per alien varies by row (50/40/30/20/10 pts)
- **FR-5.4**: Bonus 500 points for clearing all aliens
- **FR-5.5**: Track and persist high score via localStorage
- **FR-5.6**: New level starts after clearing all aliens (speed increases ×1.3)

### FR-6: Lives & Game Over
- **FR-6.1**: Display remaining lives as star icons bottom-left
- **FR-6.2**: Kiro respawns after 1 second when hit (no invincibility)
- **FR-6.3**: Losing all 3 lives triggers game over
- **FR-6.4**: Game over also triggers if aliens reach Kiro's y-position

### FR-7: Game States
- **FR-7.1**: **Start Menu** — Title, Kiro preview, high score, controls hint
- **FR-7.2**: **Playing** — Active gameplay with all mechanics
- **FR-7.3**: **Game Over** — Frozen screen, final score, restart prompt

### FR-8: Background & Visuals
- **FR-8.1**: Dark navy space background (#0A0A2E)
- **FR-8.2**: Parallax starfield with 3 depth layers, 100 stars total
- **FR-8.3**: Each alien type has distinct color and shape per row

### FR-9: Audio
- **FR-9.1**: Play laser sound on player shoot
- **FR-9.2**: Play explosion sound on alien destruction
- **FR-9.3**: Play hit sound when Kiro takes damage
- **FR-9.4**: Play game over sound on defeat

---

## Non-Functional Requirements

### NFR-1: Performance
- **NFR-1.1**: Maintain 60 FPS on modern browsers
- **NFR-1.2**: Efficient Canvas rendering (no unnecessary redraws)

### NFR-2: Compatibility
- **NFR-2.1**: Works on Chrome, Firefox, Safari, Edge
- **NFR-2.2**: No internet required after initial load
- **NFR-2.3**: Responsive canvas scaling

### NFR-3: Code Quality
- **NFR-3.1**: Vanilla JavaScript, no frameworks
- **NFR-3.2**: Clean class-based architecture
- **NFR-3.3**: Modular separation of concerns

---

## Technical Constraints

### TC-1: Stack
- HTML5 + CSS3 + Vanilla JavaScript
- HTML5 Canvas for rendering
- Web Audio API for sound

### TC-2: Assets
- `assets/ghosty.png` — Kiro sprite
- `assets/jump.wav` — Laser & alien explosion sounds
- `assets/game_over.wav` — Player hit & game over sounds
- All game graphics rendered procedurally on canvas

### TC-3: Canvas
- Dimensions: 800×600 pixels
- 60 FPS via requestAnimationFrame

---

## Out of Scope
- Mobile touch controls
- Power-ups / special weapons
- Boss fights
- Online leaderboard
- Different character skins
