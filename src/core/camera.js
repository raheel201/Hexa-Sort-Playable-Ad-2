import * as THREE from 'three';

export function createCamera() {
    const isMobile = window.innerWidth <= 768;
    
    const camera = new THREE.PerspectiveCamera(
        45, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        100
    );
    
    if (isMobile) {
        camera.position.set(0, 6, 5);
        camera.lookAt(0, -0.5, 0);
    } else {
        camera.position.set(0, 8, 8);
        camera.lookAt(0, -1, 0);
    }
    
    return camera;
}