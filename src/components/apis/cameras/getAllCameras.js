import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const getAllCameras = async () => {
  try {
    const auth = await loadData();
    // console.log('AUTH DATA', auth);
    const token = auth.access_token;
    // console.log('TOKEN:', token);
    if (!token) {
      throw new Error('❌ Unauthorized: No token found');
    }

    // console.log('🔍 Fetching cameras from:', `${baseURL}/device/command`);

    const response = await fetch(baseURL + '/device/command', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        deviceId: deviceId,
        commandType: 'fetch_cameras',
      }),
    });

    const cameras = await response.json();
    console.log(cameras);

    if (!cameras.data) {
      throw new Error('Invalid API response: Expected an array of cameras');
    }

    // console.log('✅ Cameras Fetched:', cameras.data);
    return cameras.data.map(camera => ({
      id: camera.id ?? 'Undefined',
      name: camera.name || 'Unnamed Camera',
      status: camera.isActive ? 'Online' : 'Offline',
      localHls: camera.stream_links?.local?.hls || null,
      cloudHls: camera.stream_links?.cloud?.hls || null,
      network_id: camera.network_id,
    }));
  } catch (error) {
    // console.log('CAMERAS FETCHING ERROR:', String(error));
    throw error;
  }
};
