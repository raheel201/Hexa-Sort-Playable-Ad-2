import * as THREE from 'three';

export function createScene() {
    const scene = new THREE.Scene();
    
    // Load background texture
    const loader = new THREE.TextureLoader();
    const backgroundTexture = loader.load('/assets/wood2_01.png');
    scene.background = backgroundTexture;
    
    return scene;
}