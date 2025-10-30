import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const createCamera = async (
  name,
  mac,
  host,
  username,
  password,
  authToken,
  streamInputPath,
  streamKey,
) => {
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
        commandType: 'camera_create',
        body: {
          name: name,
          host: host,
          mac: mac,
          username: username,
          password: password,
          authToken: authToken,
          streamInputPath: streamInputPath,
          streamKey: streamKey,
          is_virtual: false,
          port: 554,
        },
      }),
    });

    const cameras = await response.json();
    console.log(cameras);

    if (!cameras.status === 200) {
      throw new Error('Invalid API response: Expected camera to create');
    }

    const cameraId = cameras.data.network_id;
    console.log;
    const bindingResponse = await fetch(baseURL + '/device/bind-camera', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        deviceId: deviceId,
        sensorId: 1,
        cameraId: cameraId,
      }),
    });

    console.log(bindingResponse);

    if (!bindingResponse.status === 200) {
      throw new Error('Invalid API response: Expected camera to bind');
    }

    console.log('✅ Camera Created:', cameras.data.network_id);
    return cameras;
  } catch (error) {
    console.log('CAMERAS CREATION ERROR:', String(error));
    throw error;
  }
};
