# Kiro Sprite Specifications

## Overview
Kiro is a ghost navigating through space, shooting alien invaders. The sprite is rendered directly via Canvas (no spritesheet needed).

## Character Dimensions
- **Render Size**: 32x32 pixels
- **Collision Hitbox**: Rectangle, 28x28px centered
- **Base Color**: #FFFFFF (white ghostly body)

## Visual Design (Canvas-drawn)

### Kiro (Player)
- Rounded ghost shape with flowing bottom
- Two dark eyes
- Small arms at sides
- Glowing aura effect

### Animations

#### Idle (Default)
- Gentle floating bobbing (sin wave, amplitude 2px)
- Used when: waiting in START screen

#### Moving
- Slight lean in movement direction (up to ±10°)
- Used when: ← → arrow keys pressed

#### Shooting
- Flash effect at hand position
- 100ms recoil animation
- Trigger: On spacebar press
- Cooldown: 0.25s

#### Death
- Flash white 3 times
- 500ms duration
- Used when: hit by alien bullet

## Alien Visuals (Canvas-drawn)
- **Size**: 32x32 pixels
- **Row 1 (top)**: Squid-like shape (50pts)
- **Row 2-3**: Crab-like shape (40/30pts)
- **Row 4-5**: Basic shape (20/10pts)
- **Animation**: 2-frame walk cycle (tentacle/leg movement)

## Color Palette
- **Kiro Body**: #E8E8FF (ghostly white-blue)
- **Kiro Eyes**: #333333
- **Kiro Aura**: rgba(200, 200, 255, 0.3)
- **Aliens Row 1**: #FF6B6B (red squid)
- **Aliens Row 2-3**: #4ECDC4 (teal crab)
- **Aliens Row 4-5**: #45B7D1 (blue basic)
- **Bullets Player**: #FFFFFF with glow
- **Bullets Alien**: #FF4444 with glow
