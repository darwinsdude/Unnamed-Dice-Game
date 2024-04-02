export class CustomDice {
    constructor(sides = 6, specialSides = {}, images = {}) {
        this.sides = sides;
        this.currentValue = 1;
        this.specialSides = specialSides;
        this.images = images; // Store images for each side
    }

    roll() {
        this.currentValue = Math.floor(Math.random() * this.sides) + 1;
        return this.currentValue;
    }

    getValue() {
        return this.currentValue;
    }

    getPoints() {
        if (this.specialSides.hasOwnProperty(this.currentValue)) {
            return this.specialSides[this.currentValue];
        }
        return this.currentValue;
    }

    updateSpecialSide(side, points) {
        this.specialSides[side] = points;
    }

    // Method to update the image for a specific side
    updateSideImage(side, imagePath) {
        this.images[side] = imagePath;
    }

    // Method to get the image for the current side
    getCurrentSideImage() {
        return this.images[this.currentValue] || 'default.png'; // Return a default image if none is set
    }
}