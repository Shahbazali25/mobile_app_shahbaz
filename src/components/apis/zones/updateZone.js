import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const zoneToUpdate = async (name, type, description, zoneId) => {
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
      `${baseURL}/device-zone/zones/${deviceId}/`,
    );

    const response = await fetch(baseURL + `/device-zone/zones/${deviceId}/${zoneId}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: name,
        type: type,
        description: description,
      }),
    });

    console.log(response);

    if (response.status !== 200) {
      throw new Error('Invalid API response: Expected zone to create');
    }

    console.log('✅ Zone Assigned:', response);
    return response;
  } catch (error) {
    console.log('ZONE ASSIGNING ERROR:', String(error));
    throw error;
  }
};
