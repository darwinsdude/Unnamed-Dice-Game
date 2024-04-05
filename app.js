import { CustomDice } from './CustomDice.js';

document.addEventListener('DOMContentLoaded', () => {
    const targetScoreInput = document.getElementById('targetScoreInput');
    const setTargetScoreBtn = document.getElementById('setTargetScoreBtn');
    const targetScoreDisplay = document.getElementById('targetScoreDisplay');
    const currentScoreSpan = document.getElementById('score');
    let targetScore = 10000; // Default target score
    let currentScore = 0; // Initialize current score

    // Map for dice image sources
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

    // Function to update the score display
    function updateScoreDisplay() {
        currentScoreSpan.textContent = currentScore;
    }

    // Set target score from input
    setTargetScoreBtn.addEventListener('click', () => {
        targetScore = parseInt(targetScoreInput.value, 10);
        targetScoreDisplay.textContent = targetScore;
    });

    // Roll the dice and update their images
    document.getElementById('rollButton').addEventListener('click', () => {
        dice.forEach((die, index) => {
            die.roll();
            // Update the image for each die
            document.querySelectorAll('.diceImage')[index].src = die.getCurrentSideImage();
        });
        // Here you would call your scoring function to calculate the score based on the roll
        // And then update the current score and display it
        // Example (assuming a calculateScore function exists and returns the score for the roll):
        // currentScore += calculateScore(dice.map(die => die.getValue()));
        // updateScoreDisplay();
    });

    // Initially set the target score display to the default target score
    targetScoreDisplay.textContent = targetScore.toString();
    // Initially update the current score display
    updateScoreDisplay();
});

