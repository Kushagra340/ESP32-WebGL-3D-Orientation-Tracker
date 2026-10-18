# 🧊 Real-Time ESP32 WebGL 3D Orientation Cube

[![ESP32](https://img.shields.io/badge/MCU-ESP32_DevKit-red?style=for-the-badge&logo=espressif)](https://espressif.com/)
[![Three.js](https://img.shields.io/badge/Rendering-Three.js_WebGL-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
[![WebSockets](https://img.shields.io/badge/Networking-WebSockets_Port_81-orange?style=for-the-badge)]()
[![Sensor Fusion](https://img.shields.io/badge/Fusion-50Hz_Complementary_Filter-blue?style=for-the-badge)]()
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

> **A full-stack IoT spatial tracking application.**  
> Fuses gyroscope and accelerometer readings from an **InvenSense MPU-6050** on an **ESP32** using a **50Hz complementary filter**, broadcasting orientation telemetry over low-latency **WebSockets** to a browser running a **Three.js WebGL 3D orientation block**.

---

## 📹 Video Demo

https://github.com/user-attachments/assets/PLACEHOLDER_REPLACE_WITH_ACTUAL_ASSET_ID

> *Live demo: Physical ESP32 + MPU6050 hand rotation mirrored synchronously by the 3D WebGL block on a laptop browser.*  
> *(Video file located in [`media/imu_cube_live_demo.mp4`](media/imu_cube_live_demo.mp4) — upload to your GitHub Release/Issue to embed).*

---

## 🛠️ System Architecture

```
[ Physical ESP32 + MPU-6050 ]
       ├── 200-sample startup gyro calibration (zero-rate offset elimination)
       ├── 50Hz Complementary Filter (98% Gyro / 2% Accel)
       └── WebSocket Server on Port 81 (JSON Telemetry Stream @ 20Hz)
                    │
                    ▼ (Local Wi-Fi Network)
[ Client Web Dashboard (Three.js WebGL) ]
       ├── Persistent WebSocket Client Connection
       ├── Three.js Perspective Camera & Lighting Pipeline
       └── Real-Time 3D Mesh Euler Angle Transformation
```

---

## 📂 Repository Directory Structure

```text
ESP32-WebGL-3D-Orientation-Tracker/
├── README.md                           # Master project overview & quickstart
├── firmware/
│   └── esp32_mpu6050_cube.ino          # Arduino C++ Complementary Filter & WebSocket broadcast
├── web_dashboard/
│   ├── index.html                      # Dark-mode dashboard with telemetry HUD cards
│   ├── main.js                         # Three.js 3D rendering & WebSocket receiver
│   └── style.css                       # Modern glassmorphism UI styling
├── hardware/
│   └── wiring_diagram.md               # Pinout and electrical connections
├── docs/
│   └── sensor_fusion_mathematics.md    # Complementary filter equations & Euler derivations
└── media/
    └── imu_cube_live_demo.mp4          # Video demonstration of real-time tracking
```

---

## 🚀 Quickstart
1. Open [`firmware/esp32_mpu6050_cube.ino`](firmware/esp32_mpu6050_cube.ino) and enter your Wi-Fi credentials.
2. Flash the firmware to your ESP32.
3. Open Serial Monitor (115200 baud) to note the ESP32 IP address.
4. Open [`web_dashboard/index.html`](web_dashboard/index.html) in your browser, enter the IP, and click **Connect**.

---
## 📜 License
Open-source under the [MIT License](LICENSE).
