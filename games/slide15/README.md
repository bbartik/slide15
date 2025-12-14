# Slide15 Puzzle

A classic sliding puzzle game where you arrange numbered tiles from 1 to 15 by sliding them into the empty space.

## How to Play

1. Click the **Shuffle** button to scramble the tiles
2. Click on tiles adjacent to the empty space to slide them
3. Arrange all tiles in order from 1-15 with the empty space in the bottom-right corner
4. Try to solve it in as few moves as possible!

## Features

- Move counter to track your progress
- Personal best score saved locally
- Visual feedback for movable tiles
- Win detection with congratulations message
- Reset button to return to solved state
- Responsive design for mobile and desktop

## Implementation Details

- **Pure JavaScript** - No external dependencies
- **localStorage** - Saves your personal best score
- **CSS Grid** - Clean, responsive layout
- **Guaranteed solvable** - Shuffle algorithm ensures every puzzle can be solved

## Technical Notes

The shuffle algorithm performs 200 random valid moves to ensure the puzzle is always solvable, avoiding the unsolvable configurations that can occur with pure random shuffling.
