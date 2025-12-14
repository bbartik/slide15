# Snake Game

A classic arcade game where you control a growing snake on a grid. Eat food to grow longer, but don't crash into walls or yourself!

## How to Play

1. Click **Start Game** to begin
2. Use **arrow keys** to control the snake's direction:
   - ↑ Up Arrow - Move up
   - ↓ Down Arrow - Move down
   - ← Left Arrow - Move left
   - → Right Arrow - Move right
3. Eat the red food to grow longer and earn points
4. Avoid hitting the walls or your own tail
5. Try to beat your high score!

## Features

- Score tracking with persistent high score
- Pause/Resume functionality
- Smooth canvas-based rendering
- Game over detection (wall and self-collision)
- Visual feedback for snake head
- Responsive design for different screen sizes

## Gameplay Mechanics

- **Snake Speed**: 100ms per frame
- **Points per Food**: 10 points
- **Starting Length**: 5 segments
- **Grid Size**: 20x20 tiles

## Implementation Details

- **HTML5 Canvas** - Smooth, efficient rendering
- **localStorage** - Saves your high score between sessions
- **Collision Detection** - Wall boundaries and self-collision
- **Food Placement** - Intelligently avoids placing food on snake's body

## Tips

- Plan your moves ahead - the snake grows with each food eaten
- Use the edges strategically but don't get trapped
- The longer your snake, the harder it gets!
- Use Pause if you need to think about your next move
