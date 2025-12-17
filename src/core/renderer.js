import * as THREE from 'three';

export function createRenderer() {
    const renderer = new THREE.WebGLRenderer({ 
        antialias: false, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    return renderer;
}