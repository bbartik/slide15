// Game state
let deck = [];
let playerHand = [];
let dealerHand = [];
let chips = 1000;
let currentBet = 0;
let wins = 0;
let gameInProgress = false;

// Card suits and values
const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// DOM elements
const bettingArea = document.getElementById('bettingArea');
const gameArea = document.getElementById('gameArea');
const resultMessage = document.getElementById('resultMessage');
const resultText = document.getElementById('resultText');

const chipsDisplay = document.getElementById('chips');
const currentBetDisplay = document.getElementById('currentBet');
const winsDisplay = document.getElementById('wins');

const dealerCardsDiv = document.getElementById('dealerCards');
const playerCardsDiv = document.getElementById('playerCards');
const dealerScoreSpan = document.getElementById('dealerScore');
const playerScoreSpan = document.getElementById('playerScore');

const betButtons = document.querySelectorAll('.bet-btn');
const customBetInput = document.getElementById('customBet');
const placeBetBtn = document.getElementById('placeBetBtn');
const hitBtn = document.getElementById('hitBtn');
const standBtn = document.getElementById('standBtn');
const doubleBtn = document.getElementById('doubleBtn');
const newRoundBtn = document.getElementById('newRoundBtn');
const resetChipsBtn = document.getElementById('resetChipsBtn');

// Initialize game
function init() {
    loadSavedData();
    updateDisplay();
    setupEventListeners();
}

// Load saved data from localStorage
function loadSavedData() {
    const savedChips = localStorage.getItem('blackjack_chips');
    const savedWins = localStorage.getItem('blackjack_wins');

    if (savedChips !== null) {
        chips = parseInt(savedChips);
    }
    if (savedWins !== null) {
        wins = parseInt(savedWins);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('blackjack_chips', chips);
    localStorage.setItem('blackjack_wins', wins);
}

// Setup event listeners
function setupEventListeners() {
    betButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(btn.dataset.amount);
            placeBet(amount);
        });
    });

    placeBetBtn.addEventListener('click', () => {
        const customAmount = parseInt(customBetInput.value);
        if (customAmount > 0) {
            placeBet(customAmount);
        }
    });

    hitBtn.addEventListener('click', hit);
    standBtn.addEventListener('click', stand);
    doubleBtn.addEventListener('click', doubleDown);
    newRoundBtn.addEventListener('click', newRound);
    resetChipsBtn.addEventListener('click', resetChips);
}

// Create a new deck
function createDeck() {
    const newDeck = [];
    for (let suit of suits) {
        for (let value of values) {
            newDeck.push({ suit, value });
        }
    }
    return newDeck;
}

// Shuffle deck
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Deal a card
function dealCard(hand) {
    if (deck.length === 0) {
        deck = createDeck();
        shuffleDeck(deck);
    }
    const card = deck.pop();
    hand.push(card);
    return card;
}

// Calculate hand value
function calculateHandValue(hand) {
    let value = 0;
    let aces = 0;

    for (let card of hand) {
        if (card.value === 'A') {
            aces++;
            value += 11;
        } else if (['K', 'Q', 'J'].includes(card.value)) {
            value += 10;
        } else {
            value += parseInt(card.value);
        }
    }

    // Adjust for aces
    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }

    return value;
}

// Place bet
function placeBet(amount) {
    if (amount > chips) {
        alert('You don\'t have enough chips!');
        return;
    }
    if (amount <= 0) {
        alert('Please enter a valid bet amount!');
        return;
    }

    currentBet = amount;
    chips -= amount;
    updateDisplay();
    startGame();
}

// Start game
function startGame() {
    gameInProgress = true;
    deck = createDeck();
    shuffleDeck(deck);
    playerHand = [];
    dealerHand = [];

    // Deal initial cards
    dealCard(playerHand);
    dealCard(dealerHand);
    dealCard(playerHand);
    dealCard(dealerHand);

    // Show game area
    bettingArea.classList.add('hidden');
    gameArea.classList.remove('hidden');
    resultMessage.classList.add('hidden');

    renderHands(true); // Hide dealer's second card

    // Check for blackjack
    if (calculateHandValue(playerHand) === 21) {
        setTimeout(() => stand(), 500);
    }
}

// Render hands
function renderHands(hideDealerCard = false) {
    // Clear existing cards
    playerCardsDiv.innerHTML = '';
    dealerCardsDiv.innerHTML = '';

    // Render player cards
    playerHand.forEach(card => {
        playerCardsDiv.appendChild(createCardElement(card));
    });

    // Render dealer cards
    dealerHand.forEach((card, index) => {
        if (hideDealerCard && index === 1) {
            dealerCardsDiv.appendChild(createCardBack());
        } else {
            dealerCardsDiv.appendChild(createCardElement(card));
        }
    });

    // Update scores
    playerScoreSpan.textContent = calculateHandValue(playerHand);
    if (hideDealerCard) {
        const firstCardValue = calculateHandValue([dealerHand[0]]);
        dealerScoreSpan.textContent = firstCardValue;
    } else {
        dealerScoreSpan.textContent = calculateHandValue(dealerHand);
    }
}

// Create card element
function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';

    if (card.suit === '♥' || card.suit === '♦') {
        cardDiv.classList.add('red');
    } else {
        cardDiv.classList.add('black');
    }

    cardDiv.innerHTML = `
        <div class="card-value">${card.value}</div>
        <div class="card-suit">${card.suit}</div>
    `;

    return cardDiv;
}

// Create card back element
function createCardBack() {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card card-back';
    cardDiv.innerHTML = '?';
    return cardDiv;
}

// Hit
function hit() {
    dealCard(playerHand);
    renderHands(true);

    const playerValue = calculateHandValue(playerHand);
    if (playerValue > 21) {
        endGame('bust');
    } else if (playerValue === 21) {
        stand();
    }

    // Disable double down after first hit
    doubleBtn.disabled = true;
}

// Stand
function stand() {
    // Reveal dealer's hidden card
    renderHands(false);

    // Dealer draws cards
    setTimeout(() => {
        dealerPlay();
    }, 500);
}

// Dealer's turn
function dealerPlay() {
    const dealerValue = calculateHandValue(dealerHand);

    if (dealerValue < 17) {
        dealCard(dealerHand);
        renderHands(false);
        setTimeout(dealerPlay, 500);
    } else {
        determineWinner();
    }
}

// Double down
function doubleDown() {
    if (currentBet > chips) {
        alert('You don\'t have enough chips to double down!');
        return;
    }

    chips -= currentBet;
    currentBet *= 2;
    updateDisplay();

    dealCard(playerHand);
    renderHands(true);

    const playerValue = calculateHandValue(playerHand);
    if (playerValue > 21) {
        endGame('bust');
    } else {
        stand();
    }
}

// Determine winner
function determineWinner() {
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(dealerHand);

    if (dealerValue > 21) {
        endGame('win', 'Dealer busts! You win!');
    } else if (playerValue > dealerValue) {
        endGame('win', 'You win!');
    } else if (playerValue < dealerValue) {
        endGame('lose', 'Dealer wins!');
    } else {
        endGame('push', 'Push! It\'s a tie!');
    }
}

// End game
function endGame(result, message = '') {
    gameInProgress = false;
    hitBtn.disabled = true;
    standBtn.disabled = true;
    doubleBtn.disabled = true;

    // Reveal all dealer cards
    renderHands(false);

    // Update chips based on result
    if (result === 'win') {
        const playerValue = calculateHandValue(playerHand);
        const dealerValue = calculateHandValue(dealerHand);

        // Check for blackjack (21 with 2 cards)
        if (playerValue === 21 && playerHand.length === 2 && dealerValue !== 21) {
            chips += Math.floor(currentBet * 2.5); // 3:2 payout for blackjack
            message = 'Blackjack! You win!';
        } else {
            chips += currentBet * 2;
        }
        wins++;
        resultMessage.className = 'result-message win';
    } else if (result === 'lose') {
        resultMessage.className = 'result-message lose';
    } else if (result === 'push') {
        chips += currentBet; // Return bet
        resultMessage.className = 'result-message push';
    } else if (result === 'bust') {
        message = 'Bust! You lose!';
        resultMessage.className = 'result-message lose';
    }

    // Show result
    if (!message) {
        if (result === 'win') message = 'You win!';
        else if (result === 'lose') message = 'You lose!';
    }

    resultText.textContent = message;
    resultMessage.classList.remove('hidden');

    updateDisplay();
    saveData();

    // Check if player is out of chips
    if (chips === 0) {
        setTimeout(() => {
            alert('You\'re out of chips! Resetting to $1000.');
            resetChips();
        }, 1000);
    }
}

// New round
function newRound() {
    currentBet = 0;
    customBetInput.value = '';

    bettingArea.classList.remove('hidden');
    gameArea.classList.add('hidden');
    resultMessage.classList.add('hidden');

    hitBtn.disabled = false;
    standBtn.disabled = false;
    doubleBtn.disabled = false;

    updateDisplay();
}

// Reset chips
function resetChips() {
    chips = 1000;
    wins = 0;
    currentBet = 0;
    updateDisplay();
    saveData();
    newRound();
}

// Update display
function updateDisplay() {
    chipsDisplay.textContent = chips;
    currentBetDisplay.textContent = currentBet;
    winsDisplay.textContent = wins;
}

// Initialize game when page loads
init();
