import { CustomDice } from './CustomDice.js';

let diceRolled = false; // Flag to track if the "Roll Dice" has been clicke
let currentScore = 0;
let winningScore = 10000; // Default winning score, can be adjusted by the player
let accumulatedPossiblePoints = 0;
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
                die.toggleSetAside();
                if (die.setAside) {
                    diceImages[index].classList.add('set-aside');
                    diceImages[index].classList.remove('selected');
                    die.selected = false;
                }
            }
        });
        updatePossiblePointsAndIndicators();
    });
    

    document.getElementById('rollButton').addEventListener('click', () => {
        diceRolled = true;
        accumulatedPossiblePoints = 0; // Reset accumulated possible points
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
        currentScore += accumulatedPossiblePoints;
        updateScoreDisplay();
        resetSelections();
        accumulatedPossiblePoints = 0; // Reset accumulated possible points
        document.getElementById('possiblePoints').textContent = accumulatedPossiblePoints;
        bankPointsButton.style.display = 'none';
    });

    function updatePossiblePointsAndIndicators() {
        const selectedDiceValues = dice.filter(die => die.selected && !die.setAside).map(die => die.getValue());
        const scoreForSelection = calculateScore(selectedDiceValues);
        
        // Update accumulated possible points based on the current selection
        if (scoreForSelection > 0) {
            accumulatedPossiblePoints = scoreForSelection;
        } else {
            accumulatedPossiblePoints = 0;
        }
        
        document.getElementById('possiblePoints').textContent = accumulatedPossiblePoints;
    
        // Identify and display scoring hands dynamically
        const scoringDescriptions = getScoringDescriptions(selectedDiceValues);
        document.getElementById('selectedCombination').textContent = scoringDescriptions.join(", ");
    
        // Determine the validity of the selection for setting aside
        const isValidSelection = scoringDescriptions.length > 0 && selectedDiceValues.every(value => {
            const count = selectedDiceValues.filter(v => v === value).length;
            return value === 1 || value === 5 || count >= 3;
        });
        const shouldDisplaySetAside = isValidSelection && dice.some(die => die.selected && !die.setAside);
        document.getElementById('setAsideButton').style.display = shouldDisplaySetAside ? 'block' : 'none';
    
        bankPointsButton.style.display = accumulatedPossiblePoints >= 750 ? 'block' : 'none';
    }
    
    function getScoringDescriptions(diceValues) {
        const counts = diceValues.reduce((acc, value) => {
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
        let descriptions = [];
        
        if (checkForFullHouse(counts)) {
            descriptions.push('Full House (1500 points)');
            return descriptions;
        }
        
        const uniqueValues = [...new Set(diceValues)].sort((a, b) => a - b);
        let straightScored = false;
        
        if (uniqueValues.length === 6) {
            descriptions.push('Long Straight (2000 points)');
            return descriptions;
        } else if (uniqueValues.length === 5 && uniqueValues[4] - uniqueValues[0] === 4) {
            descriptions.push('Short Straight (1500 points)');
            straightScored = true;
            counts['1'] = counts['1'] > 0 && uniqueValues.includes(1) ? counts['1'] - 1 : counts['1'];
            counts['5'] = counts['5'] > 0 && uniqueValues.includes(5) ? counts['5'] - 1 : counts['5'];
        }
        
        Object.keys(counts).forEach(num => {
            if (counts[num] >= 3) {
                descriptions.push(`Three ${num}s (${num === '1' ? '1000' : num * 100} points)`);
                counts[num] -= 3; // Subtract the count of the scored combination
            }
            if (counts[num] === 4) {
                descriptions.push(`Four ${num}s (${num === '2' ? '-1000' : num * 200} points)`);
            } else if (counts[num] === 5) {
                descriptions.push('Five of a Kind (5000 points)');
            } else if (counts[num] === 6) {
                descriptions.push('Six of a Kind (Instant win!)');
            }
        });
        
        if (!straightScored) {
            if (counts['1'] > 0) {
                descriptions.push(`Single 1 (100 points) x ${counts['1']}`);
            }
            if (counts['5'] > 0) {
                descriptions.push(`Single 5 (50 points) x ${counts['5']}`);
            }
        } else {
            if (counts['1'] === 1) {
                descriptions.push('Single 1 (100 points)');
            }
            if (counts['5'] === 1) {
                descriptions.push('Single 5 (50 points)');
            }
        }
        
        descriptions = descriptions.filter((desc, index, self) => 
            index === self.findIndex((d) => d === desc)
        );
        
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
    
        if (checkForFullHouse(counts)) {
            return 1500;
        }
    
        const uniqueValues = [...new Set(diceValues)].sort((a, b) => a - b);
        const isLongStraight = uniqueValues.length === 6;
        const isShortStraight = uniqueValues.length === 5 && uniqueValues[4] - uniqueValues[0] === 4;
    
        if (isLongStraight) {
            return 2000;
        } else if (isShortStraight) {
            score += 1500; // Short straight
            counts['1'] -= uniqueValues.includes(1) ? 1 : 0; // Subtract the count for 1 if it's part of the straight
            counts['5'] -= uniqueValues.includes(5) ? 1 : 0; // Subtract the count for 5 if it's part of the straight
        }
    
        Object.keys(counts).forEach(num => {
            if (counts[num] === 3) {
                score += num === '1' ? 1000 : num * 100;
            } else if (counts[num] === 4) {
                score += num === '1' ? 2000 : num === '2' ? -1000 : num * 200;
            } else if (counts[num] === 5) {
                score += 5000;
            } else if (counts[num] === 6) {
                score += 10000;
            } else if ((num === '1' || num === '5') && counts[num] < 3) {
                score += counts[num] * (num === '1' ? 100 : 50);
            }
        });
    
        return score;
    }
});


