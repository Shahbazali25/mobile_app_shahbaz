import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const createSensor = async (
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

    console.log('🔍 Fetching camera from:', `${baseURL}/device-zone/sensors`);

    const response = await fetch(baseURL + '/device-zone/sensors', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        deviceId: deviceId,
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
    });

    const zones = await response.json();
    console.log(zones);

    if (!zones.status === 200) {
      throw new Error('Invalid API response: Expected camera to create');
    }

    console.log('✅ Camera Created:', zones);
    return zones;
  } catch (error) {
    console.log('ZONES CREATION ERROR:', String(error));
    throw error;
  }
};
