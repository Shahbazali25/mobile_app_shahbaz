import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const addZone = async (name, type, description) => {
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
      `${baseURL}/device-zone/zones`,
    );

    const response = await fetch(baseURL + '/device-zone/zones', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        deviceId: deviceId,
        name: name,
        type: type,
        description: description,
      }),
    });

    const zone = await response.json();
    console.log(zone);

    if (!zone.status === 200) {
      throw new Error('Invalid API response: Expected zone to create');
    }

    console.log('✅ Zone Assigned:', zone);
    return zone;
  } catch (error) {
    console.log('ZONE ASSIGNING ERROR:', String(error));
    throw error;
  }
};
