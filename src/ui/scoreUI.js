export class ScoreUI {
    constructor() {
        this.score = 0;
        this.createScoreElement();
    }

    createScoreElement() {
        this.scoreElement = document.createElement('div');
        this.scoreElement.id = 'score-display';
        this.scoreElement.style.cssText = `
            position: absolute;
            top: 20px;
            left: 20px;
            font-family: 'Arial Black', Arial, sans-serif;
            font-size: 26px;
            font-weight: bold;
            color: #fff;
            background: linear-gradient(135deg, #ffd700, #ff8c00);
            padding: 12px 24px;
            border-radius: 20px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            border: 3px solid rgba(255,255,255,0.3);
            z-index: 100;
        `;
        this.updateDisplay();
        document.body.appendChild(this.scoreElement);
    }

    addScore(points) {
        this.score += points;
        this.updateDisplay();
    }

    updateDisplay() {
        this.scoreElement.textContent = `Score: ${this.score}`;
    }

    getScore() {
        return this.score;
    }
}