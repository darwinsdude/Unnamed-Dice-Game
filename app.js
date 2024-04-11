import { CustomDice } from './CustomDice.js';

let diceRolled = false; // Flag to track if the "Roll Dice" has been clicke
let currentScore = 0;
let winningScore = 10000; // Default winning score, can be adjusted by the player
const dice = [];

document.addEventListener('DOMContentLoaded', () => {
    const targetScoreInput = document.getElementById('targetScoreInput');
    const setTargetScoreBtn = document.getElementById('setTargetScoreBtn');
    const targetScoreDisplay = document.getElementById('targetScoreDisplay');
    const currentScoreSpan = document.getElementById('score');
    const diceImages = document.querySelectorAll('.diceImage');
    const bankPointsButton = document.getElementById('bankPointsButton');

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
    for (let i = 0; i < 6; i++) {
        dice.push(new CustomDice(6, {}, images));
    }

    setTargetScoreBtn.addEventListener('click', () => {
        winningScore = parseInt(targetScoreInput.value, 10);
        targetScoreDisplay.textContent = winningScore;
    });

    document.getElementById('rollButton').addEventListener('click', () => {
        diceRolled = true;
        dice.forEach(die => {
            die.roll(); // Roll each die
        });

        // Update dice images
        diceImages.forEach((img, index) => {
            img.src = dice[index].getCurrentSideImage();
            img.classList.remove('selected'); // Reset selection visuals
        });

        resetSelections(); // Reset selections in the game state
        updatePossiblePointsAndIndicators(); // Update UI for possible points
    });

    diceImages.forEach((img, index) => {
        img.addEventListener('click', () => {
            if (!diceRolled) return;
            dice[index].toggleSelected(); // Toggle the selected state of the dice
            img.classList.toggle('selected'); // Update the visual representation of the dice to indicate selection
            updatePossiblePointsAndIndicators(); // Recalculate and display possible points based on the new selection
        });
    });

    bankPointsButton.addEventListener('click', () => {
        const scoreForSelection = parseInt(document.getElementById('possiblePoints').textContent, 10);
        currentScore += scoreForSelection;
        updateScoreDisplay();
        resetSelections(); // Reset selections and prepare for next action
        document.getElementById('possiblePoints').textContent = '0';
        bankPointsButton.style.display = 'none'; // Hide the bank points button until next valid selection
    });

    function updatePossiblePointsAndIndicators() {
        const selectedDiceValues = dice.filter(die => die.selected).map(die => die.getValue());
        const scoreForSelection = calculateScore(selectedDiceValues);
        document.getElementById('possiblePoints').textContent = scoreForSelection;
        bankPointsButton.style.display = scoreForSelection >= 750 ? 'block' : 'none';
    }

    function updateScoreDisplay() {
        currentScoreSpan.textContent = currentScore;
    }

    function resetSelections() {
        dice.forEach(die => {
            if (die.selected) die.toggleSelected();
        });
        diceImages.forEach(img => img.classList.remove('selected'));
    }

    // The calculateScore function is now properly nested inside the DOMContentLoaded listener.
    function calculateScore(diceValues) {
        let score = 0;
        const counts = diceValues.reduce((acc, value) => {
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
    
        // Check for five of a kind first
        Object.keys(counts).forEach(num => {
            if (counts[num] === 5) {
                score += 5000; // Flat 5000 points for five of a kind
                counts[num] = 0; // Remove these from consideration for further scoring
            }
        });
    
        // Check for four of a kind
        Object.keys(counts).forEach(num => {
            if (counts[num] === 4) {
                score += (num === '1') ? 2000 : (num === '5') ? 1000 : parseInt(num) * 200; // Four of a kind
                counts[num] = 0;
            }
        });
    
        // Evaluate for straights (prioritize straights over three-of-a-kinds due to their higher rarity)
        const sortedValues = [...new Set(diceValues)].sort((a, b) => a - b);
        if (sortedValues.length === 6) {
            score += 2000; // Long straight
            return score; // End evaluation if a long straight is present
        } else if (sortedValues.length === 5 && sortedValues[4] - sortedValues[0] === 4) {
            score += 1500; // Small straight
            // No return here to allow scoring of additional dice
        }
    
        // Check for a full house
        const pairCounts = Object.values(counts).filter(count => count === 2);
        if (pairCounts.length === 3) {
            return score + 1500; // Add score for a full house and end scoring
        }
    
        // Score multiple three-of-a-kinds
        Object.keys(counts).forEach(num => {
            while (counts[num] >= 3) {
                score += (num === '1') ? 1000 : (num === '5') ? 500 : parseInt(num) * 100;
                counts[num] -= 3; // Reduce the count by three after scoring
            }
        });
    
        // Score any remaining individual 1s and 5s
        if (counts['1'] > 0) {
            score += counts['1'] * 100; // Each remaining 1 is worth 100 points
            counts['1'] = 0;
        }
        if (counts['5'] > 0) {
            score += counts['5'] * 50; // Each remaining 5 is worth 50 points
            counts['5'] = 0;
        }
    
        return score;
    }

    
});