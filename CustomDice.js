export class CustomDice {
    constructor(sides = 6, specialSides = {}, images = {}, startValue = 1) {
        this.sides = sides;
        this.currentValue = startValue;
        this.specialSides = specialSides;
        this.images = images; // Store images for each side
        this.selected = false; // Add selected property
        this.setAside = false; // Add set aside property
    }

    toggleSetAside() {
        if (this.selected) { // Only toggle set aside if it is currently selected
            this.setAside = !this.setAside;
        }
    }

    roll() {
        if (!this.setAside) { // Dice can only be rolled if it is not set aside
            this.currentValue = Math.floor(Math.random() * this.sides) + 1;
        }
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

    toggleSelected() {
        if (!this.setAside) { // Only toggle selection if not set aside
            this.selected = !this.selected;
        }
    }

    reset(startValue = 1) {
        this.currentValue = startValue;
        this.selected = false;
        this.setAside = false; // Reset the set aside state as well
    }

    setCurrentValue(value) {
        if (!this.setAside) { // Only set value if dice is not set aside
            if (value >= 1 && value <= this.sides) {
                this.currentValue = value;
            } else {
                console.error('Invalid value for dice side');
            }
        }
    }
}