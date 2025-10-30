import AsyncStorage from '@react-native-async-storage/async-storage';

export const loadData = async () => {
  try {
    const userDataString = await AsyncStorage.getItem('userData');

    if (userDataString) {
      const userData = JSON.parse(userDataString);
      return userData;
    }
  } catch (error) {
    throw error;
  }
};
