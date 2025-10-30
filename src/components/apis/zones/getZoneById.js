import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const getZoneById = async zoneId => {
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
      `${baseURL}/device-zone/cameras/${deviceId}/${zoneId}`,
    );

    const response = await fetch(baseURL + `/device-zone/cameras/${deviceId}/${zoneId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const cameraZone = await response.json();
    console.log(cameraZone);

    if (cameraZone.data.status !== 200) {
      throw new Error('No Zone Found of camera');
    }

    console.log('✅ Cameras Fetched:', cameraZone.data.data);

    return cameraZone.data.data;
  } catch (error) {
    console.log('CAMERAS FETCHING ERROR:', String(error));
    throw error;
  }
};
