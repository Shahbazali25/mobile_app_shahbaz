import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const deleteRecording = async recording_id => {
  try {
    const auth = await loadData();
    console.log('AUTH DATA', auth);
    const token = auth.access_token;
    console.log('TOKEN:', token);
    if (!token) {
      throw new Error('❌ Unauthorized: No token found');
    }

    console.log(
      '🔍 Detelting zone from:',
      `${baseURL}/device-recordings/${deviceId}/${recording_id}`,
    );

    const response = await fetch(
      `${baseURL}/device-recordings/${deviceId}/${recording_id}`,
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    console.log(response);

    const deleted = await response.json();
    console.log(deleted);

    if (deleted.data.status !== 200) {
      throw new Error('Invalid API response: Expected zone to create');
    }

    console.log('✅ Zone Deleted:', deleted.data);
    return deleted.data;
  } catch (error) {
    console.log('Recording Deletion ERROR:', String(error));
    throw error;
  }
};
