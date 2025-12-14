// ===== GAME STATE =====
const state = {
    // Deck management
    shoe: [],
    cutCardPosition: 0,
    needsShuffle: false,
    numDecks: 6,

    // Player spots (0 = human, 1-6 = AI)
    spots: Array(7).fill(null).map((_, i) => ({
        index: i,
        isActive: i === 0, // Only spot 0 (human) is active by default
        isAI: i > 0,
        hand: [],
        splitHand: null,
        bet: 0,
        insurance: 0,
        result: '',
        isSplit: false,
        isCurrentHand: false // Track which hand (main or split) is active
    })),

    // Dealer
    dealerHand: [],
    dealerScore: 0,

    // Game state
    isPlaying: false,
    currentSpotIndex: -1,
    currentHandIsSplit: false,

    // Settings
    useNewbieAI: false,
    gameSpeed: 5,

    // Statistics
    bankroll: 1000,
    handsPlayed: 0,
    handsWon: 0,
    handsLost: 0,
    handsPush: 0,
    totalWinnings: 0
};

// ===== CONSTANTS =====
const suits = ['♠', '♥', '♦', '♣'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// ===== UTILITY FUNCTIONS =====
function sleep(ms) {
    const speed = state.gameSpeed;
    const adjustedMs = ms * (11 - speed) / 5;
    return new Promise(resolve => setTimeout(resolve, adjustedMs));
}

function createDeck() {
    const deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    return deck;
}

function createShoe(numDecks) {
    const shoe = [];
    for (let i = 0; i < numDecks; i++) {
        shoe.push(...createDeck());
    }
    return shoe;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

async function shuffleShoe() {
    showShuffleMessage();
    await sleep(1500);

    state.shoe = createShoe(state.numDecks);
    shuffleArray(state.shoe);

    // Place cut card: ~75 cards from the end for 6-deck, ~15 for single deck
    const cutCardDistance = state.numDecks === 6 ? 75 : 15;
    state.cutCardPosition = state.shoe.length - cutCardDistance;
    state.needsShuffle = false;

    updateDeckInfo();
    hideShuffleMessage();
}

function dealCard() {
    if (state.shoe.length === 0 || state.shoe.length <= state.cutCardPosition) {
        state.needsShuffle = true;
    }
    return state.shoe.pop();
}

function getCardValue(card) {
    if (card.value === 'A') return 11;
    if (['K', 'Q', 'J'].includes(card.value)) return 10;
    return parseInt(card.value);
}

function calculateHandValue(hand) {
    let value = 0;
    let aces = 0;

    for (let card of hand) {
        const cardValue = getCardValue(card);
        value += cardValue;
        if (card.value === 'A') aces++;
    }

    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }

    return value;
}

function isBlackjack(hand) {
    return hand.length === 2 && calculateHandValue(hand) === 21;
}

function isSoftHand(hand) {
    let value = 0;
    let aces = 0;

    for (let card of hand) {
        value += getCardValue(card);
        if (card.value === 'A') aces++;
    }

    return aces > 0 && value <= 21;
}

function canSplit(hand) {
    return hand.length === 2 && getCardValue(hand[0]) === getCardValue(hand[1]);
}

// ===== AI STRATEGY =====
function getBasicStrategyAction(hand, dealerUpCard, canDouble, canSplitNow) {
    const playerValue = calculateHandValue(hand);
    const dealerValue = getCardValue(dealerUpCard);
    const isSoft = isSoftHand(hand);
    const isPair = canSplit(hand);

    // Pair splitting strategy
    if (isPair && canSplitNow) {
        const pairValue = getCardValue(hand[0]);
        if (pairValue === 11 || pairValue === 8) return 'split'; // Always split A's and 8's
        if (pairValue === 10) return 'stand'; // Never split 10's
        if (pairValue === 9) {
            if (dealerValue === 7 || dealerValue >= 10) return 'stand';
            return 'split';
        }
        if (pairValue === 7 && dealerValue <= 7) return 'split';
        if (pairValue === 6 && dealerValue <= 6) return 'split';
        if (pairValue === 4 && (dealerValue === 5 || dealerValue === 6)) return 'split';
        if (pairValue === 3 || pairValue === 2) {
            if (dealerValue <= 7) return 'split';
        }
    }

    // Soft hand strategy
    if (isSoft && playerValue !== 21) {
        if (playerValue >= 19) return 'stand';
        if (playerValue === 18) {
            if (dealerValue <= 8) return 'stand';
            return 'hit';
        }
        if (playerValue === 17 && canDouble && dealerValue >= 3 && dealerValue <= 6) {
            return 'double';
        }
        return 'hit';
    }

    // Hard hand strategy
    if (playerValue >= 17) return 'stand';
    if (playerValue <= 11) {
        if (playerValue === 11 && canDouble) return 'double';
        if (playerValue === 10 && canDouble && dealerValue <= 9) return 'double';
        if (playerValue === 9 && canDouble && dealerValue >= 3 && dealerValue <= 6) return 'double';
        return 'hit';
    }
    if (playerValue >= 13 && dealerValue <= 6) return 'stand';
    if (playerValue === 12 && dealerValue >= 4 && dealerValue <= 6) return 'stand';

    return 'hit';
}

function getNewbieAction(hand, dealerUpCard) {
    const playerValue = calculateHandValue(hand);

    // Newbie makes suboptimal plays
    const random = Math.random();

    if (playerValue >= 18) {
        return random > 0.9 ? 'hit' : 'stand'; // Sometimes hits on 18+
    }
    if (playerValue === 17) {
        return random > 0.5 ? 'hit' : 'stand'; // Coin flip on 17
    }
    if (playerValue <= 11) {
        return 'hit';
    }
    if (playerValue >= 13 && playerValue <= 16) {
        // Newbie afraid of busting
        return random > 0.7 ? 'hit' : 'stand';
    }
    if (playerValue === 12) {
        return random > 0.4 ? 'hit' : 'stand';
    }

    return 'hit';
}

function getAIAction(spot, hand, dealerUpCard) {
    const canDouble = spot.bet <= state.bankroll && hand.length === 2;
    const canSplitNow = canSplit(hand) && spot.bet <= state.bankroll && !spot.isSplit;

    if (state.useNewbieAI) {
        return getNewbieAction(hand, dealerUpCard);
    }

    return getBasicStrategyAction(hand, dealerUpCard, canDouble, canSplitNow);
}

// ===== DOM HELPERS =====
function createCardElement(card, isHidden = false) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';

    if (isHidden) {
        cardDiv.classList.add('card-back');
        cardDiv.textContent = '?';
    } else {
        if (card.suit === '♥' || card.suit === '♦') {
            cardDiv.classList.add('red');
        } else {
            cardDiv.classList.add('black');
        }
        cardDiv.innerHTML = `
            <div class="card-value">${card.value}</div>
            <div class="card-suit">${card.suit}</div>
        `;
    }

    return cardDiv;
}

function updateDeckInfo() {
    document.getElementById('cardsRemaining').textContent = state.shoe.length;
    const decksLeft = (state.shoe.length / 52).toFixed(1);
    document.getElementById('decksRemaining').textContent = decksLeft;
}

function updateStats() {
    document.getElementById('chips').textContent = `$${state.bankroll}`;
    document.getElementById('handsPlayed').textContent = state.handsPlayed;

    const winRate = state.handsPlayed > 0
        ? ((state.handsWon / state.handsPlayed) * 100).toFixed(1)
        : 0;
    document.getElementById('winRate').textContent = `${winRate}%`;

    const netSign = state.totalWinnings >= 0 ? '+' : '';
    document.getElementById('netWinnings').textContent = `${netSign}$${state.totalWinnings}`;
}

function showShuffleMessage() {
    document.getElementById('shuffleMessage').classList.remove('hidden');
}

function hideShuffleMessage() {
    document.getElementById('shuffleMessage').classList.add('hidden');
}

function renderSpot(spotIndex) {
    const spot = state.spots[spotIndex];
    const cardsDiv = document.getElementById(`cards${spotIndex}`);
    const scoreSpan = document.getElementById(`score${spotIndex}`);
    const betDisplay = document.getElementById(`betDisplay${spotIndex}`);
    const resultDiv = document.getElementById(`result${spotIndex}`);

    // Render cards
    cardsDiv.innerHTML = '';
    if (spot.hand.length > 0) {
        spot.hand.forEach(card => {
            cardsDiv.appendChild(createCardElement(card));
        });

        // If split, show split hand too
        if (spot.splitHand && spot.splitHand.length > 0) {
            const divider = document.createElement('div');
            divider.style.width = '100%';
            divider.style.height = '2px';
            divider.style.background = 'white';
            divider.style.margin = '5px 0';
            cardsDiv.appendChild(divider);

            spot.splitHand.forEach(card => {
                cardsDiv.appendChild(createCardElement(card));
            });
        }
    }

    // Update score
    if (spot.hand.length > 0) {
        const mainScore = calculateHandValue(spot.hand);
        if (spot.splitHand) {
            const splitScore = calculateHandValue(spot.splitHand);
            scoreSpan.textContent = `${mainScore} / ${splitScore}`;
        } else {
            scoreSpan.textContent = mainScore;
        }
        scoreSpan.classList.remove('hidden');
    } else {
        scoreSpan.textContent = '-';
    }

    // Update bet display
    if (spot.bet > 0) {
        betDisplay.textContent = `$${spot.bet}`;
    }

    // Update result
    if (spot.result) {
        resultDiv.textContent = spot.result;
        resultDiv.className = 'spot-result';
        if (spot.result.includes('Win') || spot.result.includes('Blackjack')) {
            resultDiv.classList.add('win');
            if (spot.result.includes('Blackjack')) resultDiv.classList.add('blackjack');
        } else if (spot.result.includes('Lose') || spot.result.includes('Bust')) {
            resultDiv.classList.add('lose');
        } else if (spot.result.includes('Push')) {
            resultDiv.classList.add('push');
        }
    } else {
        resultDiv.textContent = '';
        resultDiv.className = 'spot-result';
    }
}

function renderDealer(hideSecondCard = false) {
    const cardsDiv = document.getElementById('dealerCards');
    const scoreSpan = document.getElementById('dealerScore');

    cardsDiv.innerHTML = '';
    state.dealerHand.forEach((card, index) => {
        const isHidden = hideSecondCard && index === 1;
        cardsDiv.appendChild(createCardElement(card, isHidden));
    });

    if (hideSecondCard && state.dealerHand.length >= 2) {
        scoreSpan.textContent = getCardValue(state.dealerHand[0]);
    } else {
        scoreSpan.textContent = calculateHandValue(state.dealerHand);
    }
}

function setCurrentTurn(spotIndex, isSplit = false) {
    // Remove current-turn class from all spots
    document.querySelectorAll('.player-spot').forEach(spot => {
        spot.classList.remove('current-turn');
    });

    // Add current-turn class to active spot
    if (spotIndex >= 0) {
        document.getElementById(`spot${spotIndex}`).classList.add('current-turn');
    }

    state.currentSpotIndex = spotIndex;
    state.currentHandIsSplit = isSplit;
}

function disableAllControls() {
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.disabled = true;
    });
}

function updateSpotControls(spotIndex) {
    const spot = state.spots[spotIndex];
    const controls = document.getElementById(`controls${spotIndex}`);

    if (!controls || !spot.isActive || spot.isAI) {
        return;
    }

    const hand = state.currentHandIsSplit ? spot.splitHand : spot.hand;
    const handValue = calculateHandValue(hand);

    const hitBtn = controls.querySelector('[data-action="hit"]');
    const standBtn = controls.querySelector('[data-action="stand"]');
    const doubleBtn = controls.querySelector('[data-action="double"]');
    const splitBtn = controls.querySelector('[data-action="split"]');

    // Enable/disable based on game state
    const canDouble = hand.length === 2 && spot.bet <= state.bankroll;
    const canSplitNow = canSplit(hand) && spot.bet <= state.bankroll && !spot.isSplit;

    hitBtn.disabled = handValue >= 21;
    standBtn.disabled = handValue > 21;
    doubleBtn.disabled = !canDouble || handValue >= 21;
    splitBtn.disabled = !canSplitNow;
}

// ===== GAME ACTIONS =====
async function dealInitialCards() {
    // Check if we need to shuffle
    if (state.needsShuffle) {
        await shuffleShoe();
    }

    // Reset all active spots
    state.spots.forEach(spot => {
        if (spot.isActive) {
            spot.hand = [];
            spot.splitHand = null;
            spot.result = '';
            spot.isSplit = false;
            spot.isCurrentHand = false;
        }
    });
    state.dealerHand = [];

    // Deal first card to each active spot
    for (let spot of state.spots) {
        if (spot.isActive) {
            spot.hand.push(dealCard());
            renderSpot(spot.index);
            await sleep(200);
        }
    }

    // Deal first card to dealer
    state.dealerHand.push(dealCard());
    renderDealer();
    await sleep(200);

    // Deal second card to each active spot
    for (let spot of state.spots) {
        if (spot.isActive) {
            spot.hand.push(dealCard());
            renderSpot(spot.index);
            await sleep(200);
        }
    }

    // Deal second card to dealer (face down)
    state.dealerHand.push(dealCard());
    renderDealer(true);
    await sleep(200);

    updateDeckInfo();

    // Check for dealer blackjack
    if (isBlackjack(state.dealerHand)) {
        // Offer insurance if dealer shows Ace
        if (state.dealerHand[0].value === 'A') {
            await offerInsurance();
        }
        // Reveal and resolve
        renderDealer(false);
        await resolveAllHands();
        return;
    }

    // Offer insurance if dealer shows Ace
    if (state.dealerHand[0].value === 'A') {
        await offerInsurance();
    }

    // Start player turns
    await playAllSpots();
}

async function offerInsurance() {
    // For human player only (spot 0)
    const humanSpot = state.spots[0];
    if (humanSpot.isActive && humanSpot.bet > 0) {
        // Show insurance button
        document.getElementById('insuranceBtn').classList.remove('hidden');

        // Wait for player decision (implement timeout)
        await sleep(3000);

        document.getElementById('insuranceBtn').classList.add('hidden');
    }
}

async function playAllSpots() {
    for (let i = 0; i < state.spots.length; i++) {
        const spot = state.spots[i];
        if (!spot.isActive) continue;

        setCurrentTurn(i, false);

        // Check for blackjack
        if (isBlackjack(spot.hand)) {
            spot.result = 'Blackjack!';
            renderSpot(i);
            await sleep(500);
            continue;
        }

        // Play main hand
        await playHand(spot, false);

        // If split, play split hand
        if (spot.splitHand) {
            setCurrentTurn(i, true);
            await playHand(spot, true);
        }
    }

    setCurrentTurn(-1);

    // Dealer's turn
    await playDealer();

    // Resolve all hands
    await resolveAllHands();
}

async function playHand(spot, isSplitHand) {
    const hand = isSplitHand ? spot.splitHand : spot.hand;

    if (spot.isAI) {
        // AI plays
        while (true) {
            const handValue = calculateHandValue(hand);
            if (handValue >= 21) break;

            const action = getAIAction(spot, hand, state.dealerHand[0]);

            if (action === 'hit') {
                await hitAction(spot, isSplitHand);
            } else if (action === 'double') {
                await doubleAction(spot, isSplitHand);
                break;
            } else if (action === 'split' && !isSplitHand) {
                await splitAction(spot);
                break; // Split will handle both hands
            } else {
                break; // Stand
            }

            await sleep(500);
        }
    } else {
        // Human player - enable controls and wait
        updateSpotControls(spot.index);
        // Human controls are handled by button clicks
        // We need to wait until they stand or bust
        // This will be handled by the action buttons
    }
}

async function hitAction(spot, isSplitHand = false) {
    const hand = isSplitHand ? spot.splitHand : spot.hand;
    hand.push(dealCard());
    renderSpot(spot.index);
    updateDeckInfo();

    const handValue = calculateHandValue(hand);
    if (handValue > 21) {
        spot.result = 'Bust!';
        renderSpot(spot.index);
        disableAllControls();
        return true; // Hand is done
    }

    if (!spot.isAI) {
        updateSpotControls(spot.index);
    }

    return handValue >= 21;
}

async function standAction(spot) {
    disableAllControls();
    // Move to next spot
    const nextActiveSpot = state.spots.findIndex((s, i) =>
        i > spot.index && s.isActive && calculateHandValue(s.hand) < 21
    );

    if (nextActiveSpot === -1) {
        // No more spots, dealer plays
        setCurrentTurn(-1);
        await playDealer();
        await resolveAllHands();
    } else {
        setCurrentTurn(nextActiveSpot);
        await playHand(state.spots[nextActiveSpot], false);
    }
}

async function doubleAction(spot, isSplitHand = false) {
    if (spot.bet > state.bankroll) return;

    state.bankroll -= spot.bet;
    spot.bet *= 2;
    updateStats();
    renderSpot(spot.index);

    // Hit exactly once
    await hitAction(spot, isSplitHand);

    // Then stand
    if (!spot.isAI) {
        disableAllControls();
    }
}

async function splitAction(spot) {
    if (spot.bet > state.bankroll || spot.isSplit) return;

    state.bankroll -= spot.bet;
    spot.isSplit = true;

    // Split the hand
    spot.splitHand = [spot.hand.pop()];

    // Deal new cards
    spot.hand.push(dealCard());
    spot.splitHand.push(dealCard());

    updateStats();
    renderSpot(spot.index);
    updateDeckInfo();

    if (!spot.isAI) {
        updateSpotControls(spot.index);
    }
}

async function playDealer() {
    renderDealer(false);
    await sleep(1000);

    while (calculateHandValue(state.dealerHand) < 17) {
        state.dealerHand.push(dealCard());
        renderDealer(false);
        updateDeckInfo();
        await sleep(800);
    }
}

async function resolveAllHands() {
    const dealerValue = calculateHandValue(state.dealerHand);
    const dealerBlackjack = isBlackjack(state.dealerHand);
    const dealerBust = dealerValue > 21;

    for (let spot of state.spots) {
        if (!spot.isActive) continue;

        // Resolve main hand
        resolveHand(spot, spot.hand, dealerValue, dealerBlackjack, dealerBust);

        // Resolve split hand if exists
        if (spot.splitHand) {
            resolveHand(spot, spot.splitHand, dealerValue, dealerBlackjack, dealerBust, true);
        }

        renderSpot(spot.index);
    }

    updateStats();
    saveData();

    // Update statistics
    state.handsPlayed++;

    // Re-enable deal button
    document.getElementById('dealBtn').disabled = false;
}

function resolveHand(spot, hand, dealerValue, dealerBlackjack, dealerBust, isSplit = false) {
    const handValue = calculateHandValue(hand);
    const playerBlackjack = isBlackjack(hand);
    const playerBust = handValue > 21;

    let result = '';
    let payout = 0;

    if (playerBust) {
        result = 'Bust!';
        state.handsLost++;
    } else if (playerBlackjack && !dealerBlackjack) {
        result = 'Blackjack!';
        payout = spot.bet * 2.5; // 3:2 payout
        state.handsWon++;
    } else if (dealerBust) {
        result = 'Win!';
        payout = spot.bet * 2;
        state.handsWon++;
    } else if (handValue > dealerValue) {
        result = 'Win!';
        payout = spot.bet * 2;
        state.handsWon++;
    } else if (handValue < dealerValue) {
        result = 'Lose';
        state.handsLost++;
    } else {
        result = 'Push';
        payout = spot.bet;
        state.handsPush++;
    }

    state.bankroll += payout;
    const netChange = payout - spot.bet;
    state.totalWinnings += netChange;

    if (isSplit) {
        spot.result += ' | ' + result;
    } else {
        spot.result = result;
    }
}

// ===== EVENT HANDLERS =====
async function handleDeal() {
    // Validate bets
    let totalBet = 0;
    for (let spot of state.spots) {
        if (spot.isActive) {
            const betInput = document.getElementById(`betInput${spot.index}`);
            if (betInput) {
                spot.bet = parseInt(betInput.value) || 10;
                totalBet += spot.bet;
            }
        }
    }

    if (totalBet > state.bankroll) {
        alert('Not enough chips for all bets!');
        return;
    }

    if (totalBet === 0) {
        alert('Please place at least one bet!');
        return;
    }

    // Deduct bets
    state.bankroll -= totalBet;
    updateStats();

    // Disable deal button
    document.getElementById('dealBtn').disabled = true;
    disableAllControls();

    state.isPlaying = true;

    await dealInitialCards();
}

function handleAddPlayer(spotIndex) {
    const spot = state.spots[spotIndex];
    spot.isActive = true;

    const spotDiv = document.getElementById(`spot${spotIndex}`);
    spotDiv.classList.remove('inactive');
    spotDiv.classList.add('active');

    spotDiv.querySelector('.add-player-btn').classList.add('hidden');
    spotDiv.querySelector('.remove-player-btn').classList.remove('hidden');
}

function handleRemovePlayer(spotIndex) {
    if (state.isPlaying) return;

    const spot = state.spots[spotIndex];
    spot.isActive = false;
    spot.hand = [];
    spot.splitHand = null;
    spot.bet = 0;
    spot.result = '';

    const spotDiv = document.getElementById(`spot${spotIndex}`);
    spotDiv.classList.add('inactive');
    spotDiv.classList.remove('active');

    spotDiv.querySelector('.add-player-btn').classList.remove('hidden');
    spotDiv.querySelector('.remove-player-btn').classList.add('hidden');

    renderSpot(spotIndex);
}

function handleAction(action, spotIndex) {
    const spot = state.spots[spotIndex];

    if (spot.index !== state.currentSpotIndex) return;

    switch(action) {
        case 'hit':
            hitAction(spot, state.currentHandIsSplit);
            break;
        case 'stand':
            standAction(spot);
            break;
        case 'double':
            doubleAction(spot, state.currentHandIsSplit);
            break;
        case 'split':
            splitAction(spot);
            break;
    }
}

function handleDeckToggle(event) {
    if (state.isPlaying) {
        event.preventDefault();
        return;
    }

    state.numDecks = event.target.checked ? 6 : 1;
    state.needsShuffle = true;
}

function handleNewbieToggle(event) {
    state.useNewbieAI = !event.target.checked;
}

function handleSpeedChange(event) {
    state.gameSpeed = parseInt(event.target.value);
    document.getElementById('speedValue').textContent = state.gameSpeed;
}

function handleResetStats() {
    state.bankroll = 1000;
    state.handsPlayed = 0;
    state.handsWon = 0;
    state.handsLost = 0;
    state.handsPush = 0;
    state.totalWinnings = 0;
    updateStats();
    saveData();
}

// ===== LOCAL STORAGE =====
function saveData() {
    localStorage.setItem('blackjack_state', JSON.stringify({
        bankroll: state.bankroll,
        handsPlayed: state.handsPlayed,
        handsWon: state.handsWon,
        handsLost: state.handsLost,
        handsPush: state.handsPush,
        totalWinnings: state.totalWinnings
    }));
}

function loadData() {
    const saved = localStorage.getItem('blackjack_state');
    if (saved) {
        const data = JSON.parse(saved);
        state.bankroll = data.bankroll || 1000;
        state.handsPlayed = data.handsPlayed || 0;
        state.handsWon = data.handsWon || 0;
        state.handsLost = data.handsLost || 0;
        state.handsPush = data.handsPush || 0;
        state.totalWinnings = data.totalWinnings || 0;
    }
}

// ===== INITIALIZATION =====
async function init() {
    loadData();
    updateStats();
    await shuffleShoe();

    // Event listeners
    document.getElementById('dealBtn').addEventListener('click', handleDeal);
    document.getElementById('deckToggle').addEventListener('change', handleDeckToggle);
    document.getElementById('newbieToggle').addEventListener('change', handleNewbieToggle);
    document.getElementById('speedControl').addEventListener('input', handleSpeedChange);
    document.getElementById('resetStatsBtn').addEventListener('click', handleResetStats);

    // Add/Remove player buttons
    document.querySelectorAll('.add-player-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            handleAddPlayer(parseInt(e.target.dataset.spot));
        });
    });

    document.querySelectorAll('.remove-player-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            handleRemovePlayer(parseInt(e.target.dataset.spot));
        });
    });

    // Action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            const spot = parseInt(e.target.dataset.spot);
            handleAction(action, spot);
        });
    });

    // Insurance button
    document.getElementById('insuranceBtn').addEventListener('click', () => {
        // Take insurance
        const humanSpot = state.spots[0];
        const insuranceBet = humanSpot.bet / 2;
        if (insuranceBet <= state.bankroll) {
            state.bankroll -= insuranceBet;
            humanSpot.insurance = insuranceBet;
            updateStats();
        }
        document.getElementById('insuranceBtn').classList.add('hidden');
    });
}

// Start the game
init();
