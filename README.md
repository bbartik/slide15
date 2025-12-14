# Classic Games Collection

A collection of classic arcade and puzzle games built with vanilla JavaScript, HTML, and CSS.

## Games

### 1. Slide15
A classic sliding puzzle game where you arrange tiles numbered 1-15 in order by sliding them into the empty space.

**Features:**
- 4x4 grid with 15 numbered tiles
- Move counter and personal best tracking
- Responsive design for mobile devices
- Win detection with congratulations message

[View Slide15 README](games/slide15/README.md)

### 2. Snake
The classic arcade game where you control a growing snake. Eat food to grow longer, but don't crash into walls or yourself!

**Features:**
- Smooth canvas-based rendering
- Score tracking with high score persistence
- Pause/Resume functionality
- Collision detection for walls and self

[View Snake README](games/snake/README.md)

## How to Play

1. Open `index.html` in your browser
2. Click on any game card to start playing
3. Each game has its own instructions and controls

## Hosting Options

### Option 1: GitHub Pages (Free & Easy)

1. Create a new repository on GitHub
2. Push your code to the repository
3. Go to Settings > Pages
4. Select "main" branch as source
5. Your game will be live at `https://yourusername.github.io/repositoryname`

### Option 2: Netlify (Free & Easy)

1. Go to [netlify.com](https://www.netlify.com)
2. Sign up for a free account
3. Drag and drop your project folder
4. Your game will be live instantly with a custom URL

### Option 3: Vercel (Free & Easy)

1. Go to [vercel.com](https://vercel.com)
2. Sign up for a free account
3. Import your GitHub repository
4. Deploy with one click

### Option 4: Local Testing

Simply open `index.html` in your web browser to play locally.

## Project Structure

```
game1/
├── index.html          # Games homepage
├── homepage.css        # Homepage styling
├── games/
│   ├── slide15/
│   │   ├── index.html  # Slide15 game page
│   │   ├── style.css   # Slide15 styling
│   │   ├── game.js     # Slide15 game logic
│   │   └── README.md   # Slide15 documentation
│   └── snake/
│       ├── index.html  # Snake game page
│       ├── style.css   # Snake styling
│       ├── game.js     # Snake game logic
│       └── README.md   # Snake documentation
├── .gitignore
└── README.md           # This file
```

## Technologies Used

- HTML5
- CSS3 (Grid Layout, Flexbox, Gradients)
- Vanilla JavaScript (ES6+)
- LocalStorage API

## Development

To modify the game:

1. Clone the repository
2. Open files in your preferred editor
3. Make changes
4. Test by opening `index.html` in a browser

## License

Free to use and modify for personal or commercial projects.
