import * as THREE from 'three';
import { HexTile } from './HexTile.js';
import { CTAOverlay } from '../ui/ctaOverlay.js';
import { ScoreUI } from '../ui/scoreUI.js';

const MERGE_COUNT = 7;
const MAX_STACK_HEIGHT = 6;

export class Board {
    constructor(scene, hexGeometry) {
        this.scene = scene;
        this.hexGeometry = hexGeometry;
        this.slots = [];
        this.mergeCount = 0;
        this.inputLocked = false;
        this.draggableStacks = [];
        this.ctaOverlay = new CTAOverlay();
        this.scoreUI = new ScoreUI();
        this.gameEnded = false;
        this.createBoard();
        this.setupInitialState();
    }

    createBoard() {
        const positions = [];
        const hexRadius = 0.6;
        const hexWidth = hexRadius * 2;
        const hexHeight = hexRadius * Math.sqrt(3);
        
        for (let row = 0; row < 5; row++) {
            for (let col = 0; col < 5; col++) {
                const x = (col - 2) * hexWidth * 0.75;
                const z = (row - 2) * hexHeight + (col % 2) * (hexHeight / 2);
                positions.push({ x, z });
            }
        }

        positions.forEach((pos, id) => {
            const slot = {
                id,
                position: new THREE.Vector3(pos.x, 0, pos.z),
                stack: [],
                maxHeight: MAX_STACK_HEIGHT
            };
            this.slots.push(slot);

            const slotGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.05, 6);
            const slotMat = new THREE.MeshLambertMaterial({ 
                color: 0x808080, 
                transparent: true, 
                opacity: 0.8 
            });
            const slotMesh = new THREE.Mesh(slotGeo, slotMat);
            slotMesh.position.set(pos.x, -0.05, pos.z);
            slotMesh.rotation.y = Math.PI / 6;
            slotMesh.receiveShadow = true;
            this.scene.add(slotMesh);
        });
    }

    createDraggableStacks() {
        const dockPositions = [
            { x: -2, z: 4 },
            { x: 0, z: 4 },
            { x: 2, z: 4 }
        ];
        
        dockPositions.forEach((pos, i) => {
            const stackHeight = Math.floor(Math.random() * 3) + 3; // 3-5 tiles
            const group = new THREE.Group();
            const tiles = [];
            
            // Generate stack with only 3 colors and at least 2 same-colored on top
            const availableColors = [0, 1, 2]; // Only 3 colors
            const topColor = availableColors[Math.floor(Math.random() * 3)];
            
            for (let j = 0; j < stackHeight; j++) {
                let color;
                if (j >= stackHeight - 2) {
                    // Top 2 tiles must be same color
                    color = topColor;
                } else {
                    // Bottom tiles can be any of the 3 colors
                    color = availableColors[Math.floor(Math.random() * 3)];
                }
                const tile = new HexTile(this.hexGeometry, color, new THREE.Vector3(0, j * 0.3, 0));
                tiles.push(tile);
                group.add(tile.mesh);
            }
            
            group.position.set(pos.x, 0, pos.z);
            group.userData = { isDraggable: true, tiles: tiles, isExternalStack: true, originalPosition: new THREE.Vector3(pos.x, 0, pos.z) };
            this.scene.add(group);
            this.draggableStacks.push(group);
        });
    }

    setupInitialState() {
        const initialSlots = [0, 12, 24];
        
        initialSlots.forEach(slotId => {
            const slot = this.slots[slotId];
            const stackHeight = Math.floor(Math.random() * 3) + 2;
            
            // Generate stack with only 3 colors and at least 2 same-colored on top
            const availableColors = [0, 1, 2]; // Only 3 colors
            const topColor = availableColors[Math.floor(Math.random() * 3)];
            
            for (let i = 0; i < stackHeight; i++) {
                let color;
                if (i >= stackHeight - 2) {
                    // Top 2 tiles must be same color
                    color = topColor;
                } else {
                    // Bottom tiles can be any of the 3 colors
                    color = availableColors[Math.floor(Math.random() * 3)];
                }
                const position = new THREE.Vector3(
                    slot.position.x, 
                    i * 0.3, 
                    slot.position.z
                );
                const tile = new HexTile(this.hexGeometry, color, position);
                tile.mesh.userData.isGridTile = true; // Mark as non-draggable
                slot.stack.push(tile);
                this.scene.add(tile.mesh);
            }
        });
        
        this.createDraggableStacks();
        this.startAutoMerge();
    }

    getSelectableGroup(slotId) {
        const slot = this.slots[slotId];
        if (!slot || slot.stack.length === 0) return [];

        const stack = slot.stack;
        const topColor = stack[stack.length - 1].color;
        const group = [];

        for (let i = stack.length - 1; i >= 0; i--) {
            if (stack[i].color === topColor) {
                group.unshift(stack[i]);
            } else {
                break;
            }
        }

        return group;
    }

    canDropGroup(targetSlotId, group) {
        if (group.length === 0) return false;
        
        const targetSlot = this.slots[targetSlotId];
        if (!targetSlot) return false;

        if (targetSlot.stack.length + group.length > targetSlot.maxHeight) {
            return false;
        }

        if (targetSlot.stack.length === 0) {
            return true;
        }

        const topColor = targetSlot.stack[targetSlot.stack.length - 1].color;
        return topColor === group[0].color;
    }

    executeMove(sourceSlotId, targetSlotId, group) {
        if (this.inputLocked) return false;
        
        this.inputLocked = true;

        const sourceSlot = this.slots[sourceSlotId];
        const targetSlot = this.slots[targetSlotId];

        sourceSlot.stack.splice(-group.length, group.length);

        group.forEach((tile, i) => {
            const newY = (targetSlot.stack.length + i) * 0.3;
            tile.animateToPosition(targetSlot.position.x, newY, targetSlot.position.z, 200);
            tile.originalY = newY;
            targetSlot.stack.push(tile);
        });

        // Animate remaining tiles in source to close gaps
        sourceSlot.stack.forEach((tile, i) => {
            const newY = i * 0.3;
            tile.animateToPosition(sourceSlot.position.x, newY, sourceSlot.position.z, 200);
            tile.originalY = newY;
        });

        setTimeout(() => {
            // Ensure positions are exact after animation
            this.repositionStack(sourceSlotId);
            this.repositionStack(targetSlotId);
            this.evaluateMerges(targetSlotId);
            setTimeout(() => this.checkAutoMerge(), 50);
        }, 220);

        return true;
    }

    repositionStack(slotId) {
        const slot = this.slots[slotId];
        slot.stack.forEach((tile, i) => {
            const newY = i * 0.3;
            tile.mesh.position.set(slot.position.x, newY, slot.position.z);
            tile.originalY = newY;
        });
    }

    evaluateMerges(slotId) {
        const slot = this.slots[slotId];
        
        if (slot.stack.length >= MERGE_COUNT) {
            const firstColor = slot.stack[0].color;
            const isUniform = slot.stack.every(tile => tile.color === firstColor);
            
            if (isUniform) {
                this.executeMerge(slotId);
                return;
            }
        }

        this.inputLocked = false;
    }

    executeMerge(slotId) {
        const slot = this.slots[slotId];
        const tilesToMerge = [...slot.stack];
        
        slot.stack = [];
        this.mergeCount++;
        
        // Add 100 points for each merged stack
        this.scoreUI.addScore(100);

        tilesToMerge.forEach((tile, i) => {
            setTimeout(() => {
                tile.merge(() => {
                    this.scene.remove(tile.mesh);
                    tile.dispose();
                });
            }, i * 50);
        });

        setTimeout(() => {
            if (this.mergeCount >= 3) {
                this.endGame();
            } else {
                this.inputLocked = false;
            }
        }, 600);
    }

    endGame() {
        this.gameEnded = true;
        this.inputLocked = true;
        this.ctaOverlay.show();
    }

    getSlotAt(worldPosition) {
        let closestSlot = null;
        let minDistance = 1.2;

        this.slots.forEach(slot => {
            const distance = worldPosition.distanceTo(slot.position);
            if (distance < minDistance && slot.stack.length === 0) {
                minDistance = distance;
                closestSlot = slot;
            }
        });

        return closestSlot;
    }

    placeDraggableStack(stackGroup, targetSlot) {
        const tiles = stackGroup.userData.tiles;
        
        // Remove tiles from group first
        tiles.forEach(tile => {
            stackGroup.remove(tile.mesh);
        });
        
        // Add tiles to scene and position them in the slot
        tiles.forEach((tile, i) => {
            this.scene.add(tile.mesh);
            tile.mesh.position.set(
                targetSlot.position.x,
                i * 0.3,
                targetSlot.position.z
            );
            tile.originalY = i * 0.3;
            targetSlot.stack.push(tile);
        });
        
        // Remove the empty group
        this.scene.remove(stackGroup);
        const index = this.draggableStacks.indexOf(stackGroup);
        if (index > -1) this.draggableStacks.splice(index, 1);
        
        // Check if all external stacks are used, then regenerate
        if (this.draggableStacks.length === 0 && !this.gameEnded) {
            setTimeout(() => this.createDraggableStacks(), 1000);
        }
        
        setTimeout(() => this.checkAutoMerge(), 500);
    }

    startAutoMerge() {
        setInterval(() => {
            if (this.inputLocked) return;
            this.checkAutoMerge();
        }, 1000);
    }

    checkAutoMerge() {
        if (this.gameEnded) return;
        
        for (let slotId = 0; slotId < this.slots.length; slotId++) {
            const slot = this.slots[slotId];
            if (slot.stack.length === 0) continue;
            
            const topGroup = this.getSelectableGroup(slotId);
            if (topGroup.length === 0) continue;
            
            const topColor = topGroup[0].color;
            const isUniformStack = slot.stack.every(tile => tile.color === topColor);
            const neighbors = this.getNeighbors(slotId);
            
            // Find any neighbor with matching top color
            for (let neighborId of neighbors) {
                const neighbor = this.slots[neighborId];
                if (neighbor.stack.length === 0) continue;
                
                const neighborTopGroup = this.getSelectableGroup(neighborId);
                if (neighborTopGroup.length === 0) continue;
                
                const neighborTopColor = neighborTopGroup[0].color;
                const isNeighborUniform = neighbor.stack.every(tile => tile.color === neighborTopColor);
                
                if (topColor === neighborTopColor) {
                    // If current stack is uniform (single color), merge neighbor to it
                    if (isUniformStack) {
                        this.executeMove(neighborId, slotId, neighborTopGroup);
                    }
                    // If neighbor is uniform but current isn't, merge current to neighbor
                    else if (isNeighborUniform) {
                        this.executeMove(slotId, neighborId, topGroup);
                    }
                    // Otherwise, merge smaller to larger
                    else if (topGroup.length <= neighborTopGroup.length) {
                        this.executeMove(slotId, neighborId, topGroup);
                    } else {
                        this.executeMove(neighborId, slotId, neighborTopGroup);
                    }
                    return; // Exit after first merge
                }
            }
        }
    }

    getNeighbors(slotId) {
        const neighbors = [];
        const slot = this.slots[slotId];
        
        for (let i = 0; i < this.slots.length; i++) {
            if (i === slotId) continue;
            
            const distance = slot.position.distanceTo(this.slots[i].position);
            // Adjacent hexagons in this grid layout
            if (distance > 0.8 && distance < 1.2) {
                neighbors.push(i);
            }
        }
        
        return neighbors;
    }

    getMergeCount() {
        return this.mergeCount;
    }

    isInputLocked() {
        return this.inputLocked;
    }

    // Check if object is draggable (only external stacks)
    isDraggableObject(object) {
        // Check if it's an external stack group
        if (object.userData && (object.userData.isExternalStack || object.userData.isDraggable)) {
            return true;
        }
        
        // Check if parent is an external stack
        let parent = object.parent;
        while (parent) {
            if (parent.userData && (parent.userData.isExternalStack || parent.userData.isDraggable)) {
                return true;
            }
            parent = parent.parent;
        }
        
        return false;
    }

    // Get draggable stack from intersected object
    getDraggableStack(object) {
        if (object.userData && (object.userData.isExternalStack || object.userData.isDraggable)) {
            return object;
        }
        
        let parent = object.parent;
        while (parent) {
            if (parent.userData && (parent.userData.isExternalStack || parent.userData.isDraggable)) {
                return parent;
            }
            parent = parent.parent;
        }
        
        return null;
    }
}