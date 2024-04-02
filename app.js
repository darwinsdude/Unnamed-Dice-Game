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

    // Initialize the dice outside of the click handler to persist its state across rolls
    const myDice = new CustomDice(6, {}, images);

    document.getElementById('rollButton').addEventListener('click', () => {
        // Roll the dice and update the image
        myDice.roll();
        document.getElementById('diceImage').src = myDice.getCurrentSideImage();
    });
});