import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const getAllModes = async () => {
  try {
    const auth = await loadData();
    const token = auth.access_token;
    if (!token) {
      throw new Error('❌ Unauthorized: No token found');
    }
    const response = await fetch(baseURL + `/device-mode/modes/${deviceId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!data?.data?.data?.status === 200) {
      console.error('Invalid API response:', data);
      throw new Error(
        'Invalid API response: Expected an array of modes within data.modes',
      );
    }

    console.log(data);

    const modes = data.data.data.modes.map(mode => ({
      id: mode.id,
      name: mode.name,
      linkedCameras: mode.linkedCameras || [],
      linkedSensors: mode.linkedSensors || [],
      cameraCount: mode.linkedCameras ? mode.linkedCameras.length : 0,
      sensorsCount: mode.linkedSensors ? mode.linkedSensors.length : 0,
      img:
        mode.name === 'Arm Home'
          ? require('../../../assets/imgs/icons/sun.png')
          : mode.name === 'Arm Away'
          ? require('../../../assets/imgs/icons/shield.png')
          : require('../../../assets/imgs/icons/car.png'),
    }));

    return modes;
  } catch (error) {
    throw error;
  }
};
