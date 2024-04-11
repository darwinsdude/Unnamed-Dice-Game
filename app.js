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
    
        // Handle multiples
        Object.keys(counts).forEach(num => {
            if (counts[num] === 3 && num === '1') {
                descriptions.push('Three 1s (1000 points)');
            } else if (counts[num] === 3) {
                descriptions.push(`Three ${num}s (${num * 100} points)`);
            } else if (counts[num] === 1 && num === '1') {
                descriptions.push('Single 1 (100 points)');
            } else if (counts[num] === 2 && num === '1') {
                descriptions.push('Single 1 (100 points)', 'Single 1 (100 points)');
            }
        });
    
        // Handle straights and full houses
        if (isStraight(diceValues)) {
            descriptions.push('Straight (1500 points)');
        }
        if (isFullHouse(diceValues)) {
            descriptions.push('Full House (1500 points)');
        }
    
        return descriptions;
    }
    
    function isStraight(diceValues) {
        const uniqueValues = [...new Set(diceValues)];
        return uniqueValues.length === 6 && Math.max(...uniqueValues) - Math.min(...uniqueValues) === 5;
    }
    
    function isFullHouse(diceValues) {
        const counts = Object.values(diceValues.reduce((acc, value) => {
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {}));
        return counts.filter(count => count === 3).length === 1 && counts.filter(count => count === 2).length === 1;
    }
    
    
    function identifyScoringHands(diceValues) {
        let counts = diceValues.reduce((acc, value) => {
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
    
        let hands = [];
        Object.keys(counts).forEach(num => {
            switch (counts[num]) {
                case 1:
                    if (num === '1') hands.push('Single 1 (100 points)');
                    if (num === '5') hands.push('Single 5 (50 points)');
                    break;
                case 2:
                    // Pair might not be a scoring hand unless it's part of a full house
                    break;
                case 3:
                    if (num === '1') hands.push('Three 1s (1000 points)');
                    else if (num === '5') hands.push('Three 5s (500 points)');
                    else hands.push(`Three ${num}s (${num * 100} points)`);
                    break;
                case 4:
                    hands.push(`Four of a Kind (${num}s)`);
                    break;
                case 5:
                    hands.push('Five of a Kind');
                    break;
                default:
                    break;
            }
        });
    
        // Check for straights
        const sortedValues = [...new Set(diceValues)].sort((a, b) => a - b);
        if (sortedValues.length === 6) {
            hands.push('Long Straight (2000 points)');
        } else if (sortedValues.length === 5 && sortedValues[4] - sortedValues[0] === 4) {
            hands.push('Short Straight (1500 points)');
        }
    
        // Check for full house
        const pairs = Object.values(counts).filter(count => count === 2).length;
        const threes = Object.values(counts).filter(count => count === 3).length;
        if (pairs === 3 || (pairs === 1 && threes === 1)) {
            hands.push('Full House (1500 points)');
        }
    
        return hands;
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

        const results =[];
    
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
        results.forEach(result => score += result.score);
        return score;
    }

    
});