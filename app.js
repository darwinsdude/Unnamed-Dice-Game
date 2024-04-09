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

        diceImages.forEach((img, index) => {
            img.addEventListener('click', () => {
                dice[index].toggleSelected(); // Toggle the selected state of the dice
                img.classList.toggle('selected'); // Visually indicate selection
            });
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
        if (isLargeStraight) {
            return 2000; // Awards 2000 points for a large straight
        }
    
        // Detect small straight
        const isSmallStraight = sortedValues.slice(0, 5).every((val, i, arr) => i === 0 || val === arr[i - 1] + 1) || sortedValues.slice(1).every((val, i, arr) => i === 0 || val === arr[i - 1] + 1);
        if (isSmallStraight) {
            score += 1500; // Awards 1500 points for a small straight
        }
    
        // Detect full house (specifically three pairs of different numbers)
        const pairsCount = Object.values(counts).filter(count => count === 2).length;
        const isFullHouse = pairsCount === 3;
        if (isFullHouse) {
            return score += 1500; // Awards 1500 points for a full house
        }
    
        // Proceed with scoring for individual 1s and 5s, and other combinations
        // if no straight or full house is detected
        if (!isLargeStraight && !isSmallStraight && !isFullHouse) {
            Object.entries(counts).forEach(([number, count]) => {
                const num = parseInt(number, 10);
                // Apply scoring for combinations and individual 1s and 5s not in a full house
                if (count === 1 || (count === 2 && !isFullHouse)) {
                    score += (num === 1) ? count * 100 : (num === 5) ? count * 50 : 0;
                } else if (count >= 3) {
                    // Handle three, four, or five of a kind not part of a full house
                    if (num === 1) score += count === 3 ? 1000 : 0; // Example for three 1s
                    if (num !== 1) score += num * 100 * (count - 2); // Simplified scoring for other numbers
                }
            });
        }
    
        return score;
    }
    
    

    function updateScoreDisplay() {
        currentScoreSpan.textContent = currentScore;
    }
});

