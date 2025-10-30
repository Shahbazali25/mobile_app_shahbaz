import AsyncStorage from '@react-native-async-storage/async-storage';
import {baseURL, deviceId} from '../../utils/baseUrl';

export const loginAPI = async (email, password) => {
  try {
    const response = await fetch(baseURL + '/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email, password}),
    });

    console.log(response);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();

    const getRoleResponse = await fetch(
      baseURL + `/device-user/profile/${deviceId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${response.auth_token}`,
        },
      },
    );

    const getRole = await getRoleResponse.json();
    console.log(getRole);
    if (!getRole.data.status === 200) {
      throw new Error('Getting issue while getting user role');
    }
    console.log(data);
    const newUserData = getRole.data.data;
    const userData = {...newUserData, user_id: data.id, access_token: data.access_token};

    console.log('Login successful:', userData);

    await AsyncStorage.setItem('userData', JSON.stringify(userData));
    return data;
  } catch (error) {
    throw error;
  }
};
