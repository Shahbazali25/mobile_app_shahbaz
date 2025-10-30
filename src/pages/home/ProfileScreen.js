import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AnimatedLottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import {useNavigation} from '@react-navigation/native';
import DangerBtn from '../../layouts/buttons/dangerBtn';
import {logoutApi} from '../../components/apis/authentication/logutApi';
import NavBar from '../../layouts/navigations/navbar';
import {loadData} from '../../components/auth/loadData';
import {checkUserRole} from '../../components/utils/checkRole';
import errorMessage from '../../components/utils/errorMessage';

function ProfileScreen() {
  const animation = useRef();
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();

  useEffect(() => {
    animation.current?.play();
    userDetails();
  }, []);

  const userDetails = async () => {
    try {
      const user = await loadData();
      const role = await checkUserRole();
      setUserRole(role);
      setUser(user);
    } catch (error) {
      errorMessage('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  const signout = async () => {
    try {
      const response = await logoutApi();
      navigation.navigate('Login');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: error.message,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <AnimatedLottieView
          ref={animation}
          source={require('../../assets/animations/loading.json')}
          style={styles.animation}
          autoPlay={true}
          loop
        />
      </View>
    );
  }

  return (
    // make this page scrollable
    <SafeAreaView style={{flex: 1, backgroundColor: '#FFFFFF'}}>
      <StatusBar translucent={false} backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        {/* add some margin to the right side of NavBar */}
        <View style={{marginRight: 25}}>
          <NavBar Content="Settings" BackAction="Home" showThirdBtn={false} />
        </View>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.form}>
            <TouchableOpacity style={styles.profileContainer}>
              <Image
                source={require('../../assets/imgs/profile-pic.jpg')}
                style={styles.profileImage}
              />
            </TouchableOpacity>
            <Text
              style={{
                alignSelf: 'center',
                fontFamily: 'Poppins-Medium',
                marginVertical: 6,
              }}>
              {user && `${user.firstName} ${user.lastName}`}{' '}
              <Text
                style={{
                  fontFamily: 'Poppins-Italic',
                  fontSize: 13,
                  color: 'gray',
                }}>
                (
                {userRole === 0
                  ? 'Admin'
                  : userRole === 1
                  ? 'Sensors Viewer'
                  : userRole === 2
                  ? 'Sensors Manager'
                  : userRole === 3
                  ? 'Camera Viewer'
                  : userRole === 4
                  ? 'Camera Manager'
                  : userRole === 5
                  ? 'Basic User'
                  : 'Unknown Role'}
                )
              </Text>
            </Text>

            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderWidth: 1,
                borderColor: 'gray',
                borderRadius: 10,
                marginVertical: 10,
              }}>
              {userRole === 0 && (
                <TouchableOpacity
                  style={{
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onPress={() =>
                    navigation.navigate('EditUserProfile', {
                      id: user.id,
                      firstName: user.firstName,
                      lastName: user.lastName,
                      email: user.email,
                    })
                  }>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={require('../../assets/imgs/icons/user-pen.png')}
                      style={{width: 25, height: 25, marginHorizontal: 14}}
                    />
                    <Text style={{fontFamily: 'Poppins-Regular', fontSize: 13}}>
                      Edit Profile
                    </Text>
                  </View>
                  <Image
                    source={require('../../assets/imgs/icons/angle-small-right.png')}
                    style={{width: 16, height: 16, marginHorizontal: 14}}
                  />
                </TouchableOpacity>
              )}
              {userRole === 0 && (
                <TouchableOpacity
                  style={{
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onPress={() => navigation.navigate('ZonesConfiguration')}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={require('../../assets/imgs/icons/land-layers.png')}
                      style={{width: 25, height: 25, marginHorizontal: 14}}
                    />
                    <Text style={{fontFamily: 'Poppins-Regular', fontSize: 13}}>
                      Zones Configuration
                    </Text>
                  </View>
                  <Image
                    source={require('../../assets/imgs/icons/angle-small-right.png')}
                    style={{width: 16, height: 16, marginHorizontal: 14}}
                  />
                </TouchableOpacity>
              )}
              {(userRole === 0 || userRole === 2 || userRole === 1) && (
                <TouchableOpacity
                  style={{
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onPress={() => navigation.navigate('SensorSetup')}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={require('../../assets/imgs/icons/sensor-alert.png')}
                      style={{width: 25, height: 25, marginHorizontal: 14}}
                    />
                    <Text style={{fontFamily: 'Poppins-Regular', fontSize: 13}}>
                      Sensors Setup
                    </Text>
                  </View>
                  <Image
                    source={require('../../assets/imgs/icons/angle-small-right.png')}
                    style={{width: 16, height: 16, marginHorizontal: 14}}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={{
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'row',
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
                onPress={() => navigation.navigate('ModesConfiguration')}>
                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={require('../../assets/imgs/icons/dark-mode.png')}
                    style={{width: 25, height: 25, marginHorizontal: 14}}
                  />
                  <Text style={{fontFamily: 'Poppins-Regular', fontSize: 13}}>
                    Modes Setup
                  </Text>
                </View>

                <Image
                  source={require('../../assets/imgs/icons/angle-small-right.png')}
                  style={{width: 16, height: 16, marginHorizontal: 14}}
                />
              </TouchableOpacity>
              {userRole === 0 && (
                <TouchableOpacity
                  style={{
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onPress={() => navigation.navigate('AccountManagement')}>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={require('../../assets/imgs/icons/users.png')}
                      style={{width: 25, height: 25, marginHorizontal: 14}}
                    />
                    <Text style={{fontFamily: 'Poppins-Regular', fontSize: 13}}>
                      Accounts Management
                    </Text>
                  </View>

                  <Image
                    source={require('../../assets/imgs/icons/angle-small-right.png')}
                    style={{width: 16, height: 16, marginHorizontal: 14}}
                  />
                </TouchableOpacity>
              )}
            </View>
            <DangerBtn onClickMethod={signout} Content={'Logout'} />
            <View
              style={{
                alignItems: 'center',
                marginTop: '5%',
                paddingVertical: '5%',
              }}>
              <Text
                style={{
                  fontFamily: 'Poppins-Regular',
                  fontSize: 13,
                  fontStyle: 'italic',
                  color: '#0315319c',
                  marginBottom: -8,
                }}>
                Powered by
              </Text>
              <Image
                source={{
                  uri: 'https://ibexvision.ai/assets/Updatelogo-8vB67Jtk.png',
                }}
                style={{
                  width: 120,
                  height: 40,
                  resizeMode: 'contain',
                }}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 200,
    height: 200,
  },
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  profileContainer: {
    width: 100,
    height: 100,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'white',
    alignSelf: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    marginVertical: 10,
    paddingHorizontal: 40,
  },
});

export default ProfileScreen;
