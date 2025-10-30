import {baseURL, deviceId} from '../../../utils/baseUrl';
import {loadData} from '../../../auth/loadData';

export const stopStream = async camera_id => {
  console.log(camera_id);
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
        commandType: 'stop_stream_relay',
        camera_id: camera_id,
      }),
    });

    const streaming_link = await response.json();
    console.log(streaming_link);

    if (!streaming_link.status === 200) {
      throw new Error('Invalid API response: Expected streaming to stop');
    }

    console.log('✅ Camera Streaming stoped:', streaming_link.status);
    return streaming_link;
  } catch (error) {
    console.log('STREAMING STOPING ERROR:', String(error));
    throw error;
  }
};
