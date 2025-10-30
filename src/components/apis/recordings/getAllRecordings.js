import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const getAllRecordings = async () => {
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
      `${baseURL}/device-recordings/{deviceId}`,
    );

    const response = await fetch(baseURL + `/device-recordings/${deviceId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const recordings = await response.json();

    console.log(recordings);

    if (recordings.data.status !== 200) {
      throw new Error('No Recordings Found');
    }

    console.log('✅ Recordings Fetched:', recordings);
    console.log('✅ Recordings Fetched Detail:', recordings.data.data);

    function formatCreatedAt(createdAtString) {
      if (!createdAtString) {
        return 'Date not available';
      }

      const date = new Date(createdAtString);

      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      const formattedDate = date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const formattedTime = date.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      });

      return `${formattedDate} - ${formattedTime}`;
    }
    return recordings.data.data.data.map(recording => ({
      id: recording.id ?? 'Undefined',
      name: recording.filename || 'Unnamed Recording',
      savedDate: formatCreatedAt(recording.createdAt),
      cameraName: recording.cameraName,
      zoneName: recording.zone?.name
    }));
  } catch (error) {
    console.log('RECORDIINGS FETCHING ERROR:', String(error));
    throw error;
  }
};
