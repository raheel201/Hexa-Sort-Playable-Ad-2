// Merge logic utilities following exact specifications

export const MERGE_COUNT = 3;

// Check if a stack can merge (entire stack same color + meets count)
export function canMerge(stack) {
    if (stack.length < MERGE_COUNT) return false;
    
    const firstColor = stack[0].color;
    return stack.every(tile => tile.color === firstColor);
}

// Validate move according to rules
export function isValidMove(sourceStack, targetStack, groupSize, maxStackHeight) {
    // Check capacity
    if (targetStack.length + groupSize > maxStackHeight) {
        return false;
    }

    // Target must be empty OR top color matches
    if (targetStack.length === 0) {
        return true;
    }

    const sourceTopColor = sourceStack[sourceStack.length - 1].color;
    const targetTopColor = targetStack[targetStack.length - 1].color;
    
    return sourceTopColor === targetTopColor;
}

// Get top contiguous same-color group
export function getTopGroup(stack) {
    if (stack.length === 0) return [];
    
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