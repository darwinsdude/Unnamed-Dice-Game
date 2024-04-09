export class CustomDice {
    constructor(sides = 6, specialSides = {}, images = {}, startValue = 1) {
        this.sides = sides;
        this.currentValue = startValue;
        this.specialSides = specialSides;
        this.images = images; // Store images for each side
        this.selected = false; // Add selected property
    }

    roll() {
        this.currentValue = Math.floor(Math.random() * this.sides) + 1;
        return this.currentValue;
    }

    getValue() {
        return this.currentValue;
    }

    getPoints() {
        // Checks if the current side has a special points value
        if (this.specialSides.hasOwnProperty(this.currentValue)) {
            return this.specialSides[this.currentValue];
        }
        // Return default points or another value as needed
        return this.currentValue; // Consider adjusting based on your game's scoring rules
    }

    updateSpecialSide(side, points) {
        if (side >= 1 && side <= this.sides) {
            this.specialSides[side] = points;
        } else {
            console.error('Invalid side:', side);
        }
    }

    updateSideImage(side, imagePath) {
        if (side >= 1 && side <= this.sides) {
            this.images[side] = imagePath;
        } else {
            console.error('Invalid side for image update:', side);
        }
    }

    getCurrentSideImage() {
        // Returns the image for the current side, or a default if not set
        return this.images[this.currentValue] || 'default.png';
    }

    reset(startValue = 1) {
        // Resets the dice to its start value or 1 if not specified
        this.currentValue = startValue;
    }
}