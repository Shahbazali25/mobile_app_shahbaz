import {baseURL, deviceId} from '../../../utils/baseUrl';
import {loadData} from '../../../auth/loadData';

export const disableDetection = async camera_id => {
  try {
    const auth = await loadData();
    const token = auth.access_token;
    if (!token) {
      throw new Error('❌ Unauthorized: No token found');
    }

    const response = await fetch(
      baseURL + `/device-detection/disable/${deviceId}/${camera_id}`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const status = await response.json();
    console.log(status);

    if (!status.data.status === 200) {
      throw new Error('Invalid API response: Expected details of camera');
    }

    console.log('✅ Camera Fetched:', status.data);
    return status.data.status;
  } catch (error) {
    console.log('MOTION DETECTION STATUS FETCHING ERROR:', String(error));
    throw error;
  }
};
