import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const addComponentInMode = async (modeId, componentType, componentId) => {
  try {
    const auth = await loadData();
    console.log('AUTH DATA', auth);
    const token = auth.access_token;
    console.log('TOKEN:', token);
    if (!token) {
      throw new Error('❌ Unauthorized: No token found');
    }

    const response = await fetch(baseURL + '/device-mode/modes/components/add', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        deviceId: deviceId,
        modeId: String(modeId),
        componentType: componentType,
        componentId: String(componentId)
      }),
    });

    const addMode = await response.json();
    console.log(addMode);

    if (!addMode.data.status === 200) {
      throw new Error(
        'Invalid API response: Expected component to assign to mode',
      );
    }

    console.log('✅ Component Assigned:', addMode.data.message);
    return addMode;
  } catch (error) {
    console.log('ZONE ASSIGNING ERROR:', String(error));
    throw error;
  }
};
