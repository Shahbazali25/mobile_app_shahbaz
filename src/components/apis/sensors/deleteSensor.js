import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const deleteSensor = async sensorId => {
  try {
    const auth = await loadData();
    console.log('AUTH DATA', auth);
    const token = auth.access_token;
    console.log('TOKEN:', token);
    if (!token) {
      throw new Error('❌ Unauthorized: No token found');
    }

    console.log(
      '🔍 Detelting zone from:',
      `${baseURL}/device-zone/sensors/${deviceId}/${sensorId}`,
    );

    const response = await fetch(
      `${baseURL}/device-zone/sensors/${deviceId}/${sensorId}`,
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const sensor = await response.json();
    console.log(sensor);

    if (sensor.data.status !== 200) {
      throw new Error('Invalid API response: Expected zone to create');
    }

    console.log('✅ Zone Deleted:', sensor.data);
    return sensor.data;
  } catch (error) {
    console.log('SENSOR DELETION ERROR:', String(error));
    throw error;
  }
};
