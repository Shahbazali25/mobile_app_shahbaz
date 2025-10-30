import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const getAllZones = async () => {
  try {
    const auth = await loadData();
    // console.log('AUTH DATA', auth);
    const token = auth.access_token;
    // console.log('TOKEN:', token);
    if (!token) {
      throw new Error('❌ Unauthorized: No token found');
    }


    const response = await fetch(baseURL + `/device-zone/zones/${deviceId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const zones = await response.json();
    // console.log(zones);

    if (!zones.data) {
      throw new Error('No Zones Found');
    }

    // console.log('✅ Zones Fetched:', zones.data);
    // console.log('✅ Zones Fetched Detail:', zones.data.data);
    return zones.data.data.zones.map(zone => ({
      id: zone.id ?? 'Undefined',
      name: zone.name || 'Unnamed Zone',
      type: zone.type || 'office',
      description: zone.description || 'Description',
      cameraCount: zone.cameras ? zone.cameras.length : 0,
      sensorsCount: zone.sensors ? zone.sensors.length : 0,
      sensors: zone.sensors,
    }));
  } catch (error) {
    // console.log('Zones FETCHING ERROR:', String(error));
    throw error;
  }
};
