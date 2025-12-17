import * as THREE from 'three';

export function createCamera() {
    const camera = new THREE.PerspectiveCamera(
        45, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        100
    );
    camera.position.set(0, 8, 8);
    camera.lookAt(0, -1, 0);
    return camera;
}