// Three.js background animation for the homepage
document.addEventListener('DOMContentLoaded', function() {
    // Parse the data passed from the server
    const streamData = JSON.parse(document.getElementById('threejs-data').textContent);
    
    // Set up Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // Create renderer and add it to the DOM
    const renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('threejs-background'),
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0.3); // Semi-transparent black
    
    // Create text sprites for the falling data
    const dataSprites = [];
    const fontLoader = new THREE.FontLoader();
    
    // Create particles for each data point
    streamData.forEach((item, index) => {
        // Create a sprite for each data point
        const sprite = new THREE.Sprite(
            new THREE.SpriteMaterial({
                color: 0x3388ff,
                transparent: true,
                opacity: 0.7
            })
        );
        
        // Position sprites randomly in the scene
        sprite.position.x = Math.random() * 40 - 20;
        sprite.position.y = Math.random() * 40 - 10;
        sprite.position.z = Math.random() * 20 - 30;
        
        // Scale sprites based on data
        const scale = 0.2 + Math.random() * 0.3;
        sprite.scale.set(scale, scale, 1);
        
        // Store velocity for animation
        sprite.userData = {
            velocity: 0.01 + Math.random() * 0.03,
            rotationSpeed: Math.random() * 0.02 - 0.01
        };
        
        scene.add(sprite);
        dataSprites.push(sprite);
    });
    
    // Position camera
    camera.position.z = 5;
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Update sprite positions - falling effect
        dataSprites.forEach(sprite => {
            sprite.position.y -= sprite.userData.velocity;
            sprite.rotation.z += sprite.userData.rotationSpeed;
            
            // Reset position when sprite falls below the view
            if (sprite.position.y < -15) {
                sprite.position.y = 15;
                sprite.position.x = Math.random() * 40 - 20;
            }
        });
        
        renderer.render(scene, camera);
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    // Start animation
    animate();
});
