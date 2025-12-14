// Rule definitions with transformation functions and descriptions
const RULES = {
    easy: [
        {
            name: "reverse",
            description: "Reverse the word",
            transform: (word) => word.split('').reverse().join(''),
            keywords: ["reverse", "backwards", "flip", "mirror"]
        },
        {
            name: "uppercase",
            description: "Convert to uppercase",
            transform: (word) => word.toUpperCase(),
            keywords: ["uppercase", "upper case", "capital", "capitalize all", "all caps", "caps"]
        },
        {
            name: "lowercase",
            description: "Convert to lowercase",
            transform: (word) => word.toLowerCase(),
            keywords: ["lowercase", "lower case", "small", "minuscule"]
        },
        {
            name: "double",
            description: "Repeat each letter twice",
            transform: (word) => word.split('').map(c => c + c).join(''),
            keywords: ["double", "repeat", "duplicate", "twice"]
        },
        {
            name: "remove_vowels",
            description: "Remove all vowels",
            transform: (word) => word.replace(/[aeiouAEIOU]/g, ''),
            keywords: ["remove vowel", "delete vowel", "no vowel", "vowel"]
        }
    ],
    medium: [
        {
            name: "rot13",
            description: "ROT13 cipher (shift by 13)",
            transform: (word) => word.replace(/[a-zA-Z]/g, c =>
                String.fromCharCode(
                    c.charCodeAt(0) + (c.toLowerCase() < 'n' ? 13 : -13)
                )
            ),
            keywords: ["rot13", "rot 13", "shift 13", "caesar 13"]
        },
        {
            name: "caesar_1",
            description: "Caesar cipher: shift each letter by 1",
            transform: (word) => word.replace(/[a-zA-Z]/g, c => {
                const code = c.charCodeAt(0);
                if (c >= 'a' && c <= 'z') return String.fromCharCode((code - 97 + 1) % 26 + 97);
                if (c >= 'A' && c <= 'Z') return String.fromCharCode((code - 65 + 1) % 26 + 65);
                return c;
            }),
            keywords: ["shift 1", "caesar 1", "plus 1", "+1", "next letter"]
        },
        {
            name: "vowel_cycle",
            description: "Replace each vowel with the next vowel (a→e, e→i, i→o, o→u, u→a)",
            transform: (word) => {
                const vowelMap = {a:'e', e:'i', i:'o', o:'u', u:'a', A:'E', E:'I', I:'O', O:'U', U:'A'};
                return word.replace(/[aeiouAEIOU]/g, c => vowelMap[c]);
            },
            keywords: ["vowel", "next vowel", "cycle vowel", "shift vowel"]
        },
        {
            name: "capitalize_vowels",
            description: "Capitalize only the vowels",
            transform: (word) => word.replace(/[aeiou]/g, c => c.toUpperCase()),
            keywords: ["capitalize vowel", "upper vowel", "vowel upper"]
        },
        {
            name: "first_last",
            description: "Swap first and last characters",
            transform: (word) => {
                if (word.length <= 1) return word;
                return word[word.length-1] + word.slice(1, -1) + word[0];
            },
            keywords: ["swap first last", "first last", "swap ends", "switch ends"]
        },
        {
            name: "every_other",
            description: "Keep only every other letter (starting with first)",
            transform: (word) => word.split('').filter((_, i) => i % 2 === 0).join(''),
            keywords: ["every other", "alternate", "skip", "every second"]
        }
    ],
    hard: [
        {
            name: "pig_latin",
            description: "Pig Latin: move first letter to end and add 'ay'",
            transform: (word) => {
                if (word.length === 0) return word;
                return word.slice(1) + word[0] + 'ay';
            },
            keywords: ["pig latin", "piglatin", "latin"]
        },
        {
            name: "consonant_double",
            description: "Double only consonants",
            transform: (word) => word.replace(/[^aeiouAEIOU\s]/g, c => c + c),
            keywords: ["double consonant", "repeat consonant", "consonant"]
        },
        {
            name: "alternating_case",
            description: "Alternate between lower and uppercase",
            transform: (word) => word.split('').map((c, i) =>
                i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()
            ).join(''),
            keywords: ["alternate case", "alternating", "zigzag case", "mixed case"]
        },
        {
            name: "reverse_words",
            description: "Reverse each word but keep word order",
            transform: (word) => word.split(' ').map(w => w.split('').reverse().join('')).join(' '),
            keywords: ["reverse word", "reverse each", "backwards word"]
        },
        {
            name: "atbash",
            description: "Atbash cipher: a↔z, b↔y, c↔x, etc.",
            transform: (word) => word.replace(/[a-zA-Z]/g, c => {
                if (c >= 'a' && c <= 'z') return String.fromCharCode(122 - (c.charCodeAt(0) - 97));
                if (c >= 'A' && c <= 'Z') return String.fromCharCode(90 - (c.charCodeAt(0) - 65));
                return c;
            }),
            keywords: ["atbash", "reverse alphabet", "mirror alphabet"]
        },
        {
            name: "vowel_consonant_swap",
            description: "Swap vowels with consonants in pairs",
            transform: (word) => {
                let result = '';
                let vowels = word.match(/[aeiouAEIOU]/g) || [];
                let consonants = word.match(/[^aeiouAEIOU\s]/g) || [];
                let vi = 0, ci = 0;
                for (let c of word) {
                    if (/[aeiouAEIOU]/.test(c)) {
                        result += consonants[ci++] || c;
                    } else if (/[^aeiouAEIOU\s]/.test(c)) {
                        result += vowels[vi++] || c;
                    } else {
                        result += c;
                    }
                }
                return result;
            },
            keywords: ["swap vowel consonant", "vowel consonant", "interchange"]
        }
    ],
    expert: [
        {
            name: "fibonacci_repeat",
            description: "Repeat each letter according to Fibonacci sequence (1,1,2,3,5...)",
            transform: (word) => {
                const fib = [1, 1, 2, 3, 5, 8, 13];
                return word.split('').map((c, i) => c.repeat(fib[i % fib.length])).join('');
            },
            keywords: ["fibonacci", "fib sequence", "1 1 2 3 5"]
        },
        {
            name: "prime_positions",
            description: "Keep only letters at prime positions (2,3,5,7,11...)",
            transform: (word) => {
                const isPrime = n => {
                    if (n < 2) return false;
                    for (let i = 2; i <= Math.sqrt(n); i++) {
                        if (n % i === 0) return false;
                    }
                    return true;
                };
                return word.split('').filter((_, i) => isPrime(i + 1)).join('');
            },
            keywords: ["prime", "prime position", "2 3 5 7"]
        },
        {
            name: "spiral_interleave",
            description: "Interleave characters from outside to inside",
            transform: (word) => {
                let result = '';
                let left = 0, right = word.length - 1;
                while (left <= right) {
                    result += word[left++];
                    if (left <= right) result += word[right--];
                }
                return result;
            },
            keywords: ["spiral", "interleave", "outside in", "weave"]
        },
        {
            name: "morse_dots",
            description: "Replace each letter with number of dots in Morse code",
            transform: (word) => {
                const morseDots = {
                    a:1, b:1, c:1, d:1, e:1, f:2, g:0, h:4, i:2, j:1,
                    k:0, l:1, m:0, n:0, o:0, p:2, q:1, r:1, s:3, t:0,
                    u:2, v:3, w:1, x:2, y:0, z:2
                };
                return word.toLowerCase().replace(/[a-z]/g, c => morseDots[c] || '?');
            },
            keywords: ["morse", "dots", "morse code"]
        },
        {
            name: "checksum_mod",
            description: "Append position sum modulo 10 to each letter",
            transform: (word) => word.split('').map((c, i) => c + ((i + 1) % 10)).join(''),
            keywords: ["checksum", "position", "modulo", "index"]
        }
    ]
};

// Word pools for generating examples
const WORD_POOLS = {
    short: ["cat", "dog", "hat", "sun", "red", "big", "run", "fun", "win", "top"],
    medium: ["apple", "house", "water", "music", "paper", "happy", "bright", "friend", "circle", "planet"],
    long: ["computer", "elephant", "wonderful", "adventure", "chocolate", "beautiful", "telephone", "butterfly", "mountain", "sunshine"]
};

class ReverseWordleGame {
    constructor() {
        this.currentRule = null;
        this.difficulty = 'medium';
        this.attempts = 0;
        this.maxAttempts = 6;
        this.examples = [];
        this.gameOver = false;
        this.guessHistory = [];

        this.initializeElements();
        this.attachEventListeners();
        this.startNewGame();
    }

    initializeElements() {
        this.difficultySelect = document.getElementById('difficulty');
        this.attemptsDisplay = document.getElementById('attempts');
        this.examplesContainer = document.getElementById('examples');
        this.newExampleBtn = document.getElementById('newExampleBtn');
        this.guessInput = document.getElementById('guessInput');
        this.submitBtn = document.getElementById('submitBtn');
        this.feedbackDiv = document.getElementById('feedback');
        this.historyDiv = document.getElementById('history');
        this.gameOverDiv = document.getElementById('gameOver');
        this.resultTitle = document.getElementById('resultTitle');
        this.actualRule = document.getElementById('actualRule');
        this.ruleExplanation = document.getElementById('ruleExplanation');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.helpBtn = document.getElementById('helpBtn');
        this.helpModal = document.getElementById('helpModal');
    }

    attachEventListeners() {
        this.submitBtn.addEventListener('click', () => this.submitGuess());
        this.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.submitGuess();
        });
        this.newExampleBtn.addEventListener('click', () => this.showNewExample());
        this.playAgainBtn.addEventListener('click', () => this.startNewGame());
        this.difficultySelect.addEventListener('change', () => {
            this.difficulty = this.difficultySelect.value;
            this.startNewGame();
        });

        this.helpBtn.addEventListener('click', () => {
            this.helpModal.classList.remove('hidden');
        });

        const closeBtn = this.helpModal.querySelector('.close');
        closeBtn.addEventListener('click', () => {
            this.helpModal.classList.add('hidden');
        });

        window.addEventListener('click', (e) => {
            if (e.target === this.helpModal) {
                this.helpModal.classList.add('hidden');
            }
        });
    }

    startNewGame() {
        this.attempts = 0;
        this.gameOver = false;
        this.examples = [];
        this.guessHistory = [];

        const rules = RULES[this.difficulty];
        this.currentRule = rules[Math.floor(Math.random() * rules.length)];

        this.gameOverDiv.classList.add('hidden');
        this.feedbackDiv.innerHTML = '';
        this.historyDiv.innerHTML = '';
        this.examplesContainer.innerHTML = '';
        this.guessInput.value = '';
        this.guessInput.disabled = false;
        this.submitBtn.disabled = false;
        this.newExampleBtn.disabled = false;

        this.generateInitialExamples();
        this.updateAttemptsDisplay();
    }

    generateInitialExamples() {
        const numExamples = this.difficulty === 'easy' ? 3 : this.difficulty === 'medium' ? 2 : 1;
        for (let i = 0; i < numExamples; i++) {
            this.showNewExample();
        }
    }

    getRandomWord() {
        const pools = Object.values(WORD_POOLS).flat();
        let attempts = 0;
        let word;

        do {
            word = pools[Math.floor(Math.random() * pools.length)];
            attempts++;
        } while (this.examples.some(ex => ex.input === word) && attempts < 20);

        return word;
    }

    showNewExample() {
        if (this.gameOver) return;

        const input = this.getRandomWord();
        const output = this.currentRule.transform(input);

        this.examples.push({ input, output });
        this.renderExamples();
    }

    renderExamples() {
        this.examplesContainer.innerHTML = this.examples.map((ex, i) => `
            <div class="example-item" style="animation-delay: ${i * 0.1}s">
                <div class="example-label">Example ${i + 1}</div>
                <div class="example-content">
                    <span class="example-input">${ex.input}</span>
                    <span class="arrow">→</span>
                    <span class="example-output">${ex.output}</span>
                </div>
            </div>
        `).join('');
    }

    submitGuess() {
        if (this.gameOver || !this.guessInput.value.trim()) return;

        const guess = this.guessInput.value.trim().toLowerCase();
        this.attempts++;
        this.updateAttemptsDisplay();

        const isCorrect = this.checkGuess(guess);

        this.guessHistory.push({ guess, correct: isCorrect });
        this.renderHistory();

        if (isCorrect) {
            this.endGame(true);
        } else if (this.attempts >= this.maxAttempts) {
            this.endGame(false);
        } else {
            this.showFeedback(false);
        }

        this.guessInput.value = '';
    }

    checkGuess(guess) {
        return this.currentRule.keywords.some(keyword =>
            guess.includes(keyword) || keyword.includes(guess)
        );
    }

    showFeedback(isCorrect) {
        const remaining = this.maxAttempts - this.attempts;
        if (!isCorrect) {
            this.feedbackDiv.innerHTML = `
                <div class="feedback-incorrect">
                    ❌ Not quite right. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.
                    ${remaining > 0 ? 'Try analyzing the pattern more carefully!' : ''}
                </div>
            `;
        }
    }

    renderHistory() {
        this.historyDiv.innerHTML = '<h3>Previous Guesses</h3>' +
            this.guessHistory.map((h, i) => `
                <div class="history-item ${h.correct ? 'correct' : 'incorrect'}">
                    <span class="history-number">${i + 1}.</span>
                    <span class="history-guess">${h.guess}</span>
                    <span class="history-result">${h.correct ? '✓' : '✗'}</span>
                </div>
            `).join('');
    }

    endGame(won) {
        this.gameOver = true;
        this.guessInput.disabled = true;
        this.submitBtn.disabled = true;
        this.newExampleBtn.disabled = true;

        this.resultTitle.textContent = won ? '🎉 Correct!' : '😔 Game Over';
        this.actualRule.textContent = this.currentRule.description;

        const exampleWord = "hello";
        const transformed = this.currentRule.transform(exampleWord);
        this.ruleExplanation.innerHTML = `
            <div class="example-explanation">
                <p>Example: "${exampleWord}" → "${transformed}"</p>
                <p class="attempts-info">You used ${this.attempts} of ${this.maxAttempts} attempts.</p>
            </div>
        `;

        this.gameOverDiv.classList.remove('hidden');

        if (won) {
            this.feedbackDiv.innerHTML = `
                <div class="feedback-correct">
                    ✨ Excellent! You discovered the rule!
                </div>
            `;
        } else {
            this.feedbackDiv.innerHTML = `
                <div class="feedback-incorrect">
                    The rule was: ${this.currentRule.description}
                </div>
            `;
        }
    }

    updateAttemptsDisplay() {
        this.attemptsDisplay.textContent = `${this.attempts}/${this.maxAttempts}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ReverseWordleGame();
});
