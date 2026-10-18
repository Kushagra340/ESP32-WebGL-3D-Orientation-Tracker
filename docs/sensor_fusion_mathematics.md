# 📐 6-DOF Sensor Fusion & Complementary Filter Derivation

## 1. Accelerometer Tilt Calculation
The accelerometer measures the projection of the gravity vector $g \approx 9.81\text{ m/s}^2$ across its three orthogonal axes ($a_x, a_y, a_z$):
$$\theta_{\text{roll}} = \text{atan2}(a_y, a_z) \cdot \frac{180}{\pi}$$
$$\theta_{\text{pitch}} = \text{atan2}\left(-a_x, \sqrt{a_y^2 + a_z^2}\right) \cdot \frac{180}{\pi}$$

## 2. Gyroscope Rate Integration
$$\theta_{\text{gyro}}(t) = \theta(t - \Delta t) + \omega_{\text{gyro}}(t) \cdot \Delta t$$

## 3. 50Hz Complementary Filter
$$\theta_{\text{fused}}(t) = 0.98 \cdot \left[ \theta_{\text{fused}}(t - \Delta t) + \omega_{\text{gyro}}(t) \cdot \Delta t \right] + 0.02 \cdot \theta_{\text{accel}}(t)$$
- High-pass filters the gyroscope (removes long-term DC bias drift).
- Low-pass filters the accelerometer (removes high-frequency vibrational noise).
