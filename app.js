import { CustomDice } from './CustomDice.js';

let currentScore = 0;
let winningScore = 10000; // Default winning score, can be adjusted by the player

document.addEventListener('DOMContentLoaded', () => {
    const targetScoreInput = document.getElementById('targetScoreInput');
    const setTargetScoreBtn = document.getElementById('setTargetScoreBtn');
    const targetScoreDisplay = document.getElementById('targetScoreDisplay');
    const currentScoreSpan = document.getElementById('score');
    const diceImages = document.querySelectorAll('.diceImage');

    // Define the images for each dice side
    const images = {
        1: 'dice_images/1.png',
        2: 'dice_images/2.png',
        3: 'dice_images/3.png',
        4: 'dice_images/4.png',
        5: 'dice_images/5.png',
        6: 'dice_images/6.png'
    };

    // Initialize an array of 6 CustomDice objects
    const dice = [];
    for (let i = 0; i < 6; i++) {
        dice.push(new CustomDice(6, {}, images));
    }

    setTargetScoreBtn.addEventListener('click', () => {
        winningScore = parseInt(targetScoreInput.value, 10);
        targetScoreDisplay.textContent = winningScore;
    });

    document.getElementById('rollButton').addEventListener('click', () => {
        let rollValues = dice.map(die => {
            die.roll();
            return die.getValue();
        });

        // Update dice images
        diceImages.forEach((img, index) => {
            img.src = dice[index].getCurrentSideImage();
        });

        // Calculate the score for the current roll
        let result = calculateScore(rollValues);

        if (result === "AUTOMATIC_WIN") {
            alert("Automatic win with six of a kind!");
            currentScore = winningScore;
        } else {
            currentScore += typeof result === 'number' ? result : 0;
        }

        updateScoreDisplay();

        // Check for win
        if (currentScore >= winningScore) {
            alert("Game Over, You Win!");
            // Here, you would implement logic to reset the game or navigate to a win screen.
        }
    });

    function calculateScore(diceValues) {
        let score = 0;
        const counts = diceValues.reduce((acc, value) => {
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});

        // Check for six of a kind (automatic win)
        if (Object.values(counts).includes(6)) {
            return "AUTOMATIC_WIN";
        }

        // Detect large straight
        const sortedValues = [...diceValues].sort((a, b) => a - b);
        const isLargeStraight = sortedValues.every((val, i, arr) => i === 0 || val === arr[i - 1] + 1);
        if (isLargeStraight) return 2000; // Awards 2000 points for a large straight

        // Detect small straight
        const isSmallStraight = sortedValues.slice(0, 5).every((val, i, arr) => i === 0 || val === arr[i - 1] + 1) || sortedValues.slice(1).every((val, i, arr) => i === 0 || val === arr[i - 1] + 1);
        if (isSmallStraight) score += 1500; // Awards 1500 points for a small straight

        // Detect full house (three pairs)
        const pairs = Object.values(counts).filter(count => count === 2);
        if (pairs.length === 3) score += 1500; // Awards 1500 points for a full house

        // Scoring for individual 1s and 5s, three, four, or five of a kind
        Object.keys(counts).forEach(number => {
            const num = parseInt(number, 10);
            const count = counts[number];

            // Individual 1s and 5s (not part of a larger set)
            if (num === 1 && count < 3) score += count * 100;
            if (num === 5 && count < 3) score += count * 50;

            // Three of a kind
            if (count === 3) {
                score += num === 1 ? 1000 : num * 100;
            }
            // Four of a kind
            else if (count === 4) {
                switch(num) {
                    case 1: score += 2000; break; // Adjust for your specific four-of-a-kind rules
                    case 2: score -= 1000; break;
                    case 3: score += 600; break;
                    case 4: score += 800; break;
                    case 5: score += 1000; break;
                    case 6: score += 1200; break;
                    default: break;
                }
            }
            // Five of a kind
            else if (count === 5) {
                score += 5000; // Awards 5000 points for five of a kind
            }
        });

        return score;
    }

    function updateScoreDisplay() {
        currentScoreSpan.textContent = currentScore;
    }
});

