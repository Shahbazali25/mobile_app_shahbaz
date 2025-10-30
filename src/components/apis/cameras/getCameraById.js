import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const getCameraById = async camera_id => {
  try {
    const auth = await loadData();
    console.log('AUTH DATA', auth);
    const token = auth.access_token;
    console.log('TOKEN:', token);
    if (!token) {
      throw new Error('❌ Unauthorized: No token found');
    }

    console.log('🔍 Fetching camera from:', `${baseURL}/device/command`);

    const response = await fetch(baseURL + '/device/command', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        deviceId: deviceId,
        commandType: 'camera_read',
        camera_id: camera_id,
      }),
    });

    const cameras = await response.json();
    console.log(cameras);

    if (!cameras.message) {
      throw new Error('Invalid API response: Expected details of camera');
    }

    console.log('✅ Camera Fetched:', cameras.message);
    return cameras;
  } catch (error) {
    console.log('CAMERAS FETCHING ERROR:', String(error));
    throw error;
  }
};
