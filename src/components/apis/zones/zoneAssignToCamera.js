import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const zoneAssignToCamera = async (zoneId, cameraId) => {
  console.log(zoneId);
  try {
    const auth = await loadData();
    console.log('AUTH DATA', auth);
    const token = auth.access_token;
    console.log('TOKEN:', token);
    if (!token) {
      throw new Error('❌ Unauthorized: No token found');
    }

    console.log(
      '🔍 Creating camera zone from:',
      `${baseURL}/device-zone/camera-zone`,
    );

    const response = await fetch(baseURL + '/device-zone/camera-zone', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        deviceId: deviceId,
        zoneId: String(zoneId),
        cameraId: cameraId,
      }),
    });

    const zone = await response.json();
    console.log(zone);

    if (!zone.status === 200) {
      throw new Error(
        'Invalid API response: Expected zone to assign to camera',
      );
    }

    console.log('✅ Zone Assigned:', zone.data.message);
    return zone;
  } catch (error) {
    console.log('ZONE ASSIGNING ERROR:', String(error));
    throw error;
  }
};
