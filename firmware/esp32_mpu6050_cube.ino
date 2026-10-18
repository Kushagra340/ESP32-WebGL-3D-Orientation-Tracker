#include <WiFi.h>
#include <WebSocketsServer.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <ArduinoJson.h>

// ==========================================
// ⚠️  REPLACE WITH YOUR WI-FI CREDENTIALS
// ==========================================
const char* ssid     = "YOUR_SSID";      // e.g. "MyHomeNetwork"
const char* password = "YOUR_PASSWORD";  // e.g. "mypassword123"

// Create a WebSocket server on port 81
WebSocketsServer webSocket = WebSocketsServer(81);
Adafruit_MPU6050 mpu;

// Variables for orientation (Euler angles in degrees)
float pitch = 0;
float roll = 0;
float yaw = 0;

// Calibration offsets for Gyro
float gyroOffsetX = 0;
float gyroOffsetY = 0;
float gyroOffsetZ = 0;

unsigned long lastTime = 0;

void setup() {
  Serial.begin(115200);
  
  // 1. Connect to Wi-Fi
  Serial.print("Connecting to Wi-Fi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi connected!");
  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP()); // YOU WILL NEED THIS IP ADDRESS FOR THE WEB UI!

  // 2. Start WebSocket Server
  webSocket.begin();
  
  // 3. Initialize MPU6050
  // Note: Using default ESP32 I2C pins: SDA=21, SCL=22
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip. Check wiring!");
    while (1) { delay(10); } // Halt if sensor not found
  }
  Serial.println("MPU6050 Found!");
  
  // Set sensor ranges and bandwidth for stable readings
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  
  // Calibrate Gyro (calculate zero-rate offset)
  Serial.println("Calibrating Gyro... Please DO NOT move the sensor!");
  int numSamples = 200;
  for (int i = 0; i < numSamples; i++) {
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);
    gyroOffsetX += g.gyro.x;
    gyroOffsetY += g.gyro.y;
    gyroOffsetZ += g.gyro.z;
    delay(10);
  }
  gyroOffsetX /= numSamples;
  gyroOffsetY /= numSamples;
  gyroOffsetZ /= numSamples;
  Serial.println("Calibration complete!");
  
  lastTime = millis();
}

void loop() {
  // Handle WebSocket clients
  webSocket.loop();
  
  unsigned long currentTime = millis();
  
  // Update and send data every 50ms (20 Hz)
  if (currentTime - lastTime >= 50) {
    float dt = (currentTime - lastTime) / 1000.0;
    lastTime = currentTime;
    
    // Read sensor data
    sensors_event_t a, g, temp;
    mpu.getEvent(&a, &g, &temp);
    
    // --- Complementary Filter for Pitch and Roll ---
    // Calculate pitch and roll from accelerometer
    // Using standard mapping where Roll is around X axis (allowing full 360 deg), Pitch is around Y.
    float accelRoll = atan2(a.acceleration.y, a.acceleration.z) * 180 / PI;
    float accelPitch = atan2(-a.acceleration.x, sqrt(a.acceleration.y * a.acceleration.y + a.acceleration.z * a.acceleration.z)) * 180 / PI;
    
    // Convert gyro rates from rad/s to deg/s and subtract calibration offsets
    float gyroRateX = (g.gyro.x - gyroOffsetX) * 180 / PI; // Roll rate
    float gyroRateY = (g.gyro.y - gyroOffsetY) * 180 / PI; // Pitch rate
    float gyroRateZ = (g.gyro.z - gyroOffsetZ) * 180 / PI; // Yaw rate
    
    // Apply small deadband to prevent stationary drift
    if (abs(gyroRateX) < 0.5) gyroRateX = 0;
    if (abs(gyroRateY) < 0.5) gyroRateY = 0;
    if (abs(gyroRateZ) < 0.5) gyroRateZ = 0;
    
    // Apply filter (98% Gyro, 2% Accelerometer)
    roll = 0.98 * (roll + gyroRateX * dt) + 0.02 * accelRoll;
    pitch = 0.98 * (pitch + gyroRateY * dt) + 0.02 * accelPitch;
    yaw = yaw + gyroRateZ * dt; // Yaw will stay steady now due to offset calibration and deadband
    
    // Create a JSON document to send
    StaticJsonDocument<256> doc;
    doc["pitch"] = pitch;
    doc["roll"] = roll;
    doc["yaw"] = yaw;
    doc["ax"] = a.acceleration.x;
    doc["ay"] = a.acceleration.y;
    doc["az"] = a.acceleration.z;
    doc["gx"] = g.gyro.x;
    doc["gy"] = g.gyro.y;
    doc["gz"] = g.gyro.z;
    
    String jsonString;
    serializeJson(doc, jsonString);
    
    // Broadcast the JSON string to all connected web clients
    webSocket.broadcastTXT(jsonString);
  }
}
