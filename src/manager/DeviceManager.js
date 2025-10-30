import AsyncStorage from '@react-native-async-storage/async-storage';

class DeviceManager {
  constructor() {
    this.deviceId = null;
  }

  // Set device ID (called after successful login)
  async setDeviceId(deviceId) {
    this.deviceId = deviceId.toString();
    await AsyncStorage.setItem('deviceId', deviceId.toString());
    console.log('Device ID set:', deviceId);
  }

  // Get device ID from memory or AsyncStorage
  async getDeviceId() {
    if (this.deviceId) {
      return this.deviceId;
    }

    try {
      const storedDeviceId = await AsyncStorage.getItem('deviceId');
      if (storedDeviceId) {
        this.deviceId = storedDeviceId;
        return storedDeviceId;
      }
    } catch (error) {
      console.log('Error getting device ID from storage:', error);
    }

    // Fallback to default if no device ID is found
    const defaultDeviceId = '1';
    console.log('No device ID found, using default:', defaultDeviceId);
    return defaultDeviceId;
  }

  // Clear device ID (called on logout)
  async clearDeviceId() {
    this.deviceId = null;
    await AsyncStorage.removeItem('deviceId');
    console.log('Device ID cleared');
  }

  // Check if device ID is set
  hasDeviceId() {
    return this.deviceId !== null;
  }
}

// Export a singleton instance
export default new DeviceManager();