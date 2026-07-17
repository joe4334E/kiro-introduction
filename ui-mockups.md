# UI Mockups & Layouts

## Color Palette
- **Background Space**: #0A0A2E (dark navy)
- **Text Primary**: #FFFFFF (white)
- **Text Accent**: #FFD700 (gold for score)
- **Kiro Glow**: #B0B0FF (ghostly blue)
- **Aliens Row 1**: #FF6B6B (red)
- **Aliens Row 2-3**: #4ECDC4 (teal)
- **Aliens Row 4-5**: #45B7D1 (blue)

## Typography
- **Font Family**: 'Courier New', monospace
- **Title Size**: 48px
- **Subtitle Size**: 32px
- **Body Size**: 24px
- **Small Text**: 18px

---

## Screen 1: Start Menu

### Layout
```
┌────────────────────────────────────┐
│                                     │
│         SPACE INVADERS              │
│           ★ KIRO ★                  │
│                                     │
│         [Kiro ghost sprite]         │
│                                     │
│       Press SPACE to Start          │
│                                     │
│         High Score: 2500            │
│                                     │
│       ← → to Move | SPACE to Fire  │
└────────────────────────────────────┘
```

### Elements
- **Title**: "SPACE INVADERS ★ KIRO ★" — 48px/32px, white/gold, centered
- **Kiro Sprite**: Floating ghost animation in center
- **Prompt**: "Press SPACE to Start" — 24px, white, blinking
- **High Score**: Bottom high score display
- **Controls Hint**: Movement instructions
- **Background**: Starfield animation (stars scrolling)

---

## Screen 2: In-Game HUD

### Layout
```
┌────────────────────────────────────┐
│  Score: 120          Level: 1      │
│  ★                                   │
│  ★  👾 👾 👾 👾 👾 👾 👾 👾 👾 👾 │
│  ★  👾 👾 👾 👾 👾 👾 👾 👾 👾 👾 │
│  ★  👾 👾 👾 👾 👾 👾 👾 👾 👾 👾 │
│  ★  👾 👾 👾 👾 👾 👾 👾 👾 👾 👾 │
│  ★  👾 👾 👾 👾 👾 👾 👾 👾 👾 👾 │
│  ★                                  │
│  ★    ████  ████  ████  ████       │
│  ★                                  │
│  ★              👻                  │
│  ★                                  │
│  Lives: ★★★  ← → █ SPACE █         │
└────────────────────────────────────┘
```

### Elements
- **Score**: Top-left, white monospace 24px
- **Level**: Top-right, white monospace 24px
- **Kiro**: Player character near bottom, moves with arrow keys
- **Aliens**: Grid formation at top, moving side to side
- **Bunkers**: 4 protective barriers in lower area
- **Lives**: Bottom-left, star icons showing remaining lives
- **Bullets**: Player shoots up, aliens shoot down

### Starfield
- 100 stars at varying depths
- Parallax scrolling (3 layers)
- Stars are white dots of varying sizes

---

## Screen 3: Game Over

### Layout
```
┌────────────────────────────────────┐
│      [Semi-transparent overlay]    │
│                                     │
│          GAME OVER                  │
│                                     │
│        Final Score: 1250            │
│      ★ New High Score! ★           │
│         High Score: 1250            │
│                                     │
│         Level Reached: 3            │
│                                     │
│      Press SPACE to Restart         │
│                                     │
│      ← Back to Menu (ESC)          │
└────────────────────────────────────┘
```

### Elements
- **Overlay**: rgba(0, 0, 0, 0.7) over frozen game state
- **Title**: "GAME OVER" — 48px, white, centered
- **Final Score**: 32px, white
- **New Record Badge**: Gold text "★ New High Score! ★" if beaten
- **Level Reached**: 24px, white
- **Restart Prompt**: "Press SPACE to Restart", blinking
- **ESC**: Return to menu
