import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const getAllSensors = async () => {
  try {
    const auth = await loadData();
    // console.log('AUTH DATA', auth);
    const token = auth.access_token;
    // console.log('TOKEN:', token);
    if (!token) {
      throw new Error('❌ Unauthorized: No token found');
    }

    // console.log('🔍 Fetching zones from:', `${baseURL}/device-zone/sensors/1`);

    const response = await fetch(baseURL + `/device-zone/sensors/${deviceId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const sensors = await response.json();
    console.log(sensors);

    if (!sensors.data.data) {
      throw new Error('No Sensors Found');
    }

    // console.log('✅ Sensors Fetched:', sensors.data);
    // console.log('✅ Sensors Fetched Detail:', sensors.data.data);

    return sensors.data.data.map(sensor => {
      const mqttTopic = sensor.mqttTopic;
      let type = 'Unknown';

      if (mqttTopic) {
        const parts = mqttTopic.split('/');
        if (parts.length > 0) {
          type = parts[parts.length - 1];
        }
      }

      return {
        id: sensor.id ?? 'Undefined',
        name: sensor.name || 'Unnamed Sensor',
        type: type,
        description: sensor.description || 'Description',
        unit: sensor.unit,
        lastReading: sensor.lastReading
          ? `${sensor.lastReading} ${sensor.unit}`
          : `0 ${sensor.unit}`,
        mqttTopic: mqttTopic,
        mqttHost: sensor.mqttHost,
        mqttPort: sensor.mqttPort,
        threshold: sensor.notificationThreshold
      };
    });
  } catch (error) {
    // console.log('Zones FETCHING ERROR:', String(error));
    throw error;
  }
};
