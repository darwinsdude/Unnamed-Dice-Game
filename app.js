import { CustomDice } from './CustomDice.js';

document.addEventListener('DOMContentLoaded', () => {
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

    // This is where the new code block goes
    document.getElementById('rollButton').addEventListener('click', () => {
        dice.forEach((die, index) => {
            die.roll();
            // Update the image for each die
            document.querySelectorAll('.diceImage')[index].src = die.getCurrentSideImage();
        });
    });
});