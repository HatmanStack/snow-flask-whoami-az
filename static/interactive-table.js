// Three.js interactive table visualization for the HardData page
document.addEventListener('DOMContentLoaded', function() {
    // Parse the data passed from the server
    const tableData = JSON.parse(document.getElementById('table-data').textContent);
    
    // Set up Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    
    // Create renderer and add it to the DOM
    const renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('threejs-table'),
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);
    
    // Create card meshes for each data row
    const cards = [];
    const cardGeometry = new THREE.BoxGeometry(4, 2, 0.1);
    
    // Create text textures for the cards
    function createTextTexture(text, color) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 512;
        canvas.height = 256;
        
        // Fill background
        context.fillStyle = color;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add text
        context.fillStyle = '#ffffff';
        context.font = '24px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Wrap text if needed
        const maxWidth = canvas.width - 40;
        const words = text.split(' ');
        let line = '';
        let lines = [];
        
        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + ' ';
            const metrics = context.measureText(testLine);
            
            if (metrics.width > maxWidth && i > 0) {
                lines.push(line);
                line = words[i] + ' ';
            } else {
                line = testLine;
            }
        }
        lines.push(line);
        
        // Draw text lines
        const lineHeight = 30;
        const startY = canvas.height / 2 - (lines.length - 1) * lineHeight / 2;
        
        lines.forEach((line, index) => {
            context.fillText(line, canvas.width / 2, startY + index * lineHeight);
        });
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    // Create cards for each data row
    tableData.forEach((row, index) => {
        const address = row[0];
        const name = row[1];
        
        // Create card material with text texture
        const cardText = `Address: ${address}\nName: ${name}`;
        const color = `hsl(${index * 30 % 360}, 70%, 40%)`;
        const texture = createTextTexture(cardText, color);
        
        const materials = [
            new THREE.MeshStandardMaterial({ color: 0x888888 }),
            new THREE.MeshStandardMaterial({ color: 0x888888 }),
            new THREE.MeshStandardMaterial({ color: 0x888888 }),
            new THREE.MeshStandardMaterial({ color: 0x888888 }),
            new THREE.MeshStandardMaterial({ map: texture }),
            new THREE.MeshStandardMaterial({ color: 0x888888 })
        ];
        
        const card = new THREE.Mesh(cardGeometry, materials);
        
        // Position cards in a grid layout
        const row_num = Math.floor(index / 5);
        const col_num = index % 5;
        card.position.x = (col_num - 2) * 5;
        card.position.y = 8 - row_num * 3;
        card.position.z = 0;
        
        // Add to scene and cards array
        scene.add(card);
        cards.push(card);
    });
    
    // Set up drag controls
    const dragControls = new THREE.DragControls(cards, camera, renderer.domElement);
    
    dragControls.addEventListener('dragstart', function(event) {
        event.object.material.forEach(mat => {
            if (mat.color) mat.color.set(0xaaaaaa);
        });
    });
    
    dragControls.addEventListener('dragend', function(event) {
        event.object.material.forEach(mat => {
            if (mat.color) mat.color.set(0x888888);
        });
    });
    
    // Add orbit controls for camera movement
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
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
