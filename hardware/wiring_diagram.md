# ⚡ MPU-6050 to ESP32 Hardware Wiring Guide

## Pin Connections
| ESP32 DevKit Pin | MPU-6050 IMU Pin | Function | Notes |
| :---: | :---: | :--- | :--- |
| **3.3V** | **VCC** | Power | Powers MPU6050 internal LDO regulator |
| **GND** | **GND** | Ground | Common reference ground |
| **GPIO 21** | **SDA** | I2C Data | Default hardware I2C data line |
| **GPIO 22** | **SCL** | I2C Clock | Default hardware I2C clock (400kHz Fast Mode) |
| **GND** | **AD0** | I2C Address | Pull LOW for I2C address `0x68` (HIGH = `0x69`) |
