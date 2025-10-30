import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const getSensorByZone = async zoneId => {
  try {
    const auth = await loadData();
    const token = auth.access_token;
    if (!token) {
      throw new Error('❌ Unauthorized: No token found');
    }

    const response = await fetch(
      baseURL + `/device-zone/sensors-by-zone/${deviceId}/${zoneId}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const sensorZone = await response.json();

    if (sensorZone.data.status !== 200) {
      throw new Error('No Zone Found of Sensor');
    }

    return sensorZone.data.data.sensors.map(sensor => {
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
      };
    });
  } catch (error) {
    throw error;
  }
};
