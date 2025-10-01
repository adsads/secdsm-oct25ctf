// Spooky Mastermind Game Logic
class SpookyMastermind {
    constructor() {
        this.codeLength = 4;
        this.maxAttempts = 10;
        this.currentAttempt = 0;
        this.secretCode = [];
        this.currentGuess = [];
        this.guessHistory = [];
        this.gameWon = false;

        // Spooky emojis for the game
        this.emojis = ['🎃', '👻', '🦇', '🕷️', '💀', '🧟'];

        this.initializeGame();
        this.setupEventListeners();
    }

    initializeGame() {
        this.generateSecretCode();
        this.createEmojiButtons();
        this.createGuessSlots();
        this.updateGameInfo();
    }

    generateSecretCode() {
        // Hardcoded secret code for CTF verification
        this.secretCode = ['🎃', '👻', '🦇', '💀'];
        
    }

    createEmojiButtons() {
        const emojiButtonsContainer = document.getElementById('emoji-buttons');
        emojiButtonsContainer.innerHTML = '';

        this.emojis.forEach(emoji => {
            const button = document.createElement('button');
            button.className = 'emoji-btn';
            button.textContent = emoji;
            button.addEventListener('click', () => this.selectEmoji(emoji));
            emojiButtonsContainer.appendChild(button);
        });
    }

    createGuessSlots() {
        const guessSlotsContainer = document.getElementById('guess-slots');
        guessSlotsContainer.innerHTML = '';

        for (let i = 0; i < this.codeLength; i++) {
            const slot = document.createElement('div');
            slot.className = 'guess-slot';
            slot.dataset.index = i;
            guessSlotsContainer.appendChild(slot);
        }
    }

    selectEmoji(emoji) {
        if (this.currentGuess.length < this.codeLength && !this.gameWon) {
            this.currentGuess.push(emoji);
            this.updateGuessDisplay();
            this.updateSubmitButton();
        }
    }

    updateGuessDisplay() {
        const slots = document.querySelectorAll('.guess-slot');

        slots.forEach((slot, index) => {
            if (index < this.currentGuess.length) {
                slot.textContent = this.currentGuess[index];
                slot.classList.add('filled');
            } else {
                slot.textContent = '';
                slot.classList.remove('filled');
            }
        });
    }

    updateSubmitButton() {
        const submitBtn = document.getElementById('submit-guess');
        submitBtn.disabled = this.currentGuess.length !== this.codeLength || this.gameWon;
    }

    clearGuess() {
        this.currentGuess = [];
        this.updateGuessDisplay();
        this.updateSubmitButton();
    }

    submitGuess() {
        if (this.currentGuess.length !== this.codeLength || this.gameWon) {
            return;
        }

        this.currentAttempt++;
        const feedback = this.evaluateGuess(this.currentGuess);
        this.guessHistory.push({
            guess: [...this.currentGuess],
            feedback: feedback,
            attempt: this.currentAttempt
        });

        this.displayGuessHistory();
        this.updateGameInfo();

        if (feedback.correct === this.codeLength) {
            this.winGame();
        } else if (this.currentAttempt >= this.maxAttempts) {
            this.gameOver();
        }

        this.currentGuess = [];
        this.updateGuessDisplay();
        this.updateSubmitButton();
    }

    evaluateGuess(guess) {
        let correct = 0;
        let wrongPosition = 0;
        const secretCopy = [...this.secretCode];
        const guessCopy = [...guess];

        // Check for correct positions first
        for (let i = 0; i < this.codeLength; i++) {
            if (guessCopy[i] === secretCopy[i]) {
                correct++;
                guessCopy[i] = null;
                secretCopy[i] = null;
            }
        }

        // Check for wrong positions
        for (let i = 0; i < this.codeLength; i++) {
            if (guessCopy[i] !== null) {
                const foundIndex = secretCopy.indexOf(guessCopy[i]);
                if (foundIndex !== -1) {
                    wrongPosition++;
                    secretCopy[foundIndex] = null;
                }
            }
        }

        return {
            correct: correct,
            wrongPosition: wrongPosition,
            incorrect: this.codeLength - correct - wrongPosition
        };
    }

    displayGuessHistory() {
        const historyContainer = document.getElementById('history-container');
        historyContainer.innerHTML = '';

        this.guessHistory.forEach((entry, index) => {
            const guessRow = document.createElement('div');
            guessRow.className = 'guess-row';

            const guessEmojis = document.createElement('div');
            guessEmojis.className = 'guess-emojis';

            entry.guess.forEach(emoji => {
                const emojiDiv = document.createElement('div');
                emojiDiv.className = 'guess-emoji';
                emojiDiv.textContent = emoji;
                guessEmojis.appendChild(emojiDiv);
            });

            const feedback = document.createElement('div');
            feedback.className = 'feedback';

            // Add correct position pegs (teal)
            for (let i = 0; i < entry.feedback.correct; i++) {
                const peg = document.createElement('div');
                peg.className = 'feedback-peg correct';
                feedback.appendChild(peg);
            }

            // Add wrong position pegs (gold)
            for (let i = 0; i < entry.feedback.wrongPosition; i++) {
                const peg = document.createElement('div');
                peg.className = 'feedback-peg wrong-position';
                feedback.appendChild(peg);
            }

            // Add incorrect pegs (gray)
            for (let i = 0; i < entry.feedback.incorrect; i++) {
                const peg = document.createElement('div');
                peg.className = 'feedback-peg incorrect';
                feedback.appendChild(peg);
            }

            guessRow.appendChild(guessEmojis);
            guessRow.appendChild(feedback);
            historyContainer.appendChild(guessRow);
        });
    }

    updateGameInfo() {
        document.getElementById('attempt-count').textContent = this.currentAttempt;

        const gameStatus = document.getElementById('game-status');
        if (this.gameWon) {
            gameStatus.textContent = 'Congratulations! You cracked the code!';
            gameStatus.style.color = '#4ecdc4';
        } else if (this.currentAttempt >= this.maxAttempts) {
            gameStatus.textContent = 'Game Over! Better luck next time.';
            gameStatus.style.color = '#ff6b6b';
        } else {
            gameStatus.textContent = `${this.maxAttempts - this.currentAttempt} attempts remaining`;
            gameStatus.style.color = '#ffd700';
        }
    }

    winGame() {
        this.gameWon = true;
        const winMessage = document.getElementById('win-message');
        const ctfFlag = document.getElementById('ctf-flag');

        // Generate CTF flag as hash of the secret code
        const flagString = this.secretCode.join('');
        const hash = this.generateHash(flagString);

        ctfFlag.textContent = `SecDSM{spooky_mastermind_${hash}}`;
        winMessage.style.display = 'block';

        // Scroll to win message
        winMessage.scrollIntoView({ behavior: 'smooth' });
    }

    gameOver() {
        const gameStatus = document.getElementById('game-status');
        gameStatus.textContent = `Game Over! The secret code was: ${this.secretCode.join(' ')}`;
    }

    generateHash(str) {
        // Simple hash function for generating CTF flag
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16).toUpperCase();
    }

    setupEventListeners() {
        document.getElementById('submit-guess').addEventListener('click', () => this.submitGuess());
        document.getElementById('clear-guess').addEventListener('click', () => this.clearGuess());

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !document.getElementById('submit-guess').disabled) {
                this.submitGuess();
            }
            if (e.key === 'Escape') {
                this.clearGuess();
            }
        });
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SpookyMastermind();
});
