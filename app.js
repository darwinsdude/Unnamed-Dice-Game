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

    document.getElementById('setAsideButton').addEventListener('click', () => {
        dice.forEach((die, index) => {
            if (die.selected) {
                die.toggleSetAside();  // This will now correctly toggle the set aside state
                if (die.setAside) { // Check if the die is now set aside
                    diceImages[index].classList.add('set-aside');
                    diceImages[index].classList.remove('selected');
                    die.selected = false; // Ensure the die is no longer marked as selected
                }
            }
        });
        updatePossiblePointsAndIndicators();  // Recalculate scores with set aside dice excluded
    }); // This closing parenthesis ends the addEventListener call
    

    document.getElementById('rollButton').addEventListener('click', () => {
        diceRolled = true;
    dice.forEach(die => {
        if (!die.setAside) {
            die.roll();
        }
    });


        // Update dice images
        diceImages.forEach((img, index) => {
            img.src = dice[index].getCurrentSideImage();
            if (!dice[index].setAside) {
                img.classList.remove('selected');
            }
        });

        resetSelections(); // Reset selections in the game state
        updatePossiblePointsAndIndicators(); // Update UI for possible points
    });

    diceImages.forEach((img, index) => {
        img.addEventListener('click', () => {
            if (!diceRolled || dice[index].setAside) return;
            dice[index].toggleSelected(); // Toggle the selected state of the dice
            img.classList.toggle('selected'); // Update the visual representation of the dice to indicate selection
            updatePossiblePointsAndIndicators(); // Recalculate and display possible points based on the new selection
        });
    });

    function canSelectDice(diceIndex) {
        // Simulate selecting this dice and check if it forms a valid score
        let testDiceValues = dice.map(die => die.getValue());
        // Temporarily toggle the selected state to simulate what would happen if it were selected
        dice[diceIndex].selected = !dice[diceIndex].selected;
        let score = calculateScore(testDiceValues.filter((_, index) => dice[index].selected));
        dice[diceIndex].selected = !dice[diceIndex].selected;  // Revert the temporary toggle
        return score > 0;
    }

    bankPointsButton.addEventListener('click', () => {
        const scoreForSelection = parseInt(document.getElementById('possiblePoints').textContent, 10);
        currentScore += scoreForSelection;
        updateScoreDisplay();
        resetSelections(); // Reset selections and prepare for next action
        document.getElementById('possiblePoints').textContent = '0';
        bankPointsButton.style.display = 'none'; // Hide the bank points button until next valid selection
    });

    function updatePossiblePointsAndIndicators() {
        const selectedDiceValues = dice.filter(die => die.selected && !die.setAside).map(die => die.getValue());
        const scoreForSelection = calculateScore(selectedDiceValues);
        document.getElementById('possiblePoints').textContent = scoreForSelection;
    
        // Identify and display scoring hands dynamically
        const scoringDescriptions = getScoringDescriptions(selectedDiceValues);
        document.getElementById('selectedCombination').textContent = scoringDescriptions.join(", ");
    
        // Determine the validity of the selection for setting aside
        const isValidSelection = scoringDescriptions.length > 0;
        const shouldDisplaySetAside = isValidSelection && dice.some(die => die.selected && !die.setAside) && scoreForSelection > 0;
        document.getElementById('setAsideButton').style.display = shouldDisplaySetAside ? 'block' : 'none';
    
        bankPointsButton.style.display = scoreForSelection >= 750 ? 'block' : 'none';
    }
    
    function getScoringDescriptions(diceValues) {
        const counts = diceValues.reduce((acc, value) => {
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
        const descriptions = [];
    
        // Check for straights and full house first as they are exclusive
        const uniqueValues = [...new Set(diceValues)].sort((a, b) => a - b);
        const isLongStraight = uniqueValues.length === 6;
        const isShortStraight = uniqueValues.length === 5 && uniqueValues[4] - uniqueValues[0] === 4;
        const fullHouseCheck = checkForFullHouse(counts);
    
        if (isLongStraight) {
            descriptions.push('Long Straight (2000 points)');
            return descriptions; // Return immediately to prevent adding other scores
        } else if (isShortStraight) {
            descriptions.push('Short Straight (1500 points)');
            return descriptions; // Return immediately to prevent adding other scores
        } else if (fullHouseCheck) {
            descriptions.push('Full House (1500 points)');
            return descriptions; // Return immediately to prevent adding other scores
        }
    
        // Handle individual scores for 1s and 5s
        ['1', '5'].forEach(num => {
            if (counts[num] && !isShortStraight && !isLongStraight && !fullHouseCheck) {
                const points = num === '1' ? 100 : 50;
                const countText = counts[num] > 1 ? ` x ${counts[num]}` : '';
                descriptions.push(`Single ${num} (${points} points)${countText}`);
                delete counts[num]; // Remove these counts to prevent further scoring
            }
        });
    
        // Handle multiples for other numbers
        Object.keys(counts).forEach(num => {
            const count = counts[num];
            if (count === 3) {
                const points = num === '1' ? 1000 : num * 100;
                descriptions.push(`Three ${num}s (${points} points)`);
            } else if (count === 4) {
                const points = num === '1' ? 2000 : num * 200;
                descriptions.push(`Four ${num}s (${points} points)`);
            } else if (count === 5) {
                descriptions.push('Five of a Kind (5000 points)');
            } else if (count === 6) {
                descriptions.push('Six of a Kind (Instant Win!)');
            }
        });
    
        return descriptions;
    }
    
    
       
    
    function isFullHouse(diceValues) {
        const counts = diceValues.reduce((acc, value) => {
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
    
        // Full House is three pairs of different numbers
        return Object.values(counts).filter(count => count === 2).length === 3;
    }
    
    
    function checkForFullHouse(counts) {
        // Check that there are exactly three pairs (i.e., three values of 2)
        const pairs = Object.values(counts).filter(count => count === 2);
        return pairs.length === 3;
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
    
        // Check for Full House first since it's an exclusive condition
        if (checkForFullHouse(counts)) {
            return 1500;
        }
    
        // Then check for straights since they don't combine with other scores
        const sortedValues = [...new Set(diceValues)].sort((a, b) => a - b);
        if (sortedValues.length === 6) {
            return 2000; // Long straight
        } else if (sortedValues.length === 5 && sortedValues[4] - sortedValues[0] === 4) {
            return 1500; // Short straight
        }
    
        // Handle scoring for individual 1s and 5s
        ['1', '5'].forEach(num => {
            if (counts[num]) {
                score += counts[num] * (num === '1' ? 100 : 50);
                counts[num] = 0; // Reset the count to avoid double scoring
            }
        });
    
        // Handle multiples of other numbers
        Object.keys(counts).forEach(num => {
            const count = counts[num];
            if (count === 3) {
                score += num === '1' ? 1000 : num * 100;
            } else if (count === 4) {
                score += num === '2' ? -1000 : num === '1' ? 2000 : num * 200;
            } else if (count === 5) {
                score += 5000;
            } else if (count === 6) {
                score += 10000; // Instant win
            }
        });
    
        return score;
    }

    
});