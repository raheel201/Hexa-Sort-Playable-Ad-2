import Phaser from 'phaser';

export class PhaserUIScene extends Phaser.Scene {
    constructor() {
        super({ key: 'UIScene' });
        this.score = 0;
        this.moves = 0;
        this.particles = [];
    }

    create() {
        this.createLeftPanel();
        this.createRightPanel();
        this.createParticleEffects();
    }

    createLeftPanel() {
        // Score panel
        const panel = this.add.graphics();
        panel.fillStyle(0x2c3e50, 0.8);
        panel.fillRoundedRect(20, 100, 150, 200, 10);
        
        this.add.text(95, 120, 'SCORE', {
            fontSize: '18px',
            fill: '#ecf0f1',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        this.scoreText = this.add.text(95, 160, '0', {
            fontSize: '32px',
            fill: '#f39c12',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        this.add.text(95, 200, 'MOVES', {
            fontSize: '18px',
            fill: '#ecf0f1',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        this.movesText = this.add.text(95, 240, '0', {
            fontSize: '24px',
            fill: '#3498db',
            fontWeight: 'bold'
        }).setOrigin(0.5);
    }

    createRightPanel() {
        const width = this.cameras.main.width;
        
        // Progress panel
        const panel = this.add.graphics();
        panel.fillStyle(0x2c3e50, 0.8);
        panel.fillRoundedRect(width - 170, 100, 150, 300, 10);
        
        this.add.text(width - 95, 120, 'PROGRESS', {
            fontSize: '16px',
            fill: '#ecf0f1',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        
        // Progress bars
        for (let i = 0; i < 5; i++) {
            const y = 160 + i * 40;
            const bg = this.add.graphics();
            bg.fillStyle(0x34495e);
            bg.fillRoundedRect(width - 150, y, 100, 20, 10);
            
            const bar = this.add.graphics();
            bar.fillStyle(0xe74c3c + i * 0x111111);
            bar.fillRoundedRect(width - 150, y, 0, 20, 10);
            bar.setData('maxWidth', 100);
            bar.setData('progress', 0);
        }
    }

    createParticleEffects() {
        // Floating particles in side areas
        for (let i = 0; i < 10; i++) {
            const x = Math.random() < 0.5 ? Math.random() * 200 : this.cameras.main.width - 200 + Math.random() * 200;
            const y = Math.random() * this.cameras.main.height;
            
            const particle = this.add.graphics();
            particle.fillStyle(0xffffff, 0.3);
            particle.fillCircle(0, 0, 2);
            particle.x = x;
            particle.y = y;
            
            this.tweens.add({
                targets: particle,
                y: y - 100,
                alpha: 0,
                duration: 3000 + Math.random() * 2000,
                repeat: -1,
                yoyo: true
            });
        }
    }

    updateScore(score) {
        this.score = score;
        this.scoreText.setText(score.toString());
        
        // Animate score change
        this.tweens.add({
            targets: this.scoreText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 200,
            yoyo: true
        });
    }

    updateMoves(moves) {
        this.moves = moves;
        this.movesText.setText(moves.toString());
    }

    updateProgress(level, progress) {
        // Update progress bars based on game state
        // This would be called from the main game
    }
}

export class PhaserUIManager {
    constructor() {
        this.game = null;
        this.uiScene = null;
    }

    init() {
        const config = {
            type: Phaser.AUTO,
            width: window.innerWidth,
            height: window.innerHeight,
            parent: 'phaser-container',
            transparent: true,
            scene: PhaserUIScene,
            scale: {
                mode: Phaser.Scale.RESIZE,
                autoCenter: Phaser.Scale.CENTER_BOTH
            }
        };

        this.game = new Phaser.Game(config);
        this.uiScene = this.game.scene.getScene('UIScene');
    }

    updateScore(score) {
        if (this.uiScene) {
            this.uiScene.updateScore(score);
        }
    }

    updateMoves(moves) {
        if (this.uiScene) {
            this.uiScene.updateMoves(moves);
        }
    }

    destroy() {
        if (this.game) {
            this.game.destroy(true);
            this.game = null;
            this.uiScene = null;
        }
    }
}