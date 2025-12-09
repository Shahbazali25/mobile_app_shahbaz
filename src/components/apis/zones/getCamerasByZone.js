import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const getCameraByZone = async zoneId => {
  try {
    const auth = await loadData();
    // console.log('AUTH DATA', auth);
    const token = auth.access_token;
    // console.log('TOKEN:', token);
    if (!token) {
      throw new Error('❌ Unauthorized: No token found');
    }

    const response = await fetch(baseURL + `/device-zone/cameras/${deviceId}/${zoneId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const cameraZone = await response.json();
    // console.log(cameraZone);

    if (cameraZone.data.status !== 200) {
      throw new Error('No Zone Found of camera');
    }

    console.log('✅ Cameras Fetched:', cameraZone.data);
    console.log('✅ Cameras Fetched Detail:', cameraZone.data.data.cameras);
    return cameraZone.data.data.cameras.map(camera => ({
      id: camera.id ?? 'Undefined',
      name: camera.name || 'Unnamed Camera',
      localHls: camera.stream_links?.local?.hls || null,
      cloudHls: camera.stream_links?.cloud?.hls || null,
      network_id: camera.networkId,
    }));
  } catch (error) {
    // console.log('CAMERAS FETCHING ERROR:', String(error));
    throw error;
  }
};
