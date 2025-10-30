import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const updateSensorInfo = async (
  sensorId,
  name,
  description,
  unit,
  type,
  mqttTopic,
  mqttHost,
  mqttPort,
  mqttUsername,
  mqttPassword,
  mqttProtocol,
  dataType,
  active,
  notificationsEnabled,
  notificationThreshold,
  zoneId,
) => {
  try {
    const auth = await loadData();
    console.log('AUTH DATA', auth);
    const token = auth.access_token;
    console.log('TOKEN:', token);
    if (!token) {
      throw new Error('❌ Unauthorized: No token found');
    }

    console.log(
      '🔍 Updating camera from:',
      `${baseURL}/device-zone/sensors/${deviceId}/${sensorId}`,
    );

    const response = await fetch(
      baseURL + `/device-zone/sensors/${deviceId}/${sensorId}`,
      {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name,
          description: description,
          unit,
          mqttHost,
          mqttTopic,
          mqttPort,
          mqttUsername,
          mqttPassword,
          mqttProtocol,
          dataType,
          active,
          notificationThreshold,
          notificationsEnabled,
          zoneId,
        }),
      },
    );

    const sensorUpdate = await response.json();
    console.log(sensorUpdate);

    if (!sensorUpdate.status === 200) {
      throw new Error('Invalid API response: Expected camera to update');
    }

    console.log('✅ Sensor Updated:', sensorUpdate.data);
    return sensorUpdate;
  } catch (error) {
    console.log('Sensors Updation ERROR:', String(error));
    throw error;
  }
};
