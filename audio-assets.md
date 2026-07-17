# Audio Assets Mapping

## Sound Effects

### Laser Shot
- **File**: `assets/jump.wav`
- **Type**: Quick laser/shoot sound
- **Trigger**: On spacebar press during gameplay
- **Duration**: ~200ms
- **Volume**: 0.5 (50%)
- **Description**: Kiro's laser shot when pressing space

### Player Hit
- **File**: `assets/game_over.wav`
- **Type**: Explosion/impact sound
- **Trigger**: When Kiro is hit by alien bullet
- **Duration**: ~300ms
- **Volume**: 0.7 (70%)
- **Description**: Damage taken by player

### Alien Explosion
- **File**: `assets/jump.wav` (higher pitch, faster playback)
- **Type**: Pop/destroy sound
- **Trigger**: When alien is destroyed by player bullet
- **Duration**: ~100ms
- **Volume**: 0.4 (40%)
- **Description**: Alien destroyed sound

### Game Over
- **File**: `assets/game_over.wav`
- **Type**: Defeat/loss sound
- **Trigger**: When all lives lost
- **Duration**: ~500ms
- **Volume**: 0.8 (80%)
- **Description**: Game over sequence

## Audio Implementation Notes
- Use Web Audio API for pitch shifting (alien explosion)
- Preload all sounds before game starts
- Allow overlapping sounds (use cloneNode())
- Implement mute toggle
- Graceful degradation if audio fails
