import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// Core modules
import { createScene } from './core/scene.js';
import { createRenderer } from './core/renderer.js';
import { createCamera } from './core/camera.js';
import { createLights } from './core/lights.js';

// Game modules
import { Board } from './game/Board.js';

// Input & UI
import { DragControls } from './input/dragControls.js';
import { CTAOverlay } from './ui/ctaOverlay.js';

// Utils
import { setupResize } from './utils/resize.js';

// Phaser UI implementation
import { PhaserUIManager } from './phaser/PhaserGame.js';

class HexaPlayableAd {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.board = null;
        this.dragControls = null;
        this.ctaOverlay = null;
        this.hexGeometry = null;
        this.gameActive = true;
        this.phaserUI = new PhaserUIManager();
        this.moveCount = 0;
        
        this.init();
    }

    async init() {
        // Create Phaser UI container
        const phaserContainer = document.createElement('div');
        phaserContainer.id = 'phaser-container';
        phaserContainer.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1;';
        document.getElementById('game-container').appendChild(phaserContainer);
        
        // Create core Three.js components
        this.scene = createScene();
        this.camera = createCamera();
        this.renderer = createRenderer();
        
        // Add renderer to DOM
        const canvas = this.renderer.domElement;
        canvas.style.position = 'relative';
        canvas.style.zIndex = '10';
        document.getElementById('game-container').appendChild(canvas);
        
        // Setup lighting
        createLights(this.scene);
        
        // Setup resize handling
        setupResize(this.camera, this.renderer);
        
        // Initialize UI
        this.ctaOverlay = new CTAOverlay();
        
        // Initialize Phaser UI after Three.js canvas
        setTimeout(() => {
            this.phaserUI.init();
        }, 100);
        
        // Load hexagon model and start game
        await this.loadHexagonModel();
        this.startGame();
    }

    async loadHexagonModel() {
        return new Promise((resolve, reject) => {
            const loader = new FBXLoader();
            
            loader.load(
                '/models/hexagon.fbx',
                (fbx) => {
                    console.log('FBX loaded successfully');
                    this.processLoadedModel(fbx);
                    resolve();
                },
                (progress) => {
                    console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
                },
                (error) => {
                    console.warn('FBX loading failed, using fallback geometry:', error);
                    this.createFallbackGeometry();
                    resolve();
                }
            );
        });
    }

    processLoadedModel(fbx) {
        let foundGeometry = null;
        
        fbx.traverse((child) => {
            if (child.isMesh && child.geometry) {
                foundGeometry = child.geometry.clone();
                foundGeometry.center();
                foundGeometry.scale(0.5, 0.3, 0.5); // Scale for tile size
            }
        });

        if (foundGeometry) {
            this.hexGeometry = foundGeometry;
        } else {
            console.warn('No geometry found in FBX, using fallback');
            this.createFallbackGeometry();
        }
    }

    createFallbackGeometry() {
        // Create hexagonal cylinder as fallback
        this.hexGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 6);
        this.hexGeometry.rotateY(Math.PI / 6);
    }



    startGame() {
        // Create game board with loaded geometry
        this.board = new Board(this.scene, this.hexGeometry);
        
        // Setup drag controls with move tracking
        this.dragControls = new DragControls(this.camera, this.scene, this.board);
        this.dragControls.onMove = () => {
            this.moveCount++;
            this.phaserUI.updateMoves(this.moveCount);
        };
        
        // Start render loop
        this.animate();
        
        // Monitor for game completion
        this.monitorGameProgress();
    }

    monitorGameProgress() {
        const checkProgress = () => {
            if (!this.gameActive) return;
            
            const mergeCount = this.board.getMergeCount();
            
            // Update UI with current score
            this.phaserUI.updateScore(mergeCount * 100);
            
            // Show CTA after 1-2 successful merges (playable ad spec)
            if (mergeCount >= 1) {
                this.gameActive = false;
                setTimeout(() => {
                    this.ctaOverlay.show();
                }, 1000);
                return;
            }
            
            // Check win condition
            if (this.board.isWon()) {
                this.gameActive = false;
                setTimeout(() => {
                    this.ctaOverlay.show();
                }, 500);
                return;
            }
            
            // For playable ads, disable lose condition
            // if (this.board.isLost()) {
            //     this.gameActive = false;
            //     // Show restart or CTA
            // }
            
            setTimeout(checkProgress, 500);
        };
        
        setTimeout(checkProgress, 1000);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// Initialize the playable ad
new HexaPlayableAd();