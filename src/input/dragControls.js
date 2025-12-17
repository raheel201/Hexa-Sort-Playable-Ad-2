import * as THREE from 'three';

export class DragControls {
    constructor(camera, scene, board) {
        this.camera = camera;
        this.scene = scene;
        this.board = board;
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        
        this.draggedStack = null;
        this.isDragging = false;
        this.onMove = null;

        this.bindEvents();
    }

    bindEvents() {
        const canvas = document.querySelector('canvas');
        
        // Mouse events
        canvas.addEventListener('mousedown', this.onPointerDown.bind(this));
        document.addEventListener('mousemove', this.onPointerMove.bind(this));
        document.addEventListener('mouseup', this.onPointerUp.bind(this));

        // Touch events
        canvas.addEventListener('touchstart', this.onPointerDown.bind(this), { passive: false });
        document.addEventListener('touchmove', this.onPointerMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.onPointerUp.bind(this), { passive: false });
    }

    getPointerPosition(event) {
        const canvas = document.querySelector('canvas');
        const rect = canvas.getBoundingClientRect();
        
        const clientX = event.clientX || (event.touches && event.touches[0]?.clientX) || 0;
        const clientY = event.clientY || (event.touches && event.touches[0]?.clientY) || 0;
        
        this.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    }

    onPointerDown(event) {
        event.preventDefault();
        
        if (this.board.isInputLocked()) return;
        
        this.getPointerPosition(event);
        this.raycaster.setFromCamera(this.pointer, this.camera);
        
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        
        for (const intersect of intersects) {
            // Check if this is a draggable external stack
            if (this.board.isDraggableObject(intersect.object)) {
                const stackGroup = this.board.getDraggableStack(intersect.object);
                if (stackGroup) {
                    this.draggedStack = stackGroup;
                    this.isDragging = true;
                    
                    // Change cursor to grabbing
                    document.body.style.cursor = 'grabbing';
                    
                    // Lift the entire stack
                    stackGroup.position.y = 1;
                    console.log('Started dragging stack');
                    break;
                }
            }
        }
    }

    onPointerMove(event) {
        if (!this.isDragging || !this.draggedStack) {
            // Check if hovering over draggable objects
            this.getPointerPosition(event);
            this.raycaster.setFromCamera(this.pointer, this.camera);
            const intersects = this.raycaster.intersectObjects(this.scene.children, true);
            
            let overDraggable = false;
            for (const intersect of intersects) {
                if (this.board.isDraggableObject(intersect.object)) {
                    overDraggable = true;
                    break;
                }
            }
            
            document.body.style.cursor = overDraggable ? 'grab' : 'default';
            return;
        }
        
        event.preventDefault();
        this.getPointerPosition(event);

        this.raycaster.setFromCamera(this.pointer, this.camera);
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectPoint = new THREE.Vector3();
        
        if (this.raycaster.ray.intersectPlane(plane, intersectPoint)) {
            this.draggedStack.position.x = intersectPoint.x;
            this.draggedStack.position.z = intersectPoint.z;
        }
    }

    onPointerUp(event) {
        if (!this.isDragging || !this.draggedStack) return;

        event.preventDefault();
        this.isDragging = false;
        
        // Reset cursor
        document.body.style.cursor = 'default';

        // Find target slot
        const dropPosition = this.draggedStack.position.clone();
        const targetSlot = this.board.getSlotAt(dropPosition);
        
        if (targetSlot) {
            // Valid drop - place stack
            this.board.placeDraggableStack(this.draggedStack, targetSlot);
            // Trigger move callback
            if (this.onMove) {
                this.onMove();
            }
        } else {
            // Invalid drop - return to original position
            const originalPos = this.draggedStack.userData.originalPosition;
            if (originalPos) {
                this.draggedStack.position.copy(originalPos);
            }
            this.draggedStack.position.y = 0;
        }

        this.draggedStack = null;
    }

    returnToOriginalPositions() {
        const sourceSlot = this.board.slots[this.sourceSlotId];
        
        this.selectedGroup.forEach((tile, i) => {
            const originalIndex = sourceSlot.stack.length - this.selectedGroup.length + i;
            const targetY = originalIndex * 0.6;
            
            tile.mesh.position.set(
                sourceSlot.position.x,
                targetY + 0.5,
                sourceSlot.position.z
            );
            
            tile.drop();
        });
    }

    findTileSlot(tile) {
        for (let i = 0; i < this.board.slots.length; i++) {
            if (this.board.slots[i].stack.includes(tile)) {
                return i;
            }
        }
        return null;
    }
}