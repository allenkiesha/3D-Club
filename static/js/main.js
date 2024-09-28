let scene, camera, renderer, controls;
let selectedObject = null;
let originalColor = null;

function init() {
    console.log("Initializing scene");
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Create renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight * 0.8);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Add orbit controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Add event listener for window resize
    window.addEventListener('resize', onWindowResize, false);

    // Add event listener for object selection
    renderer.domElement.addEventListener('click', onObjectClick, false);

    console.log("Scene initialized");
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / (window.innerHeight * 0.8);
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight * 0.8);
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

    material = new THREE.MeshPhongMaterial({ color: Math.random() * 0xffffff });
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

window.onload = init;
