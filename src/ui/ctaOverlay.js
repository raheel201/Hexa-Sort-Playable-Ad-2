export class CTAOverlay {
    constructor() {
        this.overlay = document.getElementById('cta-overlay');
        this.button = document.getElementById('cta-button');
        this.isShown = false;
        this.clickHandlerAdded = false;
        
        if (!this.clickHandlerAdded) {
            this.button.addEventListener('click', this.onInstallClick.bind(this));
            this.clickHandlerAdded = true;
        }
    }

    show() {
        if (this.isShown) return;
        this.isShown = true;
        this.overlay.style.display = 'flex';
    }

    hide() {
        this.isShown = false;
        this.overlay.style.display = 'none';
    }

    onInstallClick() {
        // Redirect to Hexa Sort game
        window.open('https://play.google.com/store/apps/details?id=com.gamebrain.hexasort', '_blank');
    }
}