export function setupResize(camera, renderer) {
    function handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isMobile = width <= 768;

        camera.aspect = width / height;
        
        if (isMobile) {
            camera.position.set(0, 6, 5);
            camera.lookAt(0, -0.5, 0);
        } else {
            camera.position.set(0, 8, 8);
            camera.lookAt(0, -1, 0);
        }
        
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
        setTimeout(handleResize, 100);
    });
    
    return handleResize;
}