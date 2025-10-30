import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkUserRole = async () => {
  try {
    const userDataString = await AsyncStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      console.log(userData.role);
      return userData.role;
    } else {
      console.log('userData not found in AsyncStorage');
      return 0;
    }
  } catch (error) {
    console.error('Error fetching user role:', error);
    return 0;
  }

  
};
