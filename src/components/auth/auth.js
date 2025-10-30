import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkUser = async (setLoading, setInitialRoute) => {
  try {
    const userDataString = await AsyncStorage.getItem('userData');
    console.log('userDataString:', userDataString);

    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        console.log('userData:', userData);
        setInitialRoute('Home');
      } catch (parseError) {
        console.error('Error parsing userData:', parseError);

        setInitialRoute('Splash');
      }
    } else {
      console.log('No userData found.');
      setInitialRoute('Splash');
    }
  } catch (error) {
    console.error('Error in checkUser:', error);
    setInitialRoute('Splash');
  } finally {
    setLoading(false);
  }
};
