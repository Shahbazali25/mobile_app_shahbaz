import {baseURL} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getCameraNotifications = async () => {
  try {
    const auth = await loadData();
    const token = auth.access_token;
    if (!token) {
      throw new Error('❌ Unauthorized: No token found');
    }

    const response = await fetch(baseURL + '/alert/customer', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const notifications = await response.json();
    if (
      !notifications ||
      !notifications.data ||
      !Array.isArray(notifications.data)
    ) {
      throw new Error('Unexpected error while fetching notifications');
    }

    if (notifications && notifications.data) {
      const count = notifications.data.filter(item => item.view === 1).length;
      try {
        await AsyncStorage.setItem('notificationCount', count.toString());
      } catch (error) {
        console.error(error);
      }
    }
    return notifications;
  } catch (error) {
    console.log('CAMERAS NOTIFICATIONS FETCHING ERROR:', String(error));
    throw error;
  }
};
