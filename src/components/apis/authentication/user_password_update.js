import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseURL} from '../../utils/baseUrl';

export const user_password_updateAPI = async (old_password, new_password) => {
  try {
    console.log('Changing password with:', {old_password, new_password});
    const response = await fetch(baseURL + '/user/change-pass', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({old_password, new_password}),
    });

    const data = await response.json();

    if (!response.ok) {
      // const errorData = await response.json();
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    console.log('User password updated:', data);
    // Optionally update AsyncStorage if the API returns updated user data
    if (data.user) {
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));
    }
    // 💡 HERE: add your custom success tag
    if (response.ok && response.status === 200) {
      data.status = 'success';
    }
    return data;
  } catch (error) {
    console.log('API Error:', error);
    throw error;
  }
};
