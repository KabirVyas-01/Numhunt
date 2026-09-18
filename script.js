/**
 * ============================================================================
 * Project: Number Guessing Game Web Edition
 * Creator: Kabir Vyas
 * Language: Vanilla JavaScript (ES6+)
 * Description: Complete state management, game engines, Web Audio synthesizers,
 *              and DOM controllers mirroring the C game specifications.
 * ============================================================================
 */

// ============================================================================
// GLOBAL AUDIO SYNTHESIZER (No external audio files required)
// ============================================================================
let audioEnabled = true;
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            audioCtx = new AudioContext();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playSound(type) {
    if (!audioEnabled) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'higher') {
            // High warning beep
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(650, now);
            osc.frequency.linearRampToValueAtTime(800, now + 0.12);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'lower') {
            // Low warning beep
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(450, now);
            osc.frequency.linearRampToValueAtTime(300, now + 0.12);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'extreme') {
            // Alert chime
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.setValueAtTime(440, now + 0.08);
            osc.frequency.setValueAtTime(880, now + 0.16);
            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
        } else if (type === 'win') {
            // Celebratory chord
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.connect(g);
                g.connect(ctx.destination);
                o.type = 'sine';
                o.frequency.setValueAtTime(freq, now + idx * 0.08);
                g.gain.setValueAtTime(0.2, now + idx * 0.08);
                g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
                o.start(now + idx * 0.08);
                o.stop(now + idx * 0.08 + 0.45);
            });
        } else if (type === 'gameover') {
            // Descending defeat note
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.4);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        }
    } catch (e) {
        console.warn('Audio playback error', e);
    }
}

function toggleAudio() {
    audioEnabled = !audioEnabled;
    const icon = document.getElementById('audio-icon');
    if (icon) {
        icon.textContent = audioEnabled ? '🔊' : '🔇';
    }
}

// ============================================================================
// CONFETTI CELEBRATION ENGINE
// ============================================================================
const confettiCanvas = document.getElementById('confetti-canvas');
let confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
let confettiParticles = [];
let confettiAnimationId = null;

function resizeConfetti() {
    if (confettiCanvas) {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
}
window.addEventListener('resize', resizeConfetti);
resizeConfetti();

function triggerConfetti() {
    if (!confettiCanvas || !confettiCtx) return;
    confettiParticles = [];
    const colors = ['#00e5ff', '#a855f7', '#f59e0b', '#10b981', '#ef4444', '#ffffff'];

    for (let i = 0; i < 120; i++) {
        confettiParticles.push({
            x: confettiCanvas.width / 2,
            y: confettiCanvas.height / 2,
            r: Math.random() * 6 + 4,
            d: Math.random() * 120,
            color: colors[Math.floor(Math.random() * colors.length)],
            tilt: Math.floor(Math.random() * 10) - 10,
            tiltAngleIncremental: (Math.random() * 0.07) + 0.05,
            tiltAngle: 0,
            vx: (Math.random() - 0.5) * 16,
            vy: (Math.random() - 0.7) * 18 - 4,
            gravity: 0.35,
            opacity: 1
        });
    }

    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
    animateConfetti();
}

function animateConfetti() {
    if (!confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    let activeParticles = 0;
    for (let i = 0; i < confettiParticles.length; i++) {
        const p = confettiParticles[i];
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.tiltAngle += p.tiltAngleIncremental;
        p.tilt = Math.sin(p.tiltAngle) * 15;
        p.opacity -= 0.006;

        if (p.opacity > 0 && p.y < confettiCanvas.height) {
            activeParticles++;
            confettiCtx.beginPath();
            confettiCtx.lineWidth = p.r;
            confettiCtx.strokeStyle = p.color;
            confettiCtx.globalAlpha = Math.max(0, p.opacity);
            confettiCtx.moveTo(p.x + p.tilt + p.r / 2, p.y);
            confettiCtx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
            confettiCtx.stroke();
            confettiCtx.globalAlpha = 1;
        }
    }

    if (activeParticles > 0) {
        confettiAnimationId = requestAnimationFrame(animateConfetti);
    } else {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}

// ============================================================================
// NAVIGATION & VIEW SWITCHER
// ============================================================================
function showScreen(screenId) {
    playSound('click');
    const screens = document.querySelectorAll('.view-screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
        screen.style.display = 'none';
    });

    const activeScreen = document.getElementById(screenId);
    if (activeScreen) {
        activeScreen.style.display = 'block';
        setTimeout(() => {
            activeScreen.classList.add('active');
        }, 20);
    }

    const backBtn = document.getElementById('header-back-btn');
    if (backBtn) {
        if (screenId === 'menu-screen') {
            backBtn.classList.add('hidden');
        } else {
            backBtn.classList.remove('hidden');
        }
    }
}

function openModal(modalId) {
    playSound('click');
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeModal(modalId) {
    playSound('click');
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// ============================================================================
// REUSABLE FEEDBACK ENGINE
// ============================================================================
/**
 * Evaluates a guess against a secret number.
 * Mirrors exact feedback logic from main.c.
 */
function evaluateGuess(guess, secret, level, extremeHintAlreadyUsed) {
    if (guess === secret) {
        return {
            status: 'correct',
            message: 'Correct! You found the secret number!',
            triggerExtremeHint: false,
            hintText: ''
        };
    }

    let triggerExtremeHint = false;
    let hintText = '';

    // Mode 1 Level 2 Extreme Hint
    if (level === 2 && !extremeHintAlreadyUsed) {
        const diff = Math.abs(guess - secret);
        if (diff > 500) {
            triggerExtremeHint = true;
            if (guess > secret + 500) {
                hintText = 'Too high! (Difference is greater than 500)';
            } else if (guess < secret - 500) {
                hintText = 'Too low! (Difference is greater than 500)';
            }
        }
    }

    if (guess < secret) {
        return {
            status: 'lower',
            message: 'You guessed it lower. Try a higher number!',
            triggerExtremeHint,
            hintText
        };
    } else {
        return {
            status: 'higher',
            message: 'You guessed it higher. Try a lower number!',
            triggerExtremeHint,
            hintText
        };
    }
}

// ============================================================================
// 1. SINGLE PLAYER (SOLO MODE)
// ============================================================================
let spState = {
    level: 1,
    maxRange: 100,
    maxAttempts: 10,
    currentAttempt: 1,
    secretNumber: 0,
    extremeHintUsed: false,
    history: [],
    gameOver: false
};

function startSinglePlayerSetup() {
    showScreen('single-player-screen');
    document.getElementById('sp-level-select').classList.remove('hidden');
    document.getElementById('sp-arena').classList.add('hidden');
}

function initSinglePlayerGame(level) {
    playSound('click');
    spState.level = level;
    spState.maxRange = (level === 1) ? 100 : 1000;
    spState.maxAttempts = (level === 1) ? 10 : 15;
    spState.currentAttempt = 1;
    spState.secretNumber = Math.floor(Math.random() * spState.maxRange) + 1;
    spState.extremeHintUsed = false;
    spState.history = [];
    spState.gameOver = false;

    // Update UI Elements
    document.getElementById('sp-level-select').classList.add('hidden');
    const arena = document.getElementById('sp-arena');
    arena.classList.remove('hidden');

    document.getElementById('sp-level-tag').textContent = `Level ${level}`;
    document.getElementById('sp-arena-title').textContent = `Guess the Secret Number`;
    document.getElementById('sp-range-display').textContent = `Range: 1 – ${spState.maxRange}`;

    updateSinglePlayerStats();

    // Reset feedback and hint boxes
    const fbBox = document.getElementById('sp-feedback-box');
    fbBox.className = 'feedback-banner neutral';
    document.getElementById('sp-feedback-icon').textContent = '🎯';
    document.getElementById('sp-feedback-msg').textContent = 'Enter your first guess below to begin!';

    const hintBox = document.getElementById('sp-extreme-hint-box');
    hintBox.classList.add('hidden');

    const errorEl = document.getElementById('sp-input-error');
    errorEl.textContent = '';

    renderHistoryChips('sp-history-chips', spState.history);

    const input = document.getElementById('sp-guess-input');
    input.value = '';
    input.min = 1;
    input.max = spState.maxRange;
    input.placeholder = `Enter guess (1 - ${spState.maxRange})...`;
    input.disabled = false;
    input.focus();
}

function updateSinglePlayerStats() {
    const attemptsLeft = spState.maxAttempts - spState.currentAttempt + 1;
    document.getElementById('sp-attempts-left').textContent = Math.max(0, attemptsLeft);
    document.getElementById('sp-current-attempt').textContent = `#${spState.currentAttempt}`;

    const progressPct = (attemptsLeft / spState.maxAttempts) * 100;
    document.getElementById('sp-progress-bar').style.width = `${progressPct}%`;
}

function handleSinglePlayerGuess(e) {
    e.preventDefault();
    if (spState.gameOver) return;

    const input = document.getElementById('sp-guess-input');
    const errorEl = document.getElementById('sp-input-error');
    const guessVal = parseInt(input.value.trim(), 10);

    if (isNaN(guessVal) || guessVal < 1 || guessVal > spState.maxRange) {
        errorEl.textContent = `Please enter a valid number between 1 and ${spState.maxRange}.`;
        playSound('lower');
        return;
    }
    errorEl.textContent = '';

    // Evaluate
    const result = evaluateGuess(guessVal, spState.secretNumber, spState.level, spState.extremeHintUsed);

    if (result.triggerExtremeHint) {
        spState.extremeHintUsed = true;
        const hintBox = document.getElementById('sp-extreme-hint-box');
        hintBox.classList.remove('hidden');
        document.getElementById('sp-extreme-hint-text').textContent = `EXTREME HINT: ${result.hintText}`;
        playSound('extreme');
    }

    // Add to history
    spState.history.push({
        guess: guessVal,
        status: result.status
    });
    renderHistoryChips('sp-history-chips', spState.history);

    const fbBox = document.getElementById('sp-feedback-box');
    const fbIcon = document.getElementById('sp-feedback-icon');
    const fbMsg = document.getElementById('sp-feedback-msg');

    fbBox.className = `feedback-banner ${result.status}`;
    fbMsg.textContent = result.message;

    if (result.status === 'correct') {
        fbIcon.textContent = '🎉';
        spState.gameOver = true;
        input.disabled = true;
        playSound('win');
        triggerConfetti();
        showResultModal({
            icon: '🏆',
            title: 'VICTORY!',
            subtitle: 'You cracked the secret number!',
            details: `Solved in <strong>${spState.currentAttempt}</strong> attempt(s). Secret was <strong>${spState.secretNumber}</strong>.`,
            actionText: 'Play Again',
            actionHandler: () => initSinglePlayerGame(spState.level)
        });
        return;
    } else if (result.status === 'higher') {
        fbIcon.textContent = '📈';
        playSound('higher');
    } else {
        fbIcon.textContent = '📉';
        playSound('lower');
    }

    if (spState.currentAttempt >= spState.maxAttempts) {
        // Out of attempts
        spState.gameOver = true;
        input.disabled = true;
        playSound('gameover');
        showResultModal({
            icon: '💀',
            title: 'GAME OVER',
            subtitle: 'You ran out of attempts!',
            details: `The secret number was <strong>${spState.secretNumber}</strong>. Better luck next time!`,
            actionText: 'Try Again',
            actionHandler: () => initSinglePlayerGame(spState.level)
        });
        return;
    }

    spState.currentAttempt++;
    updateSinglePlayerStats();
    input.value = '';
    input.focus();
}

function restartSinglePlayerRound() {
    initSinglePlayerGame(spState.level);
}

// ============================================================================
// 2. MULTIPLAYER TOURNAMENT
// ============================================================================
let mpState = {
    playerCount: 2,
    players: [],
    currentPlayerIndex: 0,
    currentRoundSecret: 0,
    currentAttempt: 1,
    maxAttempts: 10,
    maxRange: 100,
    history: [],
    gameOver: false
};

function startMultiplayerSetup() {
    showScreen('multiplayer-screen');
    document.getElementById('mp-setup').classList.remove('hidden');
    document.getElementById('mp-arena').classList.add('hidden');
    document.getElementById('mp-scoreboard').classList.add('hidden');
    setMultiplayerCount(2);
}

function setMultiplayerCount(count) {
    playSound('click');
    mpState.playerCount = count;

    // Update pill buttons
    const pills = document.querySelectorAll('.player-count-pills .pill-btn');
    pills.forEach((p, idx) => {
        if (idx + 2 === count) {
            p.classList.add('active');
        } else {
            p.classList.remove('active');
        }
    });

    // Populate dynamic name fields
    const container = document.getElementById('mp-name-inputs-container');
    container.innerHTML = '';
    for (let i = 1; i <= count; i++) {
        const div = document.createElement('div');
        div.className = 'player-input-item';
        div.innerHTML = `
            <input type="text" id="mp-name-${i}" class="text-input" placeholder="Player ${i} Name" value="Player ${i}">
        `;
        container.appendChild(div);
    }
}

function startMultiplayerTournament() {
    playSound('click');
    mpState.players = [];

    for (let i = 1; i <= mpState.playerCount; i++) {
        const input = document.getElementById(`mp-name-${i}`);
        const nameVal = input ? input.value.trim() : '';
        mpState.players.push({
            name: nameVal || `Player ${i}`,
            attemptsTaken: 0,
            hasWon: false
        });
    }

    mpState.currentPlayerIndex = 0;
    initMultiplayerRound();
}

function initMultiplayerRound() {
    document.getElementById('mp-setup').classList.add('hidden');
    document.getElementById('mp-scoreboard').classList.add('hidden');
    const arena = document.getElementById('mp-arena');
    arena.classList.remove('hidden');

    const currentPlayer = mpState.players[mpState.currentPlayerIndex];
    mpState.currentAttempt = 1;
    mpState.currentRoundSecret = Math.floor(Math.random() * mpState.maxRange) + 1;
    mpState.history = [];
    mpState.gameOver = false;

    // Update UI
    document.getElementById('mp-round-indicator').textContent = `Player ${mpState.currentPlayerIndex + 1} of ${mpState.playerCount}`;
    document.getElementById('mp-player-title').textContent = `${currentPlayer.name}'s Turn`;
    document.getElementById('mp-history-player-name').textContent = currentPlayer.name;

    updateMultiplayerStats();

    const fbBox = document.getElementById('mp-feedback-box');
    fbBox.className = 'feedback-banner neutral';
    document.getElementById('mp-feedback-icon').textContent = '👥';
    document.getElementById('mp-feedback-msg').textContent = `It's your turn, ${currentPlayer.name}! Guess the secret number.`;

    document.getElementById('mp-input-error').textContent = '';
    renderHistoryChips('mp-history-chips', mpState.history);

    const input = document.getElementById('mp-guess-input');
    input.value = '';
    input.disabled = false;
    input.focus();
}

function updateMultiplayerStats() {
    const attemptsLeft = mpState.maxAttempts - mpState.currentAttempt + 1;
    document.getElementById('mp-attempts-left').textContent = Math.max(0, attemptsLeft);
    document.getElementById('mp-current-attempt').textContent = `#${mpState.currentAttempt}`;

    const progressPct = (attemptsLeft / mpState.maxAttempts) * 100;
    document.getElementById('mp-progress-bar').style.width = `${progressPct}%`;
}

function handleMultiplayerGuess(e) {
    e.preventDefault();
    if (mpState.gameOver) return;

    const input = document.getElementById('mp-guess-input');
    const errorEl = document.getElementById('mp-input-error');
    const guessVal = parseInt(input.value.trim(), 10);
    const currentPlayer = mpState.players[mpState.currentPlayerIndex];

    if (isNaN(guessVal) || guessVal < 1 || guessVal > mpState.maxRange) {
        errorEl.textContent = `Please enter a valid number between 1 and ${mpState.maxRange}.`;
        playSound('lower');
        return;
    }
    errorEl.textContent = '';

    const result = evaluateGuess(guessVal, mpState.currentRoundSecret, 1, false);

    mpState.history.push({
        guess: guessVal,
        status: result.status
    });
    renderHistoryChips('mp-history-chips', mpState.history);

    const fbBox = document.getElementById('mp-feedback-box');
    const fbIcon = document.getElementById('mp-feedback-icon');
    const fbMsg = document.getElementById('mp-feedback-msg');

    fbBox.className = `feedback-banner ${result.status}`;
    fbMsg.textContent = result.message;

    if (result.status === 'correct') {
        fbIcon.textContent = '🎉';
        currentPlayer.hasWon = true;
        currentPlayer.attemptsTaken = mpState.currentAttempt;
        mpState.gameOver = true;
        input.disabled = true;
        playSound('win');

        finishPlayerRound(true);
        return;
    } else if (result.status === 'higher') {
        fbIcon.textContent = '📈';
        playSound('higher');
    } else {
        fbIcon.textContent = '📉';
        playSound('lower');
    }

    if (mpState.currentAttempt >= mpState.maxAttempts) {
        currentPlayer.hasWon = false;
        currentPlayer.attemptsTaken = mpState.maxAttempts;
        mpState.gameOver = true;
        input.disabled = true;
        playSound('gameover');

        finishPlayerRound(false);
        return;
    }

    mpState.currentAttempt++;
    updateMultiplayerStats();
    input.value = '';
    input.focus();
}

function finishPlayerRound(won) {
    const currentPlayer = mpState.players[mpState.currentPlayerIndex];
    const isLastPlayer = (mpState.currentPlayerIndex >= mpState.playerCount - 1);

    const title = won ? 'Round Complete - Solved!' : 'Round Over - Out of Attempts';
    const subtitle = won 
        ? `${currentPlayer.name} solved it in ${currentPlayer.attemptsTaken} attempt(s)!`
        : `${currentPlayer.name} could not guess the number (Secret was ${mpState.currentRoundSecret}).`;

    setTimeout(() => {
        if (!isLastPlayer) {
            const nextPlayer = mpState.players[mpState.currentPlayerIndex + 1];
            showTransitionModal({
                title: title,
                subtitle: `${subtitle} Pass the screen to ${nextPlayer.name}!`,
                btnText: `Ready, ${nextPlayer.name}! Let's Go →`,
                action: () => {
                    mpState.currentPlayerIndex++;
                    initMultiplayerRound();
                }
            });
        } else {
            showTransitionModal({
                title: 'Tournament Finished!',
                subtitle: `${subtitle} All players have completed their rounds!`,
                btnText: 'View Final Leaderboard 🏆',
                action: () => {
                    displayTournamentLeaderboard();
                }
            });
        }
    }, 600);
}

function displayTournamentLeaderboard() {
    document.getElementById('mp-arena').classList.add('hidden');
    const board = document.getElementById('mp-scoreboard');
    board.classList.remove('hidden');

    // Determine Winners
    let minAttempts = 999;
    let hasAnyWinner = false;

    mpState.players.forEach(p => {
        if (p.hasWon && p.attemptsTaken < minAttempts) {
            minAttempts = p.attemptsTaken;
            hasAnyWinner = true;
        }
    });

    const winners = mpState.players.filter(p => p.hasWon && p.attemptsTaken === minAttempts);

    const banner = document.getElementById('mp-champion-banner');
    if (!hasAnyWinner) {
        banner.innerHTML = `No Winner! (None of the players solved their number)`;
        playSound('gameover');
    } else {
        const winnerNames = winners.map(w => w.name).join(' & ');
        banner.innerHTML = `🏆 Champion: <strong>${winnerNames}</strong> (${minAttempts} attempt${minAttempts > 1 ? 's' : ''})!`;
        playSound('win');
        triggerConfetti();
    }

    // Populate Table
    const tbody = document.getElementById('mp-leaderboard-body');
    tbody.innerHTML = '';

    // Sort players: solved players first (by attempts ascending), then failed players
    const sortedPlayers = [...mpState.players].sort((a, b) => {
        if (a.hasWon && !b.hasWon) return -1;
        if (!a.hasWon && b.hasWon) return 1;
        return a.attemptsTaken - b.attemptsTaken;
    });

    sortedPlayers.forEach((p, idx) => {
        const isChamp = (p.hasWon && p.attemptsTaken === minAttempts);
        const tr = document.createElement('tr');
        if (isChamp) tr.className = 'winner-row';
        tr.innerHTML = `
            <td>${isChamp ? '🥇' : idx + 1}</td>
            <td><strong>${p.name}</strong> ${isChamp ? '👑' : ''}</td>
            <td>${p.attemptsTaken} attempt(s)</td>
            <td class="${p.hasWon ? 'status-solved' : 'status-failed'}">${p.hasWon ? 'SOLVED' : 'FAILED'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ============================================================================
// 3. HEAD-TO-HEAD DUEL (1V1 PVP)
// ============================================================================
let duelState = {
    p1Name: 'Player 1',
    p2Name: 'Player 2',
    p1Secret: 0, // Secret set by P1 for P2 to guess
    p2Secret: 0, // Secret set by P2 for P1 to guess
    currentTurnPlayer: 1, // 1 or 2
    round: 1,
    p1History: [],
    p2History: [],
    gameOver: false
};

function startDuelSetup() {
    showScreen('duel-screen');
    document.getElementById('duel-setup').classList.remove('hidden');
    document.getElementById('duel-arena').classList.add('hidden');
    document.getElementById('duel-setup-error').textContent = '';

    document.getElementById('duel-p1-secret').value = '';
    document.getElementById('duel-p2-secret').value = '';
}

function toggleSecretVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🔒';
    } else {
        input.type = 'password';
        btn.textContent = '👁️';
    }
}

function startDuelGame() {
    const p1NameVal = document.getElementById('duel-p1-name').value.trim() || 'Player 1';
    const p2NameVal = document.getElementById('duel-p2-name').value.trim() || 'Player 2';
    const p1SecVal = parseInt(document.getElementById('duel-p1-secret').value.trim(), 10);
    const p2SecVal = parseInt(document.getElementById('duel-p2-secret').value.trim(), 10);
    const errorEl = document.getElementById('duel-setup-error');

    if (isNaN(p1SecVal) || p1SecVal < 1 || p1SecVal > 100) {
        errorEl.textContent = `Please enter a valid secret number (1-100) for Player 1.`;
        playSound('lower');
        return;
    }
    if (isNaN(p2SecVal) || p2SecVal < 1 || p2SecVal > 100) {
        errorEl.textContent = `Please enter a valid secret number (1-100) for Player 2.`;
        playSound('lower');
        return;
    }

    errorEl.textContent = '';
    duelState.p1Name = p1NameVal;
    duelState.p2Name = p2NameVal;
    duelState.p1Secret = p1SecVal; // Number P2 must guess
    duelState.p2Secret = p2SecVal; // Number P1 must guess
    duelState.currentTurnPlayer = 1;
    duelState.round = 1;
    duelState.p1History = [];
    duelState.p2History = [];
    duelState.gameOver = false;

    document.getElementById('duel-setup').classList.add('hidden');
    const arena = document.getElementById('duel-arena');
    arena.classList.remove('hidden');

    document.getElementById('duel-p1-tag').textContent = duelState.p1Name;
    document.getElementById('duel-p2-tag').textContent = duelState.p2Name;
    document.getElementById('duel-p1-history-title').textContent = `${duelState.p1Name}'s Guesses`;
    document.getElementById('duel-p2-history-title').textContent = `${duelState.p2Name}'s Guesses`;

    renderDuelTurnUI();
}

function renderDuelTurnUI() {
    const isP1 = (duelState.currentTurnPlayer === 1);
    const activeName = isP1 ? duelState.p1Name : duelState.p2Name;
    const targetName = isP1 ? duelState.p2Name : duelState.p1Name;

    document.getElementById('duel-round-badge').textContent = `Round ${duelState.round}`;
    document.getElementById('duel-turn-title').textContent = `🎯 ${activeName}'s Turn`;
    document.getElementById('duel-target-desc').textContent = `Guessing ${targetName}'s Secret Number (1–100)`;

    const fbBox = document.getElementById('duel-feedback-box');
    fbBox.className = 'feedback-banner neutral';
    document.getElementById('duel-feedback-icon').textContent = '⚔️';
    document.getElementById('duel-feedback-msg').textContent = `${activeName}, enter your strike guess!`;

    document.getElementById('duel-input-error').textContent = '';

    renderHistoryChips('duel-p1-chips', duelState.p1History);
    renderHistoryChips('duel-p2-chips', duelState.p2History);

    const input = document.getElementById('duel-guess-input');
    input.value = '';
    input.disabled = false;
    input.focus();
}

function handleDuelGuess(e) {
    e.preventDefault();
    if (duelState.gameOver) return;

    const input = document.getElementById('duel-guess-input');
    const errorEl = document.getElementById('duel-input-error');
    const guessVal = parseInt(input.value.trim(), 10);

    if (isNaN(guessVal) || guessVal < 1 || guessVal > 100) {
        errorEl.textContent = 'Please enter a valid number between 1 and 100.';
        playSound('lower');
        return;
    }
    errorEl.textContent = '';

    const isP1 = (duelState.currentTurnPlayer === 1);
    const activeName = isP1 ? duelState.p1Name : duelState.p2Name;
    const opponentName = isP1 ? duelState.p2Name : duelState.p1Name;
    const targetSecret = isP1 ? duelState.p2Secret : duelState.p1Secret;

    const result = evaluateGuess(guessVal, targetSecret, 1, false);

    // Save to specific history
    if (isP1) {
        duelState.p1History.push({ guess: guessVal, status: result.status });
        renderHistoryChips('duel-p1-chips', duelState.p1History);
    } else {
        duelState.p2History.push({ guess: guessVal, status: result.status });
        renderHistoryChips('duel-p2-chips', duelState.p2History);
    }

    const fbBox = document.getElementById('duel-feedback-box');
    const fbIcon = document.getElementById('duel-feedback-icon');
    const fbMsg = document.getElementById('duel-feedback-msg');

    fbBox.className = `feedback-banner ${result.status}`;
    fbMsg.textContent = `${activeName}: ${result.message}`;

    if (result.status === 'correct') {
        fbIcon.textContent = '👑';
        duelState.gameOver = true;
        input.disabled = true;
        playSound('win');
        triggerConfetti();

        showResultModal({
            icon: '⚔️',
            title: `${activeName.toUpperCase()} WINS!`,
            subtitle: `Cracked the opponent's secret number in Round ${duelState.round}!`,
            details: `<strong>${activeName}</strong> successfully guessed <strong>${opponentName}</strong>'s secret (${targetSecret})!`,
            actionText: 'Rematch Duel',
            actionHandler: () => startDuelSetup()
        });
        return;
    } else if (result.status === 'higher') {
        fbIcon.textContent = '📈';
        playSound('higher');
    } else {
        fbIcon.textContent = '📉';
        playSound('lower');
    }

    // Switch turns
    if (isP1) {
        duelState.currentTurnPlayer = 2;
    } else {
        duelState.currentTurnPlayer = 1;
        duelState.round++;
    }

    setTimeout(() => {
        renderDuelTurnUI();
    }, 1100);
}

// ============================================================================
// UI HELPERS & MODAL HANDLERS
// ============================================================================
function renderHistoryChips(containerId, historyArr) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (historyArr.length === 0) {
        container.innerHTML = '<span class="no-history-text">No guesses yet</span>';
        return;
    }

    container.innerHTML = '';
    historyArr.forEach(item => {
        const span = document.createElement('span');
        span.className = `history-chip chip-${item.status}`;
        let arrow = '';
        if (item.status === 'higher') arrow = '↑ (High)';
        else if (item.status === 'lower') arrow = '↓ (Low)';
        else arrow = '✓ (Correct)';

        span.innerHTML = `<strong>${item.guess}</strong> ${arrow}`;
        container.appendChild(span);
    });
}

let activeResultAction = null;
function showResultModal({ icon, title, subtitle, details, actionText, actionHandler }) {
    document.getElementById('result-modal-icon').textContent = icon || '🏆';
    document.getElementById('result-modal-title').textContent = title;
    document.getElementById('result-modal-subtitle').textContent = subtitle;
    document.getElementById('result-modal-details').innerHTML = details;

    const actionBtn = document.getElementById('result-action-btn');
    actionBtn.textContent = actionText;
    activeResultAction = actionHandler;

    openModal('result-modal');
}

function handleResultModalAction() {
    closeModal('result-modal');
    if (typeof activeResultAction === 'function') {
        activeResultAction();
    }
}

let activeTransitionAction = null;
function showTransitionModal({ title, subtitle, btnText, action }) {
    document.getElementById('trans-modal-title').textContent = title;
    document.getElementById('trans-modal-subtitle').textContent = subtitle;
    document.getElementById('trans-modal-btn').textContent = btnText;
    activeTransitionAction = action;
    openModal('transition-modal');
}

function executeTransitionAction() {
    closeModal('transition-modal');
    if (typeof activeTransitionAction === 'function') {
        activeTransitionAction();
    }
}

// Keyboard shortcuts (ESC to close modals)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal('rules-modal');
    }
});
