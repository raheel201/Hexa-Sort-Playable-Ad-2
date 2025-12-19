# Hexa Sort Playable Ad

A 3D puzzle game built with Three.js, Phaser, and Vite featuring hexagonal tile sorting mechanics. This playable ad combines engaging puzzle gameplay with smooth 3D graphics and responsive mobile optimization.

## Features

- 3D hexagonal game board with drag-and-drop mechanics
- Color-based tile sorting and matching system with intelligent auto-merge logic
- Particle effects and smooth animations using GSAP
- Responsive design optimized for mobile and desktop screens
- FBX 3D model support with procedural fallback geometry
- Mobile-optimized neighbor detection for accurate tile merging
- Phaser integration for enhanced game state management
- Score tracking and game progression system

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Game Mechanics

- Drag tile stacks from the dock to empty hexagonal slots
- Matching colored tiles automatically merge from adjacent hexagons
- Clear stacks of 7+ same-colored tiles to score points
- New stacks spawn automatically in the dock
- Auto-merge system intelligently combines adjacent matching tiles
- Mobile-responsive grid scaling and neighbor detection

## Technology Stack

- **Three.js** - 3D graphics and rendering
- **Phaser** - Game state and event management
- **GSAP** - Animation and tweening
- **Vite** - Build tool and development server
- **FBX Loader** - 3D model loading

## Assets

Place your 3D models in the `public/assets/` directory. The game currently loads `hexa_03.fbx` but includes a procedural fallback if the model fails to load.
