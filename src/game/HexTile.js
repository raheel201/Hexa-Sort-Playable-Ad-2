import * as THREE from 'three';

// Shared materials matching screenshot colors
const materials = [
    new THREE.MeshLambertMaterial({ color: 0xff0000 }), // Red
    new THREE.MeshLambertMaterial({ color: 0x00ff00 }), // Green  
    new THREE.MeshLambertMaterial({ color: 0x0000ff }), // Blue
    new THREE.MeshLambertMaterial({ color: 0xffff00 }), // Yellow
    new THREE.MeshLambertMaterial({ color: 0xffffff }), // White
    new THREE.MeshLambertMaterial({ color: 0x808080 }), // Gray
    new THREE.MeshLambertMaterial({ color: 0xff00ff })  // Magenta
];

export class HexTile {
    constructor(geometry, color, position) {
        this.color = color; // Immutable color
        
        // Scale geometry for mobile
        const isMobile = window.innerWidth <= 768;
        const scaledGeometry = geometry.clone();
        if (isMobile) {
            scaledGeometry.scale(0.58, 1, 0.58); // Scale to match mobile hex radius ratio (0.35/0.6)
        }
        
        this.mesh = new THREE.Mesh(scaledGeometry, materials[color]);
        this.mesh.position.copy(position);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.mesh.userData = { tile: this };
        this.originalY = position.y;
        this.isAnimating = false;
    }

    // Lift animation for drag
    lift() {
        if (this.isAnimating) return;
        this.isAnimating = true;
        this.animateY(this.originalY + 0.5, 200);
    }

    // Drop animation
    drop() {
        if (!this.isAnimating) return;
        this.animateY(this.originalY, 200, () => {
            this.isAnimating = false;
        });
    }

    // Merge animation (scale up then fade)
    merge(callback) {
        this.isAnimating = true;
        const startTime = Date.now();
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / 400, 1);
            
            if (progress < 0.5) {
                // Scale up phase
                const scale = 1 + (progress * 2) * 0.3;
                this.mesh.scale.setScalar(scale);
            } else {
                // Fade phase
                const fadeProgress = (progress - 0.5) * 2;
                const scale = 1.3 * (1 - fadeProgress);
                this.mesh.scale.setScalar(scale);
                this.mesh.material.opacity = 1 - fadeProgress;
                this.mesh.material.transparent = true;
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                callback?.();
            }
        };
        animate();
    }

    // Simple Y animation helper
    animateY(targetY, duration, callback) {
        const startY = this.mesh.position.y;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
            
            this.mesh.position.y = startY + (targetY - startY) * eased;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                callback?.();
            }
        };
        animate();
    }

    // Animate to full position (x, y, z)
    animateToPosition(targetX, targetY, targetZ, duration, callback) {
        const startPos = this.mesh.position.clone();
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
            
            this.mesh.position.x = startPos.x + (targetX - startPos.x) * eased;
            this.mesh.position.y = startPos.y + (targetY - startPos.y) * eased;
            this.mesh.position.z = startPos.z + (targetZ - startPos.z) * eased;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                callback?.();
            }
        };
        animate();
    }

    dispose() {
        // Materials are shared, don't dispose them
        this.mesh.geometry.dispose();
    }
}