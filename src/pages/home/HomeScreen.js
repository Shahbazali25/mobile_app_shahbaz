import React, {useState, useEffect, useRef} from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AnimatedLottieView from 'lottie-react-native';
import {styles} from '../../components/styles/styles';
import {loadData} from '../../components/auth/loadData';
import FloatingBtn from '../../layouts/navigations/toggleBtn';
import Cameras from '../../layouts/camerasToggle';
import Solars from '../../layouts/solarToggle';
import webSocketService from '../../components/services/socketConnection';
import errorMessage from '../../components/utils/errorMessage';
import infoMessage from '../../components/utils/infoMessage';

function HomeScreen({screenType, setScreenType}) {
  const animation = useRef(null);
  const [isLoading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    animation.current?.play();
    const fetchData = async () => {
      try {
        const response = await loadData();
        setUserData(response);
        // console.log('UserData:', response);
      } catch (error) {
        errorMessage(
          'Unauthorized',
          'Unexpected Error, Try your internet connection and then try again.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    webSocketService
      .connect()
      .then(() => {
        setupSocketListeners();
      })
      .catch(err => {
        // console.error('Failed to connect to socket:', err);
      });
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const setupSocketListeners = () => {
    // console.log('Setting up alert listeners...');
    webSocketService.on('alert', data => {
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        parsedData.type === 'camera_delete'
          ? errorMessage(
              parsedData.title || 'Alerts',
              parsedData.description || 'New alert received.',
            )
          : infoMessage(
              parsedData.title || 'Alerts',
              parsedData.description || 'New alert received.',
            );
      } catch (error) {
        // console.error('Error parsing alert data:', error);
      }
    });
  };

  if (isLoading && screenType === 'Surveillance') {
    return (
      <View style={customStyles.container}>
        <StatusBar
          barStyle="dark-content" // or "light-content" depending on background
          backgroundColor="#fff" // match your loader bg color
          translucent={false} // ensures it’s visible
          hidden={false} // 👈 explicitly show it
        />
        <AnimatedLottieView
          ref={animation}
          source={require('../../assets/animations/camera-animation.json')}
          style={customStyles.animation}
          autoPlay={true}
          loop
        />
      </View>
    );
  } else if (isLoading && screenType === 'Solar') {
    return (
      <View style={customStyles.container}>
        <StatusBar
          barStyle="dark-content" // or "light-content" depending on background
          backgroundColor="#fff" // match your loader bg color
          translucent={false} // ensures it’s visible
          hidden={false} // 👈 explicitly show it
        />
        <AnimatedLottieView
          ref={animation}
          source={require('../../assets/animations/solar-animation.json')}
          style={customStyles.animation}
          autoPlay={true}
          loop
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.homeSafeArea}>
      <View style={styles.homeScreenContainer}>
        {screenType === 'Solar' ? (
          <Solars userData={userData} />
        ) : (
          <Cameras userData={userData} />
        )}

        <FloatingBtn
          screen={screenType}
          setScreen={setScreenType}
          bottomOffset={70}
        />
      </View>
    </SafeAreaView>
  );
}

const customStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffff',
  },
  animation: {
    width: 300,
    height: 300,
  },
});

export default HomeScreen;
