# Hexa Sort Playable Ad

A 3D puzzle game built with Three.js and Vite featuring hexagonal tile sorting mechanics.

## Features

- 3D hexagonal game board with drag-and-drop mechanics
- Color-based tile sorting and matching system
- Particle effects and smooth animations using GSAP
- Responsive design for mobile and desktop
- FBX 3D model support with fallback geometry

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
- Clear stacks of 6+ same-colored tiles to score points
- New stacks spawn automatically in the dock

## Assets

Place your 3D models in the `public/assets/` directory. The game currently loads `hexa_03.fbx` but includes a procedural fallback if the model fails to load.