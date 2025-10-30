import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseURL} from '../../utils/baseUrl';

export const user_profile_updateAPI = async (
  id,
  email,
  firstName,
  lastName,
) => {
  try {
    console.log('Updating profile with:', {id, email, firstName, lastName});

    const response = await fetch(`${baseURL}/user/`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({id, email, firstName, lastName}),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    console.log('User profile updated:', data);

    // ✅ Save updated user data if returned by API
    await AsyncStorage.setItem('userData', JSON.stringify(data));

    return data; // Return parsed JSON
  } catch (error) {
    console.log('API Error:', error);
    throw error;
  }
};
