// --- 3D Scene Setup ---
const container = document.getElementById('canvas-container');

// 1. Create Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// 2. Create the Cube (representing the MPU6050 module)
// Width: 3, Height: 0.2 (thin board), Depth: 2
const geometry = new THREE.BoxGeometry(3, 0.2, 2); 

// Materials for the cube
const materials = [
    new THREE.MeshPhongMaterial({ color: 0x0ea5e9 }), // Right
    new THREE.MeshPhongMaterial({ color: 0x0ea5e9 }), // Left
    new THREE.MeshPhongMaterial({ color: 0x1e293b }), // Top (Dark)
    new THREE.MeshPhongMaterial({ color: 0x0f172a }), // Bottom
    new THREE.MeshPhongMaterial({ color: 0x0ea5e9 }), // Front
    new THREE.MeshPhongMaterial({ color: 0x0ea5e9 }), // Back
];

const cube = new THREE.Mesh(geometry, materials);
scene.add(cube);

// Add a glowing wireframe to make it look techy/premium
const edges = new THREE.EdgesGeometry(geometry);
const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 }));
cube.add(line);

// Add a cool GridHelper at the bottom
const gridHelper = new THREE.GridHelper(20, 40, 0x0ea5e9, 0x1e293b);
gridHelper.position.y = -2;
scene.add(gridHelper);

// Add floating tech particles (Stars)
const particlesGeometry = new THREE.BufferGeometry();
const particlesMaterial = new THREE.PointsMaterial({color: 0x38bdf8, size: 0.05, transparent: true, opacity: 0.6});
const particlesVertices = [];
for(let i=0; i<500; i++) {
    const x = (Math.random() - 0.5) * 30;
    const y = (Math.random() - 0.5) * 30;
    const z = (Math.random() - 0.5) * 30;
    particlesVertices.push(x, y, z);
}
particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlesVertices, 3));
const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particleSystem);

// 3. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// 4. Position Camera
camera.position.z = 6;
camera.position.y = 3;
camera.lookAt(0, 0, 0);

// Handle window resize dynamically
window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    
    // Animate the particle system for a dynamic background
    particleSystem.rotation.y += 0.0005;
    particleSystem.rotation.x += 0.0002;
    
    // Render the scene
    renderer.render(scene, camera);
}
animate();

// --- WebSocket Logic ---
let ws = null;
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const connectBtn = document.getElementById('connect-btn');
const ipInput = document.getElementById('esp-ip');

function connectWebSocket() {
    if (ws) {
        ws.close();
    }

    const ip = ipInput.value.trim();
    if (!ip) {
        alert("Please enter the ESP32 IP address.");
        return;
    }

    statusText.innerText = "Connecting...";
    statusIndicator.className = "indicator";
    statusIndicator.style.backgroundColor = "#fbbf24"; // Yellow

    // Connect to WebSocket server running on ESP32 at port 81
    ws = new WebSocket(`ws://${ip}:81/`);

    ws.onopen = () => {
        statusText.innerText = "Connected";
        statusIndicator.className = "indicator connected";
        statusIndicator.style.backgroundColor = ""; // Reset inline style to use CSS class
        connectBtn.innerText = "Disconnect";
    };

    ws.onclose = () => {
        statusText.innerText = "Disconnected";
        statusIndicator.className = "indicator disconnected";
        statusIndicator.style.backgroundColor = "";
        connectBtn.innerText = "Connect";
        // Reset cube rotation if disconnected
        cube.rotation.set(0, 0, 0);
    };

    ws.onerror = (error) => {
        console.error("WebSocket Error:", error);
    };

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            updateUI(data);
            updateCube(data);
        } catch (e) {
            console.error("Error parsing JSON:", e);
        }
    };
}

connectBtn.addEventListener('click', () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
    } else {
        connectWebSocket();
    }
});

// --- Update UI and 3D Model ---
function updateUI(data) {
    // Orientation
    document.getElementById('val-pitch').innerHTML = data.pitch.toFixed(2) + '&deg;';
    document.getElementById('val-roll').innerHTML = data.roll.toFixed(2) + '&deg;';
    document.getElementById('val-yaw').innerHTML = data.yaw.toFixed(2) + '&deg;';

    // Accelerometer
    document.getElementById('val-ax').innerText = data.ax.toFixed(2);
    document.getElementById('val-ay').innerText = data.ay.toFixed(2);
    document.getElementById('val-az').innerText = data.az.toFixed(2);

    // Gyroscope
    document.getElementById('val-gx').innerText = data.gx.toFixed(2);
    document.getElementById('val-gy').innerText = data.gy.toFixed(2);
    document.getElementById('val-gz').innerText = data.gz.toFixed(2);
}

function updateCube(data) {
    // Convert degrees to radians
    const pitchRad = data.pitch * Math.PI / 180;
    const rollRad = data.roll * Math.PI / 180;
    const yawRad = data.yaw * Math.PI / 180;

    // Apply rotation
    // Mapped Pitch to X-axis (forward/back tilt) and Roll to Z-axis (left/right tilt)
    // The X axis is now inverted as requested.
    cube.rotation.x = -pitchRad; 
    cube.rotation.z = rollRad;   // Standard left/right tilt
    cube.rotation.y = -yawRad;   // Yaw rotation
}
