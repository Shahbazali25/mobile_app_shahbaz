import React, {useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {checkUserRole} from '../../components/utils/checkRole';

function BottomNav({currentRoute, screenType}) {
  const navigation = useNavigation();
  const [notificationCount, setNotificationCount] = useState();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    retrieveCount();
  }, []);

  const retrieveCount = async () => {
    try {
      const role = await checkUserRole();
      setUserRole(role);
      const countString = await AsyncStorage.getItem('notificationCount');
      if (countString !== null) {
        const count = parseInt(countString, 10);
        setNotificationCount(count);
      }
    } catch (error) {
      console.error('Error retrieving notification count:', error);
    }
  };

  // Icons for Surveillance/Camera mode
  const getCameraIcon = routeName => {
    switch (routeName) {
      case 'Home':
        return currentRoute === 'Home'
          ? require('../../assets/imgs/icons/homeicon.png')
          : require('../../assets/imgs/icons/homeicon-inactive.png');
      case 'Cameras':
        return currentRoute === 'Cameras'
          ? require('../../assets/imgs/icons/camera-cctv-active.png')
          : require('../../assets/imgs/icons/camera-cctv.png');
      case 'Recordings':
        return currentRoute === 'Recordings'
          ? require('../../assets/imgs/icons/clapperboard-play.png')
          : require('../../assets/imgs/icons/clapperboard-play-inactive.png');
      case 'SensorSetup':
        return currentRoute === 'SensorSetup'
          ? require('../../assets/imgs/icons/sensor-active.png')
          : require('../../assets/imgs/icons/sensor-on.png');
      case 'Notifications':
        return currentRoute === 'Notifications'
          ? require('../../assets/imgs/icons/bell-act.png')
          : require('../../assets/imgs/icons/bell-inac.png');
      case 'My Profile':
        return currentRoute === 'My Profile'
          ? require('../../assets/imgs/icons/settings-active.png')
          : require('../../assets/imgs/icons/settings-inactive.png');
      default:
        return require('../../assets/imgs/icons/home-icon.png');
    }
  };

  // Icons for Solar mode (you'll need to add these solar icons to your assets)
  const getSolarIcon = routeName => {
    switch (routeName) {
      case 'Home':
        return currentRoute === 'Home'
          ? require('../../assets/imgs/icons/homeicon.png')
          : require('../../assets/imgs/icons/homeicon-inactive.png');
      case 'GridInteraction':
        return currentRoute === 'GridInteraction'
          ? require('../../assets/imgs/icons/electricity-act.png')
          : require('../../assets/imgs/icons/electricity-inact.png');
      case 'SolarProduction':
        return currentRoute === 'SolarProduction'
          ? require('../../assets/imgs/icons/flash-act.png')
          : require('../../assets/imgs/icons/flash-inact.png');
      case 'BatteryManagement':
        return currentRoute === 'BatteryManagement'
          ? require('../../assets/imgs/icons/battery-inact.png')
          : require('../../assets/imgs/icons/battery-act.png');
      case 'Notifications':
        return currentRoute === 'Notifications'
          ? require('../../assets/imgs/icons/bell-act.png')
          : require('../../assets/imgs/icons/bell-inac.png');
      case 'SolarSettings':
        return currentRoute === 'SolarSettings'
          ? require('../../assets/imgs/icons/settings-active.png')
          : require('../../assets/imgs/icons/settings-inactive.png');
      default:
        return require('../../assets/imgs/icons/home-icon.png');
    }
  };

  const getIcon = routeName => {
    return screenType === 'Solar'
      ? getSolarIcon(routeName)
      : getCameraIcon(routeName);
  };

  const getTextColor = routeName => {
    return currentRoute === routeName ? 'white' : '#8391A4';
  };

  // Render navigation items based on screen type
  const renderCameraNavigation = () => (
    <>
      <TouchableOpacity
        style={styles.fixedButton}
        onPress={() => navigation.navigate('Home')}>
        <Image source={getIcon('Home')} style={styles.fixedButtonImage} />
        <Text
          style={{
            color: getTextColor('Home'),
            fontFamily: 'Poppins-Regular',
            fontSize: Platform.select({ios: 10, android: 10}),
          }}>
          Home
        </Text>
      </TouchableOpacity>

      {(userRole === 0 ||
        userRole === 3 ||
        userRole === 4 ||
        userRole === 5) && (
        <TouchableOpacity
          style={styles.fixedButton}
          onPress={() => navigation.navigate('Cameras')}>
          <Image source={getIcon('Cameras')} style={styles.fixedButtonImage} />
          <Text
            style={{
              color: getTextColor('Cameras'),
              fontFamily: 'Poppins-Regular',
              fontSize: Platform.select({ios: 10, android: 10}),
            }}>
            Cameras
          </Text>
        </TouchableOpacity>
      )}

      {(userRole === 0 ||
        userRole === 2 ||
        userRole === 1 ||
        userRole === 5) && (
        <TouchableOpacity
          style={styles.fixedButton}
          onPress={() => navigation.navigate('SensorSetup')}>
          <Image
            source={getIcon('SensorSetup')}
            style={styles.fixedButtonImage}
          />
          <Text
            style={{
              color: getTextColor('SensorSetup'),
              fontFamily: 'Poppins-Regular',
              fontSize: Platform.select({ios: 10, android: 10}),
            }}>
            Sensors
          </Text>
        </TouchableOpacity>
      )}

      {(userRole === 0 ||
        userRole === 3 ||
        userRole === 4 ||
        userRole === 5) && (
        <TouchableOpacity
          style={styles.fixedButton}
          onPress={() => navigation.navigate('Recordings')}>
          <Image
            source={getIcon('Recordings')}
            style={styles.fixedButtonImage}
          />
          <Text
            style={{
              color: getTextColor('Recordings'),
              fontFamily: 'Poppins-Regular',
              fontSize: Platform.select({ios: 10, android: 10}),
            }}>
            Recordings
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.fixedButton}
        onPress={() => navigation.navigate('Notifications')}>
        <Image
          source={getIcon('Notifications')}
          style={styles.fixedButtonImage}
        />
        {notificationCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notificationCount}</Text>
          </View>
        )}
        <Text
          style={{
            color: getTextColor('Notifications'),
            fontFamily: 'Poppins-Regular',
            fontSize: Platform.select({ios: 10, android: 10}),
          }}>
          Notifications
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fixedButton}
        onPress={() => navigation.navigate('My Profile')}>
        <Image source={getIcon('My Profile')} style={styles.fixedButtonImage} />
        <Text
          style={{
            color: getTextColor('My Profile'),
            fontFamily: 'Poppins-Regular',
            fontSize: Platform.select({ios: 10, android: 10}),
          }}>
          Settings
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderSolarNavigation = () => (
    <>
      <TouchableOpacity
        style={styles.fixedButton}
        onPress={() => navigation.navigate('Home')}>
        <Image source={getIcon('Home')} style={styles.fixedButtonImage} />
        <Text
          style={{
            color: getTextColor('Home'),
            fontFamily: 'Poppins-Regular',
            fontSize: Platform.select({ios: 10, android: 10}),
          }}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fixedButton}
        onPress={() => navigation.navigate('SolarProduction')}>
        <Image
          source={getIcon('SolarProduction')}
          style={styles.fixedButtonImage}
        />
        <Text
          style={{
            color: getTextColor('SolarProduction'),
            fontFamily: 'Poppins-Regular',
            fontSize: Platform.select({ios: 10, android: 10}),
          }}>
          Production
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fixedButton}
        onPress={() => navigation.navigate('GridInteraction')}>
        <Image
          source={getIcon('GridInteraction')}
          style={styles.fixedButtonImage}
        />
        <Text
          style={{
            color: getTextColor('GridInteraction'),
            fontFamily: 'Poppins-Regular',
            fontSize: Platform.select({ios: 10, android: 10}),
          }}>
          Grid
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fixedButton}
        onPress={() => navigation.navigate('BatteryManagement')}>
        <Image
          source={getIcon('BatteryManagement')}
          style={styles.fixedButtonImage}
        />
        <Text
          style={{
            color: getTextColor('BatteryManagement'),
            fontFamily: 'Poppins-Regular',
            fontSize: Platform.select({ios: 10, android: 10}),
          }}>
          Battery
        </Text>
      </TouchableOpacity>
      {/* 
      <TouchableOpacity
        style={styles.fixedButton}
        onPress={() => navigation.navigate('Notifications')}>
        <Image source={getIcon('Notifications')} style={styles.fixedButtonImage} />
        {notificationCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notificationCount}</Text>
          </View>
        )}
        <Text
          style={{
            color: getTextColor('Notifications'),
            fontFamily: 'Poppins-Regular',
            fontSize: Platform.select({ios:10, android:11}),
          }}>
          Notifications
        </Text>
      </TouchableOpacity> */}

      {/* <TouchableOpacity
        style={styles.fixedButton}
        onPress={() => navigation.navigate('SolarSettings')}>
        <Image source={getIcon('SolarSettings')} style={styles.fixedButtonImage} />
        <Text
          style={{
            color: getTextColor('SolarSettings'),
            fontFamily: 'Poppins-Regular',
            fontSize: Platform.select({ios:10, android:11}),
          }}>
          Settings
        </Text>
      </TouchableOpacity> */}
    </>
  );

  return (
    <View style={styles.navbarContainer}>
      {screenType === 'Solar'
        ? renderSolarNavigation()
        : renderCameraNavigation()}
    </View>
  );
}

const styles = StyleSheet.create({
  navbarContainer: {
    position: 'absolute',
    bottom: 7,
    right: 5,
    left: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    backgroundColor: '#1E293B',
    borderRadius: 100,
    padding: 8,
  },
  fixedButton: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  fixedButtonImage: {
    marginTop: 3,
    marginBottom: 1,
    width: Platform.select({ios: 18, android: 21}),
    height: Platform.select({ios: 18, android: 21}),
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: 25,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: Platform.select({ios: 10, android: 10}),
    fontWeight: 'bold',
  },
});

export default BottomNav;
