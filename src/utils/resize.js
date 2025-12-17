export function setupResize(camera, renderer) {
    function handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    window.addEventListener('resize', handleResize);
    return handleResize;
}