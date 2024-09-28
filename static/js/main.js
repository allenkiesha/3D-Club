console.log('main.js loaded');

let scene, camera, renderer;
let selectedObject = null;
let originalColor = null;

function init() {
    console.log('Initializing 3D scene...');
    
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x333333);  // Dark grey color
    console.log('Scene created');

    // Create camera with fixed position
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    console.log('Camera created and positioned');

    // Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight * 0.8);
    document.getElementById('canvas-container').appendChild(renderer.domElement);
    console.log('Renderer created and added to DOM');

    // Add grid helper with white color
    const gridHelper = new THREE.GridHelper(10, 10, 0xffffff, 0xffffff);
    scene.add(gridHelper);
    console.log('Grid helper added');

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

    material = new THREE.MeshPhongMaterial({ color: 0x00aaff });  // Blue color
    mesh = new THREE.Mesh(geometry, material);
    
    const container = new THREE.Object3D();
    container.add(mesh);
    container.position.set(
        Math.random() * 4 - 2,
        Math.random() * 4 - 2,
        Math.random() * 4 - 2
    );
    scene.add(container);
    console.log(`Shape added: ${shapeType}`, container);
}

function onObjectClick(event) {
    console.log("Click event detected");
    event.preventDefault();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children, true);
    console.log("Intersects:", intersects);

    // Filter out the grid from intersects
    const filteredIntersects = intersects.filter(intersect => !(intersect.object instanceof THREE.GridHelper));
    
    // Use filteredIntersects instead of intersects for the rest of the function
    if (filteredIntersects.length > 0) {
        console.log("Object clicked:", filteredIntersects[0].object);
        if (selectedObject) {
            console.log("Resetting previous selected object color");
            selectedObject.children[0].material.color.setHex(originalColor);
        }
        selectedObject = filteredIntersects[0].object.parent;
        originalColor = selectedObject.children[0].material.color.getHex();
        console.log("Original color:", originalColor);
        selectedObject.children[0].material.color.setHex(0xFF69B4); // Hot pink color
        console.log("New color: 0xFF69B4");
        updateSliders();
    } else {
        console.log("No object clicked");
        if (selectedObject) {
            console.log("Resetting selected object color");
            selectedObject.children[0].material.color.setHex(originalColor);
        }
        selectedObject = null;
        updateSliders();
    }
}

function updateSliders() {
    console.log("Updating sliders");
    const positionZ = document.getElementById('position-z');
    const scale = document.getElementById('scale');
    const rotationX = document.getElementById('rotation-x');
    const rotationY = document.getElementById('rotation-y');
    const rotationZ = document.getElementById('rotation-z');

    if (selectedObject) {
        positionZ.value = selectedObject.position.z;
        scale.value = selectedObject.scale.x;
        rotationX.value = selectedObject.rotation.x;
        rotationY.value = selectedObject.rotation.y;
        rotationZ.value = selectedObject.rotation.z;
        console.log("Slider values updated:", {
            z: positionZ.value,
            scale: scale.value,
            rotationX: rotationX.value,
            rotationY: rotationY.value,
            rotationZ: rotationZ.value
        });
    } else {
        positionZ.value = 0;
        scale.value = 1;
        rotationX.value = 0;
        rotationY.value = 0;
        rotationZ.value = 0;
        console.log("Sliders reset to default values");
    }
}

function updatePosition() {
    if (selectedObject) {
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

function rotateSelectedShape(axis, angle) {
    if (selectedObject) {
        selectedObject.rotation[axis] += parseFloat(angle);
        console.log(`Object rotated on ${axis}-axis by ${angle}`);
    }
}

function generateModel() {
    const modelInput = document.getElementById('model-input').value;
    console.log("Generating model from input:", modelInput);

    // Send the model input to the server
    fetch('/generate_model', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: modelInput }),
    })
    .then(response => response.json())
    .then(data => {
        console.log("Server response:", data);
        if (data.shape) {
            addShape(data.shape);
        } else {
            console.error("Invalid shape received from server");
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

console.log('Setting up window.onload');
window.onload = init;
console.log('main.js execution completed');
