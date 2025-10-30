import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const removeComponentFromMode = async (modeId, componentType, componentId) => {
  try {
    const auth = await loadData();
    console.log('AUTH DATA', auth);
    const token = auth.access_token;
    console.log('TOKEN:', token);
    if (!token) {
      throw new Error('❌ Unauthorized: No token found');
    }

    const response = await fetch(baseURL + '/device-mode/modes/components/remove', {
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

    const removeFromMode = await response.json();
    console.log(removeFromMode);

    if (!removeFromMode.data.status === 200) {
      throw new Error(
        'Invalid API response: Expected component to assign to mode',
      );
    }

    console.log('✅ Component Assigned:', removeFromMode.data.message);
    return removeFromMode;
  } catch (error) {
    console.log('ZONE ASSIGNING ERROR:', String(error));
    throw error;
  }
};
