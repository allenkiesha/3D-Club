console.log('main.js loaded');

let scene, camera, renderer, controls;
let selectedObject = null;
let originalColor = null;

function init() {
    console.log('Initializing 3D scene...');
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);  // Dark grey color
    console.log('Scene created');

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    console.log('Camera created');

    // Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight * 0.8);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    console.log('Renderer created and added to DOM');

    // Add orbit controls
    try {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.screenSpacePanning = false;
        controls.maxPolarAngle = Math.PI / 2;
        console.log('OrbitControls added and configured');
    } catch (error) {
        console.error('Error initializing OrbitControls:', error);
    }

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    console.log('Ambient light added');

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    console.log('Directional light added');

    // Add event listener for window resize
    window.addEventListener('resize', onWindowResize, false);
    console.log('Window resize event listener added');

    // Add event listener for object selection
    renderer.domElement.addEventListener('click', onObjectClick, false);
    console.log('Object selection event listener added');

    console.log('Scene initialization complete');
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) {
        controls.update();
    }
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / (window.innerHeight * 0.8);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight * 0.8);
    console.log('Window resized');
}

function addShape(shapeType) {
    console.log(`Adding shape: ${shapeType}`);
    let geometry, material, mesh;

    switch (shapeType) {
        case 'sphere':
            geometry = new THREE.SphereGeometry(0.5, 32, 32);
            break;
        case 'cube':
            geometry = new THREE.BoxGeometry(1, 1, 1);
            break;
        case 'cone':
            geometry = new THREE.ConeGeometry(0.5, 1, 32);
            break;
        case 'cylinder':
            geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
            break;
    }

    material = new THREE.MeshPhongMaterial({ color: 0x87CEEB });  // Light blue color
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
        Math.random() * 4 - 2,
        Math.random() * 4 - 2,
        Math.random() * 4 - 2
    );
    scene.add(mesh);
    console.log(`Shape added: ${shapeType}`, mesh);
}

function onObjectClick(event) {
    console.log("Click event detected");
    event.preventDefault();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);
    console.log("Intersects:", intersects);

    if (intersects.length > 0) {
        console.log("Object clicked:", intersects[0].object);
        if (selectedObject) {
            console.log("Resetting previous selected object color");
            selectedObject.material.color.setHex(originalColor);
        }
        selectedObject = intersects[0].object;
        originalColor = selectedObject.material.color.getHex();
        console.log("Original color:", originalColor);
        selectedObject.material.color.setHex(0xff0000); // Set selected object color to red
        console.log("New color: 0xff0000");
        updateSliders();
    } else {
        console.log("No object clicked");
        if (selectedObject) {
            console.log("Resetting selected object color");
            selectedObject.material.color.setHex(originalColor);
        }
        selectedObject = null;
        updateSliders();
    }
}

function updateSliders() {
    console.log("Updating sliders");
    const positionX = document.getElementById('position-x');
    const positionY = document.getElementById('position-y');
    const positionZ = document.getElementById('position-z');
    const scale = document.getElementById('scale');

    if (selectedObject) {
        positionX.value = selectedObject.position.x;
        positionY.value = selectedObject.position.y;
        positionZ.value = selectedObject.position.z;
        scale.value = selectedObject.scale.x;
        console.log("Slider values updated:", {
            x: positionX.value,
            y: positionY.value,
            z: positionZ.value,
            scale: scale.value
        });
    } else {
        positionX.value = 0;
        positionY.value = 0;
        positionZ.value = 0;
        scale.value = 1;
        console.log("Sliders reset to default values");
    }
}

function updatePosition() {
    if (selectedObject) {
        selectedObject.position.x = parseFloat(document.getElementById('position-x').value);
        selectedObject.position.y = parseFloat(document.getElementById('position-y').value);
        selectedObject.position.z = parseFloat(document.getElementById('position-z').value);
        console.log("Object position updated:", selectedObject.position);
    }
}

function updateScale() {
    if (selectedObject) {
        const scale = parseFloat(document.getElementById('scale').value);
        selectedObject.scale.set(scale, scale, scale);
        console.log("Object scale updated:", scale);
    }
}

console.log('Setting up window.onload');
window.onload = init;
console.log('main.js execution completed');
