import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const deleteZone = async zoneId => {
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
      `${baseURL}/device-zone/zones/${deviceId}/${zoneId}`,
    );

    const response = await fetch(`${baseURL}/device-zone/zones/${deviceId}/${zoneId}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const zone = await response.json();
    console.log(zone);

    if (zone.data.status !== 200) {
      throw new Error('Invalid API response: Expected zone to create');
    }

    console.log('✅ Zone Deleted:', zone.data);
    return zone.data;
  } catch (error) {
    console.log('ZONE ASSIGNING ERROR:', String(error));
    throw error;
  }
};
