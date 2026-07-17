# Flappy Kiro - Requirements

## Overview
Flappy Kiro is a browser-based retro game inspired by Flappy Bird, featuring a ghost character navigating through endless pipe obstacles with parallax cloud effects.

## Functional Requirements

### FR-1: Player Character
- **FR-1.1**: Display a ghost sprite using `assets/ghosty.png` as the player character
- **FR-1.2**: Apply constant downward gravity to the ghost
- **FR-1.3**: Enable spacebar key to make the ghost jump upward
- **FR-1.4**: Implement smooth jumping animation with upward velocity
- **FR-1.5**: Rotate the ghost sprite based on velocity (tilting up when jumping, down when falling)

### FR-2: Obstacles
- **FR-2.1**: Generate pairs of green pipes (top and bottom) with vertical gaps
- **FR-2.2**: Move pipes continuously from right to left across the screen
- **FR-2.3**: Randomize gap positions for each pipe pair within safe bounds
- **FR-2.4**: Maintain consistent gap size for fair gameplay
- **FR-2.5**: Spawn new pipe pairs at regular intervals
- **FR-2.6**: Remove pipes that move off-screen to optimize performance
- **FR-2.7**: Detect collision between ghost and pipes

### FR-3: Audio System
- **FR-3.1**: Play `assets/jump.wav` sound effect when spacebar is pressed
- **FR-3.2**: Play `assets/game_over.wav` sound effect on collision with pipes or boundaries
- **FR-3.3**: Support audio preloading to prevent delays
- **FR-3.4**: Allow audio to play even if previous instance hasn't finished

### FR-4: Game States
- **FR-4.1**: **Start Menu State**
  - Display game title "Flappy Kiro"
  - Show instruction text (e.g., "Press SPACEBAR to Start")
  - Display current high score
  - Wait for spacebar input to begin game
  
- **FR-4.2**: **Playing State**
  - Update ghost position based on physics
  - Scroll pipes across screen
  - Display current score in real-time
  - Display high score
  - Detect collisions and trigger game over
  
- **FR-4.3**: **Game Over State**
  - Freeze game animation
  - Display "Game Over" message
  - Show final score
  - Show high score (update if beaten)
  - Display restart instruction (e.g., "Press SPACEBAR to Restart")
  - Wait for spacebar input to restart

### FR-5: Scoring System
- **FR-5.1**: Increment score by 1 when ghost successfully passes through a pipe pair
- **FR-5.2**: Display current score during gameplay at the bottom of screen
- **FR-5.3**: Track and display high score across game sessions
- **FR-5.4**: Persist high score using browser local storage
- **FR-5.5**: Display format: "Score: X | High: Y"

### FR-6: Background & Visuals
- **FR-6.1**: Render light blue sky background color (#87CEEB or similar)
- **FR-6.2**: Generate multiple white semi-transparent cloud shapes
- **FR-6.3**: Implement parallax scrolling with at least 3 cloud layers at different speeds
- **FR-6.4**: Clouds should move left continuously and wrap around
- **FR-6.5**: Front clouds move faster, back clouds move slower
- **FR-6.6**: Cloud opacity varies by layer (closer = more opaque)

## Non-Functional Requirements

### NFR-1: Performance
- **NFR-1.1**: Maintain 60 FPS gameplay on modern browsers
- **NFR-1.2**: Smooth animations without stuttering
- **NFR-1.3**: Efficient rendering using HTML5 Canvas

### NFR-2: Compatibility
- **NFR-2.1**: Support modern browsers (Chrome, Firefox, Safari, Edge)
- **NFR-2.2**: Responsive design that scales to different screen sizes
- **NFR-2.3**: Work without requiring internet connection after initial load

### NFR-3: Usability
- **NFR-3.1**: Simple one-button control (spacebar only)
- **NFR-3.2**: Clear visual feedback for all game states
- **NFR-3.3**: Immediate restart capability after game over
- **NFR-3.4**: Consistent collision detection

### NFR-4: Code Quality
- **NFR-4.1**: Clean, modular JavaScript code structure
- **NFR-4.2**: Proper separation of game logic, rendering, and state management
- **NFR-4.3**: Well-commented code for maintainability

## Technical Constraints

### TC-1: Technology Stack
- HTML5 for structure
- CSS3 for styling
- Vanilla JavaScript (no frameworks required)
- HTML5 Canvas API for rendering
- Web Audio API for sound effects

### TC-2: Assets
- Ghost sprite: `assets/ghosty.png`
- Jump sound: `assets/jump.wav`
- Game over sound: `assets/game_over.wav`
- Pipes: Rendered programmatically (green rectangles)
- Clouds: Rendered programmatically (white rounded shapes)

### TC-3: Game Parameters
- Canvas dimensions: 800x600 pixels (or responsive)
- Gravity: ~0.5 pixels per frame²
- Jump velocity: ~-10 pixels per frame
- Pipe speed: ~3 pixels per frame
- Pipe gap: ~150-180 pixels
- Pipe spawn interval: ~2 seconds
- Cloud speeds: Layer 1 (0.5px/frame), Layer 2 (0.3px/frame), Layer 3 (0.15px/frame)

## Acceptance Criteria

### AC-1: Core Gameplay
- User can start game from menu by pressing spacebar
- Ghost falls due to gravity and jumps when spacebar is pressed
- Pipes scroll continuously from right to left
- Score increments when passing pipes
- Game ends on collision with pipes or screen boundaries
- User can restart immediately after game over

### AC-2: Visual Polish
- Parallax clouds create depth perception
- Ghost rotates based on movement direction
- Score display is always visible and readable
- All game states have clear visual indicators

### AC-3: Audio Feedback
- Jump sound plays on every spacebar press during gameplay
- Game over sound plays on collision
- No audio lag or delay

### AC-4: Persistence
- High score is saved and persists across browser sessions
- High score updates correctly when beaten

## Out of Scope (Future Enhancements)
- Mobile touch controls
- Multiple difficulty levels
- Power-ups or special abilities
- Background music
- Animated ghost sprite frames
- Leaderboard system
- Different character skins
- Achievement system
