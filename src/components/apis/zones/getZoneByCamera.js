import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const getZoneByCamera = async cameraId => {
  try {
    const auth = await loadData();
    console.log('AUTH DATA', auth);
    const token = auth.access_token;
    console.log('TOKEN:', token);
    if (!token) {
      throw new Error('❌ Unauthorized: No token found');
    }

    console.log(
      '🔍 Fetching zones from:',
      `${baseURL}/device-zone/camera-zone/${deviceId}/${cameraId}`,
    );

    const response = await fetch(
      baseURL + `/device-zone/camera-zone/${deviceId}/${cameraId}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const cameraZone = await response.json();
    console.log(cameraZone);

    if (!cameraZone.data.status === 200) {
      throw new Error('No Zone Found of camera');
    }

    console.log('✅ Zones Fetched:', cameraZone.data);
    console.log('✅ Zones Fetched Detail:', cameraZone.data.zone);
    return cameraZone.data.zone;
  } catch (error) {
    console.log('Zones FETCHING ERROR:', String(error));
    throw error;
  }
};
