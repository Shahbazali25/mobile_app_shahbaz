import AsyncStorage from '@react-native-async-storage/async-storage';
import webSocketService from '../../services/socketConnection';

export const logoutApi = async () => {
  try {
    await AsyncStorage.removeItem('userData');
    webSocketService.disconnect();
    const data = 'Removed';
    console.log('Logout successful:', data);
    return data;
  } catch (error) {
    throw error;
  }
};
