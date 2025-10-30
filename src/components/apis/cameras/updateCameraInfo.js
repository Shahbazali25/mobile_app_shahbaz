import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const updateCameraInfo = async (
  camera_id,
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

    console.log('🔍 Updating camera from:', `${baseURL}/device/command`);

    const response = await fetch(baseURL + '/device/command', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        deviceId: deviceId,
        commandType: 'camera_update',
        camera_id: camera_id,
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
      throw new Error('Invalid API response: Expected camera to update');
    }

    console.log('✅ Camera Updated:', cameras.data);
    return cameras;
  } catch (error) {
    console.log('CAMERAS Updation ERROR:', String(error));
    throw error;
  }
};
