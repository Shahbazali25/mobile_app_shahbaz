import {baseURL} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const alertStatus = async alertId => {
  console.log(alertId);
  try {
    const auth = await loadData();
    console.log('AUTH DATA', auth);
    const token = auth.access_token;
    console.log('TOKEN:', token);
    if (!token) {
      throw new Error('❌ Unauthorized: No token found');
    }

    console.log(
      '🔍 Fetching cameras from:',
      `${baseURL}/alert/{alertId}/toggle-view`,
    );

    const response = await fetch(baseURL + `/alert/${alertId}/toggle-view`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    console.log('ALERT STatus Updating ERROR:', String(error));
    throw error;
  }
};
