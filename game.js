class PuzzleGame {
    constructor() {
        this.gridSize = 4;
        this.tiles = [];
        this.emptyPos = { row: 3, col: 3 };
        this.puzzleElement = document.getElementById('puzzle');
        this.winMessage = document.getElementById('winMessage');
        this.moveCounter = 0;
        this.moveCounterElement = document.getElementById('moveCounter');
        this.bestScoreElement = document.getElementById('bestScore');
        this.winMovesElement = document.getElementById('winMoves');
        this.newRecordElement = document.getElementById('newRecord');
        this.isShuffled = false;

        this.loadBestScore();
        this.init();
        this.setupEventListeners();
    }

    init() {
        this.tiles = [];
        for (let i = 0; i < this.gridSize * this.gridSize - 1; i++) {
            this.tiles.push(i + 1);
        }
        this.tiles.push(0);
        this.emptyPos = { row: 3, col: 3 };
        this.moveCounter = 0;
        this.isShuffled = false;
        this.updateMoveCounter();
        this.render();
        this.winMessage.classList.add('hidden');
        this.newRecordElement.classList.add('hidden');
    }

    setupEventListeners() {
        document.getElementById('shuffleBtn').addEventListener('click', () => this.shuffle());
        document.getElementById('resetBtn').addEventListener('click', () => this.init());
    }

    getIndex(row, col) {
        return row * this.gridSize + col;
    }

    getPosition(index) {
        return {
            row: Math.floor(index / this.gridSize),
            col: index % this.gridSize
        };
    }

    isAdjacent(row, col) {
        const rowDiff = Math.abs(row - this.emptyPos.row);
        const colDiff = Math.abs(col - this.emptyPos.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    moveTile(row, col) {
        if (!this.isAdjacent(row, col)) {
            return false;
        }

        const tileIndex = this.getIndex(row, col);
        const emptyIndex = this.getIndex(this.emptyPos.row, this.emptyPos.col);

        [this.tiles[tileIndex], this.tiles[emptyIndex]] = [this.tiles[emptyIndex], this.tiles[tileIndex]];

        this.emptyPos = { row, col };

        if (this.isShuffled) {
            this.moveCounter++;
            this.updateMoveCounter();
        }

        this.render();
        this.checkWin();
        return true;
    }

    handleTileClick(row, col) {
        this.moveTile(row, col);
    }

    render() {
        this.puzzleElement.innerHTML = '';

        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const index = this.getIndex(row, col);
                const value = this.tiles[index];

                const tile = document.createElement('div');
                tile.className = 'tile';

                if (value === 0) {
                    tile.classList.add('empty');
                } else {
                    tile.textContent = value;
                    if (this.isAdjacent(row, col)) {
                        tile.classList.add('movable');
                    }
                    tile.addEventListener('click', () => this.handleTileClick(row, col));
                }

                this.puzzleElement.appendChild(tile);
            }
        }
    }

    checkWin() {
        for (let i = 0; i < this.tiles.length - 1; i++) {
            if (this.tiles[i] !== i + 1) {
                return false;
            }
        }
        if (this.tiles[this.tiles.length - 1] !== 0) {
            return false;
        }

        if (this.isShuffled) {
            this.winMovesElement.textContent = `You solved it in ${this.moveCounter} moves!`;

            const bestScore = this.getBestScore();
            if (bestScore === null || this.moveCounter < bestScore) {
                this.saveBestScore(this.moveCounter);
                this.updateBestScoreDisplay();
                this.newRecordElement.classList.remove('hidden');
            }

            this.winMessage.classList.remove('hidden');
        }

        return true;
    }

    shuffle() {
        this.winMessage.classList.add('hidden');
        this.newRecordElement.classList.add('hidden');
        this.moveCounter = 0;
        this.updateMoveCounter();

        const moves = 200;
        for (let i = 0; i < moves; i++) {
            const possibleMoves = [];

            if (this.emptyPos.row > 0) {
                possibleMoves.push({ row: this.emptyPos.row - 1, col: this.emptyPos.col });
            }
            if (this.emptyPos.row < this.gridSize - 1) {
                possibleMoves.push({ row: this.emptyPos.row + 1, col: this.emptyPos.col });
            }
            if (this.emptyPos.col > 0) {
                possibleMoves.push({ row: this.emptyPos.row, col: this.emptyPos.col - 1 });
            }
            if (this.emptyPos.col < this.gridSize - 1) {
                possibleMoves.push({ row: this.emptyPos.row, col: this.emptyPos.col + 1 });
            }

            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

            const tileIndex = this.getIndex(randomMove.row, randomMove.col);
            const emptyIndex = this.getIndex(this.emptyPos.row, this.emptyPos.col);

            [this.tiles[tileIndex], this.tiles[emptyIndex]] = [this.tiles[emptyIndex], this.tiles[tileIndex]];
            this.emptyPos = randomMove;
        }

        this.isShuffled = true;
        this.render();
    }

    updateMoveCounter() {
        this.moveCounterElement.textContent = this.moveCounter;
    }

    loadBestScore() {
        this.updateBestScoreDisplay();
    }

    getBestScore() {
        const score = localStorage.getItem('puzzle15BestScore');
        return score ? parseInt(score) : null;
    }

    saveBestScore(score) {
        localStorage.setItem('puzzle15BestScore', score.toString());
    }

    updateBestScoreDisplay() {
        const bestScore = this.getBestScore();
        this.bestScoreElement.textContent = bestScore !== null ? bestScore : '--';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new PuzzleGame();
    game.shuffle();
});
