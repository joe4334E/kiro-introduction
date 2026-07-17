# Flappy Kiro - Implementation Tasks

## Phase 1: Project Setup & Core Structure

### Task 1.1: Create HTML Structure
**Description**: Set up the basic HTML file with canvas element and asset references.

**Details**:
- Create `index.html` with DOCTYPE and meta tags
- Add canvas element with ID (800x600 default size)
- Link to `game.js` and `styles.css`
- Add preload hints for assets

**Acceptance Criteria**:
- HTML file validates
- Canvas element is properly sized and centered
- All file references are correct

---

### Task 1.2: Create CSS Styles
**Description**: Style the page to center canvas and provide basic layout.

**Details**:
- Center canvas on page with flexbox
- Set body background to dark color
- Remove default margins/padding
- Make canvas responsive with max-width
- Add subtle shadow to canvas for depth

**Acceptance Criteria**:
- Canvas is centered horizontally and vertically
- Page looks clean and professional
- No scrollbars appear unnecessarily

---

### Task 1.3: Initialize JavaScript Game Structure
**Description**: Create main game file with basic skeleton and configuration constants.

**Details**:
- Create `game.js` file
- Define CONFIG object with all game constants
- Set up canvas context (2D)
- Create game state enum
- Add basic error handling for asset loading

**Acceptance Criteria**:
- JavaScript file loads without errors
- Canvas context is accessible
- Console shows initialization message

---

## Phase 2: Core Game Loop & State Management

### Task 2.1: Implement Game Manager Class
**Description**: Create the main Game class that controls the game loop and state.

**Details**:
- Create Game class with constructor
- Implement `init()` method to set up game
- Implement `start()` method to begin game loop
- Use `requestAnimationFrame` for main loop
- Calculate and pass deltaTime to update methods
- Implement state machine (START, PLAYING, GAMEOVER)

**Acceptance Criteria**:
- Game loop runs at ~60 FPS
- State transitions work correctly
- deltaTime is calculated properly

---

### Task 2.2: Implement Input Handler
**Description**: Add keyboard input handling for spacebar controls.

**Details**:
- Add event listener for keydown events
- Handle spacebar key (code 'Space' or keyCode 32)
- Trigger appropriate actions based on game state:
  - START: Begin game
  - PLAYING: Make player jump
  - GAMEOVER: Restart game
- Prevent default spacebar behavior (page scroll)

**Acceptance Criteria**:
- Spacebar press is detected reliably
- Different states respond correctly to input
- No page scrolling when spacebar is pressed

---

## Phase 3: Player System

### Task 3.1: Create Player Class
**Description**: Implement the Player class with physics and rendering.

**Details**:
- Create Player class with position, velocity, rotation
- Load and store ghost image (`assets/ghosty.png`)
- Implement `update(deltaTime)` method:
  - Apply gravity to velocityY
  - Update position based on velocity
  - Calculate rotation based on velocity
  - Clamp position to canvas bounds
- Implement `jump()` method to set upward velocity
- Implement `reset()` to return to start position

**Acceptance Criteria**:
- Ghost falls with gravity when game starts
- Ghost image renders correctly
- Position updates smoothly

---

### Task 3.2: Implement Player Rendering with Rotation
**Description**: Render the ghost sprite with rotation based on movement.

**Details**:
- Implement `render(ctx)` method
- Use `ctx.save()` and `ctx.restore()` for rotation
- Translate to player center before rotating
- Rotate based on velocity (up = negative angle, down = positive)
- Clamp rotation to ±90 degrees
- Draw ghost image centered on position

**Acceptance Criteria**:
- Ghost rotates smoothly based on movement
- Rotation is visually appealing
- No rendering artifacts

---

### Task 3.3: Implement Player Collision Detection
**Description**: Add collision box and boundary detection for player.

**Details**:
- Implement `getBounds()` method returning collision rectangle
- Make collision box slightly smaller than sprite (forgiving hitbox)
- Check collision with top/bottom screen boundaries
- Return collision state to game manager

**Acceptance Criteria**:
- Collision box is properly sized
- Hitting top or bottom triggers game over
- Hitbox feels fair to player

---

## Phase 4: Obstacle System

### Task 4.1: Create Pipe Class
**Description**: Implement individual Pipe class for pipe pairs.

**Details**:
- Create Pipe class with x, gapY, gapSize, width
- Implement `update(deltaTime)` to move left
- Implement `render(ctx)` to draw top and bottom pipes:
  - Draw as green rectangles with darker border
  - Top pipe from 0 to gapY - gapSize/2
  - Bottom pipe from gapY + gapSize/2 to canvas bottom
- Implement `isOffScreen()` to check if past left edge
- Add `scored` flag to track if player passed

**Acceptance Criteria**:
- Pipes render as green rectangles
- Pipes move smoothly left
- Top and bottom pipes align with gap

---

### Task 4.2: Implement Pipe Collision Detection
**Description**: Add collision detection between player and pipes.

**Details**:
- Implement `collidesWith(player)` method
- Check AABB collision with top pipe rectangle
- Check AABB collision with bottom pipe rectangle
- Return true if either collision detected

**Acceptance Criteria**:
- Collision detection is accurate
- No false positives or false negatives
- Collision triggers game over

---

### Task 4.3: Create Obstacle Manager Class
**Description**: Implement manager class to handle multiple pipes.

**Details**:
- Create ObstacleManager class
- Maintain array of active pipes
- Implement `spawnPipe()` method:
  - Create new Pipe at canvas right edge
  - Randomize gap Y position within safe bounds
  - Use consistent gap size
- Implement timer to spawn pipes at intervals (every ~2 seconds)
- Implement `update(deltaTime)` to update all pipes
- Remove pipes that move off-screen

**Acceptance Criteria**:
- Pipes spawn at regular intervals
- Multiple pipes can exist simultaneously
- Off-screen pipes are removed

---

### Task 4.4: Implement Score Detection
**Description**: Detect when player successfully passes through pipes.

**Details**:
- Implement `checkScore(player)` method
- For each pipe, check if player's X passed pipe's right edge
- Use `scored` flag to prevent double-counting
- Return true when score should increment

**Acceptance Criteria**:
- Score increments exactly once per pipe passed
- No missed or double-counted scores
- Timing feels correct to player

---

## Phase 5: Background System

### Task 5.1: Implement Sky Background
**Description**: Render the light blue sky background.

**Details**:
- In main render loop, fill canvas with sky color (#87CEEB)
- This should be the first draw operation each frame

**Acceptance Criteria**:
- Sky color fills entire canvas
- Color matches reference image

---

### Task 5.2: Create Cloud Class
**Description**: Implement Cloud class for parallax clouds.

**Details**:
- Create Cloud class with x, y, width, height, speed, opacity
- Implement `update(deltaTime)` to move left at specified speed
- Implement wrapping: when cloud moves off left edge, reposition to right
- Implement `render(ctx)` to draw cloud shape:
  - Use multiple overlapping circles for fluffy appearance
  - Apply semi-transparent white fill
  - Use globalAlpha for opacity

**Acceptance Criteria**:
- Clouds render as soft, rounded shapes
- Clouds scroll smoothly
- Clouds wrap around seamlessly

---

### Task 5.3: Create Background Manager Class
**Description**: Implement manager for parallax cloud layers.

**Details**:
- Create BackgroundManager class
- Generate multiple clouds in 3 layers:
  - Layer 1 (front): speed 0.5, opacity 0.8, larger size
  - Layer 2 (middle): speed 0.3, opacity 0.5, medium size
  - Layer 3 (back): speed 0.15, opacity 0.3, smaller size
- Randomize cloud positions on init
- Implement `update(deltaTime)` for all clouds
- Implement `render(ctx)` to draw all layers (back to front)

**Acceptance Criteria**:
- Three distinct parallax layers are visible
- Front clouds move faster than back clouds
- Parallax effect creates depth perception

---

## Phase 6: Scoring System

### Task 6.1: Create Score Manager Class
**Description**: Implement score tracking and high score persistence.

**Details**:
- Create ScoreManager class
- Track current score and high score
- Implement `increment()` to add 1 to current score
- Implement `reset()` to set current score to 0
- Implement `loadHighScore()` to read from localStorage
- Implement `saveHighScore()` to write to localStorage
- Auto-save high score when current score exceeds it

**Acceptance Criteria**:
- Current score increments correctly
- High score persists across browser sessions
- High score updates when beaten

---

### Task 6.2: Implement Score Rendering
**Description**: Display score during gameplay and on game over.

**Details**:
- Implement `render(ctx)` method for ScoreManager
- Display format: "Score: X | High: Y"
- Position at bottom center of canvas
- Use white text with black outline/shadow for readability
- Use monospace or retro-style font at 24px

**Acceptance Criteria**:
- Score is always visible during gameplay
- Text is easy to read against background
- Format matches specification

---

## Phase 7: Audio System

### Task 7.1: Create Audio Manager Class
**Description**: Implement audio loading and playback.

**Details**:
- Create AudioManager class
- Load `assets/jump.wav` and `assets/game_over.wav`
- Implement `preload()` method to load all sounds
- Implement `playJump()` method
- Implement `playGameOver()` method
- Use cloneNode() to allow overlapping sound effects

**Acceptance Criteria**:
- Sounds load without errors
- Jump sound plays on spacebar press during gameplay
- Game over sound plays on collision
- No audio lag

---

### Task 7.2: Add Audio Error Handling
**Description**: Handle cases where audio fails to load or play.

**Details**:
- Add try-catch around audio loading
- Add error event listeners
- Gracefully continue game if audio fails
- Log errors to console but don't break game

**Acceptance Criteria**:
- Game works even if audio files are missing
- Errors are logged appropriately
- User experience is not degraded

---

## Phase 8: UI & Game States

### Task 8.1: Implement Start Menu Screen
**Description**: Create the initial start menu state.

**Details**:
- Render "FLAPPY KIRO" title centered at top
- Display "Press SPACEBAR to Start" instruction
- Show current high score
- Use large, clear fonts
- Add semi-transparent overlay behind text for readability

**Acceptance Criteria**:
- Start menu is clear and inviting
- Text is easily readable
- Spacebar starts the game

---

### Task 8.2: Implement Game Over Screen
**Description**: Create the game over state overlay.

**Details**:
- Render "GAME OVER" title centered
- Display final score
- Display high score (with indication if new record)
- Show "Press SPACEBAR to Restart" instruction
- Add semi-transparent dark overlay over game
- Keep game state frozen (visible but not updating)

**Acceptance Criteria**:
- Game over screen appears immediately on collision
- All information is clearly displayed
- Spacebar restarts the game properly

---

### Task 8.3: Implement Game Reset Functionality
**Description**: Add ability to reset game for replay.

**Details**:
- Implement `reset()` method in Game class
- Reset player to start position
- Clear all pipes from obstacle manager
- Reset current score (keep high score)
- Return to START state
- Reset all timing counters

**Acceptance Criteria**:
- Game resets completely on restart
- No leftover state from previous game
- High score persists correctly

---

## Phase 9: Integration & Polish

### Task 9.1: Integrate All Systems
**Description**: Connect all systems together in main game loop.

**Details**:
- Initialize all managers in Game constructor
- Call all update methods in correct order
- Call all render methods in correct order (back to front):
  1. Sky background
  2. Background manager (clouds)
  3. Obstacle manager (pipes)
  4. Player
  5. Score manager
  6. State overlays
- Connect input handler to appropriate systems
- Connect collision detection to game over trigger
- Connect score detection to score manager

**Acceptance Criteria**:
- All systems work together seamlessly
- No timing or ordering issues
- Game plays smoothly from start to finish

---

### Task 9.2: Add Asset Preloading
**Description**: Ensure all assets load before game starts.

**Details**:
- Create asset loading system
- Load ghost image before game starts
- Load both audio files before game starts
- Show loading indicator if needed
- Only enable gameplay once all assets are ready
- Handle loading errors gracefully

**Acceptance Criteria**:
- No missing asset errors during gameplay
- Game doesn't start until ready
- Loading is fast and smooth

---

### Task 9.3: Performance Optimization
**Description**: Optimize game loop for consistent 60 FPS.

**Details**:
- Profile game loop performance
- Optimize collision detection (early exits)
- Minimize canvas state changes
- Use efficient drawing methods
- Remove unnecessary calculations
- Consider object pooling for pipes

**Acceptance Criteria**:
- Game maintains 60 FPS on modern browsers
- No frame drops during normal gameplay
- CPU usage is reasonable

---

## Phase 10: Testing & Bug Fixes

### Task 10.1: Comprehensive Gameplay Testing
**Description**: Test all game mechanics thoroughly.

**Details**:
- Test player physics (gravity, jump, rotation)
- Test pipe spawning and movement
- Test collision detection accuracy
- Test score counting accuracy
- Test high score persistence
- Test all state transitions
- Test audio playback
- Test restart functionality

**Acceptance Criteria**:
- All mechanics work as designed
- No critical bugs found
- Game feels fair and fun

---

### Task 10.2: Cross-Browser Testing
**Description**: Verify game works across different browsers.

**Details**:
- Test on Chrome (latest)
- Test on Firefox (latest)
- Test on Safari (latest)
- Test on Edge (latest)
- Check for any browser-specific issues
- Verify audio works on all browsers
- Verify localStorage works on all browsers

**Acceptance Criteria**:
- Game works on all major browsers
- No browser-specific bugs
- Performance is acceptable on all browsers

---

### Task 10.3: Edge Case Testing
**Description**: Test unusual scenarios and edge cases.

**Details**:
- Test rapid spacebar pressing
- Test game with very high scores
- Test localStorage when full or disabled
- Test game with audio disabled
- Test game in different window sizes
- Test game with slow system performance

**Acceptance Criteria**:
- No crashes or errors in edge cases
- Game handles unexpected input gracefully
- Error messages are helpful

---

### Task 10.4: Bug Fixes & Refinements
**Description**: Fix any issues found during testing.

**Details**:
- Create list of bugs found during testing
- Prioritize bugs by severity
- Fix critical bugs first
- Test fixes to ensure no regressions
- Refine difficulty balance if needed
- Adjust collision detection if too harsh/lenient

**Acceptance Criteria**:
- All critical bugs are fixed
- Game is polished and playable
- No known game-breaking issues

---

## Phase 11: Documentation & Delivery

### Task 11.1: Code Documentation
**Description**: Add comments and documentation to code.

**Details**:
- Add JSDoc comments to all classes and methods
- Document complex algorithms
- Add inline comments for tricky code sections
- Document configuration constants
- Create code overview at top of file

**Acceptance Criteria**:
- Code is well-commented
- Purpose of each class/method is clear
- Complex logic is explained

---

### Task 11.2: Update README
**Description**: Create comprehensive README file.

**Details**:
- Add project description
- List features
- Provide setup instructions
- Include how to play
- List controls
- Add credits for assets
- Include browser requirements

**Acceptance Criteria**:
- README is clear and informative
- Setup instructions are accurate
- Anyone can understand how to run the game

---

### Task 11.3: Final Review & Polish
**Description**: Final pass over entire project.

**Details**:
- Review all code for consistency
- Check all file names and paths
- Verify all assets are included
- Test complete setup from scratch
- Check code formatting
- Remove any debug code or console.logs
- Ensure file structure is clean

**Acceptance Criteria**:
- Project is production-ready
- No temporary or debug code remains
- File structure is organized
- All assets are present

---

## Task Summary

**Total Tasks**: 33

**Estimated Time**:
- Phase 1: 1 hour
- Phase 2: 1.5 hours
- Phase 3: 2 hours
- Phase 4: 2.5 hours
- Phase 5: 2 hours
- Phase 6: 1 hour
- Phase 7: 1 hour
- Phase 8: 1.5 hours
- Phase 9: 2 hours
- Phase 10: 2.5 hours
- Phase 11: 1 hour

**Total Estimated Time**: 18-20 hours

**Priority Order**:
1. High Priority: Phases 1-4 (core gameplay)
2. Medium Priority: Phases 5-8 (features & polish)
3. Low Priority: Phases 9-11 (optimization & documentation)

**Dependencies**:
- Phase 2 depends on Phase 1
- Phase 3-8 depend on Phase 2
- Phase 9 depends on Phases 3-8
- Phase 10 depends on Phase 9
- Phase 11 depends on Phase 10
