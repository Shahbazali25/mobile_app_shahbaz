import React, {useState, useEffect, useRef} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {View, ActivityIndicator, Keyboard} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import SplashScreen from './src/pages/onboarding/SplashScreen';
import Signup from './src/pages/onboarding/authentication/Signup';
import ViewCamera from './src/pages/home/ViewCamera';
import {checkUser} from './src/components/auth/auth';
import LoginV2 from './src/pages/onboarding/authentication/Login-v2';
import ForgetPassword from './src/pages/onboarding/authentication/ForgetPassword';
import VerifyResetCode from './src/pages/onboarding/authentication/VerifyResetCode';
import NewPassword from './src/pages/onboarding/authentication/NewPassword';
import HomeScreen from './src/pages/home/HomeScreen';
import CameraScreen from './src/pages/home/CameraScreen';
import ProfileScreen from './src/pages/home/ProfileScreen';
import BottomNav from './src/layouts/navigations/bottomNav';
import Notifications from './src/pages/home/Notifications';
import AddCamera from './src/pages/home/AddCamera';
import UpdateCamera from './src/pages/home/UpdateCamera';
import RealTimeAlertsCamera from './src/pages/home/RealTimeAlertsCamera';
import MotionDetectionCamera from './src/pages/home/MotionDetectionCamera';
import AddCameraZone from './src/pages/home/AddCameraZone';
import AssignCameraZone from './src/pages/home/AssignCameraZone';
import EditUserProfile from './src/pages/home/EditUserProfile';
import ZonesConfiguration from './src/pages/home/ZonesConfiguration';
import UpdateZone from './src/pages/home/UpdateZone';
import Recordings from './src/pages/home/Recordings';
import RecordingPage from './src/pages/home/RecordingPage';
import SensorSetup from './src/pages/home/SensorsSetup';
import AddSensor from './src/pages/home/AddSensor';
import AssignSensorZone from './src/pages/home/AssignSensorZone';
import UpdateSensor from './src/pages/home/UpdateSensor';
import ModesConfiguration from './src/pages/home/ModesConfiguration';
import UpdateMode from './src/pages/home/UpdateMode';
import AccountManagement from './src/pages/home/AccountManagement';
import AddUser from './src/pages/home/AddUser';
import FullViewStream from './src/pages/home/FullViewCamera';
import EditUser from './src/pages/home/EditUser';

// Add Solar-related screens (you'll need to create these)
import GridInteraction from './src/pages/solar/GridInteraction';

import BatteryManagement from './src/pages/solar/BatteryManagement';
import SolarSettings from './src/pages/solar/SolarSettings';
import SolarProduction from './src/pages/solar/SolarProduction';

const Stack = createNativeStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState('Splash');
  const [isLoading, setLoading] = useState(true);
  const [currentRoute, setCurrentRoute] = useState('');
  const [screenType, setScreenType] = useState('Surveillance'); // Default to Camera/Surveillance
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const navigationRef = useRef(null);
  
  useEffect(() => {
    checkUser(setLoading, setInitialRoute);
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const hideBottomNavScreens = ['Splash', 'Login', 'Signup', 'FullViewStream', 'ForgetPassword', 'VerifyResetCode', 'NewPassword'];

  const shouldShowBottomNav = () => {
    return !hideBottomNavScreens.includes(currentRoute) && !isKeyboardVisible;
  };

  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={{flex: 1, backgroundColor:'white'}}>
      <NavigationContainer
        ref={navigationRef}
        onStateChange={() => {
          const currentRouteName =
          // @ts-ignore
            navigationRef.current?.getCurrentRoute()?.name;
          console.log('Navigation changed to:', currentRouteName);
          setCurrentRoute(currentRouteName);
        }}
        onReady={() => {
          const initialRouteName =
           // @ts-ignore
            navigationRef.current?.getCurrentRoute()?.name;
          console.log('Navigation ready, initial route:', initialRouteName);
          setCurrentRoute(initialRouteName);
        }}>
        <Stack.Navigator initialRouteName={initialRoute}>
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Login"
            component={LoginV2}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="ForgetPassword"
            component={ForgetPassword}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="VerifyResetCode"
            component={VerifyResetCode}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="NewPassword"
            component={NewPassword}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Signup"
            component={Signup}
            options={{headerShown: false}}
          />
          
          {/* Pass screenType and setScreenType to HomeScreen */}
          <Stack.Screen
            name="Home"
            options={{headerShown: false}}>
            {(props) => (
              <HomeScreen 
                {...props} 
                screenType={screenType} 
                setScreenType={setScreenType} 
              />
            )}
          </Stack.Screen>

          {/* Camera/Surveillance related screens */}
          <Stack.Screen
            name="Cameras"
            component={CameraScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Recordings"
            component={Recordings}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="ViewCamera"
            component={ViewCamera}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AddCamera"
            component={AddCamera}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="UpdateCamera"
            component={UpdateCamera}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="RealTimeAlertsCamera"
            component={RealTimeAlertsCamera}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="MotionDetection"
            component={MotionDetectionCamera}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AddCameraZone"
            component={AddCameraZone}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AssignCameraZone"
            component={AssignCameraZone}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="ZonesConfiguration"
            component={ZonesConfiguration}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="UpdateZone"
            component={UpdateZone}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="RecordingPage"
            component={RecordingPage}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="SensorSetup"
            component={SensorSetup}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AddSensor"
            component={AddSensor}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AssignSensorZone"
            component={AssignSensorZone}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="UpdateSensor"
            component={UpdateSensor}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="ModesConfiguration"
            component={ModesConfiguration}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="UpdateMode"
            component={UpdateMode}
            options={{headerShown: false}}
          />

          {/* Solar related screens */}
          <Stack.Screen
            name="GridInteraction"
            component={GridInteraction}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="SolarProduction"
            component={SolarProduction}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="BatteryManagement"
            component={BatteryManagement}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="SolarSettings"
            component={SolarSettings}
            options={{headerShown: false}}
          />

          {/* Common screens */}
          <Stack.Screen
            name="My Profile"
            component={ProfileScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Notifications"
            component={Notifications}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="EditUserProfile"
            component={EditUserProfile}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AccountManagement"
            component={AccountManagement}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="AddUser"
            component={AddUser}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="FullViewStream"
            component={FullViewStream}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="EditUser"
            component={EditUser}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
        
        {/* Pass screenType to BottomNav */}
        {shouldShowBottomNav() && (
          <BottomNav 
            currentRoute={currentRoute} 
            screenType={screenType} 
          />
        )}
      </NavigationContainer>

      <Toast />
    </View>
  );
}