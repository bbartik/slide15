class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;

        this.snake = [];
        this.snakeLength = 5;
        this.headX = 10;
        this.headY = 10;
        this.velocityX = 0;
        this.velocityY = 0;

        this.foodX = 15;
        this.foodY = 15;

        this.score = 0;
        this.highScore = this.loadHighScore();

        this.gameRunning = false;
        this.gamePaused = false;
        this.gameLoop = null;
        this.speed = 100;

        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('highScore');
        this.gameOverMessage = document.getElementById('gameOverMessage');
        this.finalScoreElement = document.getElementById('finalScore');
        this.newHighScoreElement = document.getElementById('newHighScore');

        this.updateHighScoreDisplay();
        this.setupEventListeners();
        this.drawWelcomeScreen();
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.startGame());

        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleKeyPress(e) {
        if (!this.gameRunning || this.gamePaused) return;

        switch(e.key) {
            case 'ArrowUp':
                if (this.velocityY !== 1) {
                    this.velocityX = 0;
                    this.velocityY = -1;
                }
                e.preventDefault();
                break;
            case 'ArrowDown':
                if (this.velocityY !== -1) {
                    this.velocityX = 0;
                    this.velocityY = 1;
                }
                e.preventDefault();
                break;
            case 'ArrowLeft':
                if (this.velocityX !== 1) {
                    this.velocityX = -1;
                    this.velocityY = 0;
                }
                e.preventDefault();
                break;
            case 'ArrowRight':
                if (this.velocityX !== -1) {
                    this.velocityX = 1;
                    this.velocityY = 0;
                }
                e.preventDefault();
                break;
        }
    }

    startGame() {
        this.snake = [];
        this.snakeLength = 5;
        this.headX = 10;
        this.headY = 10;
        this.velocityX = 1;
        this.velocityY = 0;
        this.score = 0;
        this.gameRunning = true;
        this.gamePaused = false;

        this.updateScore();
        this.placeFood();
        this.gameOverMessage.classList.add('hidden');
        this.newHighScoreElement.classList.add('hidden');

        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;

        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }

        this.gameLoop = setInterval(() => this.update(), this.speed);
    }

    togglePause() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('pauseBtn').textContent = this.gamePaused ? 'Resume' : 'Pause';

        if (this.gamePaused) {
            this.drawPausedScreen();
        }
    }

    update() {
        if (this.gamePaused) return;

        this.headX += this.velocityX;
        this.headY += this.velocityY;

        if (this.headX < 0 || this.headX >= this.tileCount ||
            this.headY < 0 || this.headY >= this.tileCount) {
            this.endGame();
            return;
        }

        for (let i = 0; i < this.snake.length; i++) {
            if (this.snake[i].x === this.headX && this.snake[i].y === this.headY) {
                this.endGame();
                return;
            }
        }

        this.snake.push({ x: this.headX, y: this.headY });

        while (this.snake.length > this.snakeLength) {
            this.snake.shift();
        }

        if (this.headX === this.foodX && this.headY === this.foodY) {
            this.snakeLength++;
            this.score += 10;
            this.updateScore();
            this.placeFood();
        }

        this.draw();
    }

    placeFood() {
        let validPosition = false;

        while (!validPosition) {
            this.foodX = Math.floor(Math.random() * this.tileCount);
            this.foodY = Math.floor(Math.random() * this.tileCount);

            validPosition = true;
            for (let i = 0; i < this.snake.length; i++) {
                if (this.snake[i].x === this.foodX && this.snake[i].y === this.foodY) {
                    validPosition = false;
                    break;
                }
            }
        }
    }

    draw() {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#4CAF50';
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            if (i === this.snake.length - 1) {
                this.ctx.fillStyle = '#45a049';
            }
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        }

        this.ctx.fillStyle = '#ff5252';
        this.ctx.fillRect(
            this.foodX * this.gridSize + 1,
            this.foodY * this.gridSize + 1,
            this.gridSize - 2,
            this.gridSize - 2
        );
    }

    drawWelcomeScreen() {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#4CAF50';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Snake Game', this.canvas.width / 2, this.canvas.height / 2 - 20);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Press Start to Begin', this.canvas.width / 2, this.canvas.height / 2 + 20);
    }

    drawPausedScreen() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }

    endGame() {
        this.gameRunning = false;
        clearInterval(this.gameLoop);

        this.finalScoreElement.textContent = `Final Score: ${this.score}`;

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore(this.highScore);
            this.updateHighScoreDisplay();
            this.newHighScoreElement.classList.remove('hidden');
        }

        this.gameOverMessage.classList.remove('hidden');

        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('pauseBtn').textContent = 'Pause';
    }

    updateScore() {
        this.scoreElement.textContent = this.score;
    }

    loadHighScore() {
        const score = localStorage.getItem('snakeHighScore');
        return score ? parseInt(score) : 0;
    }

    saveHighScore(score) {
        localStorage.setItem('snakeHighScore', score.toString());
    }

    updateHighScoreDisplay() {
        this.highScoreElement.textContent = this.highScore;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new SnakeGame();
});
