import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AnimatedLottieView from 'lottie-react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import PrimaryBtn from '../../layouts/buttons/primaryBtn';
import NavBar from '../../layouts/navigations/navbar';
import {updateUserProfile2} from '../../components/apis/users/updateUserProfile2';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {user_profile_updateAPI} from '../../components/apis/authentication/user_profile_update';
import {user_password_updateAPI} from '../../components/apis/authentication/user_password_update';

function EditUserProfile() {
  const animation = useRef(null);
  const route = useRoute();
  const navigation = useNavigation();

  const [password, setPassword] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState(route?.params?.firstName);
  const [lastName, setLastName] = useState(route?.params?.lastName);
  const [email, setEmail] = useState(route?.params?.email);
  // Security State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI State
  const [screenState, setScreenState] = useState('Profile Setup');
  useEffect(() => {
    animation.current?.play();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar
          barStyle="dark-content" // or "light-content" depending on background
          backgroundColor="#fff" // match your loader bg color
          translucent={false} // ensures it’s visible
          hidden={false} // 👈 explicitly show it
        />
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

  const updateProfile = async () => {
    console.log('Updating profile with:', {
      email,
      firstName,
      lastName,
      id: route?.params?.id,
    });
    // if (!firstName.trim() || !lastName.trim() || !email.trim()) {
    //   Alert.alert('Error', 'Please fill in all fields');
    //   return;
    // }
    setLoading(true);
    try {
      console.log('Updating profile with:', {
        email,
        firstName,
        lastName,
        id: route?.params?.id,
      });
      const data = await user_profile_updateAPI(
        route?.params?.id,
        email,
        firstName,
        lastName,
      );
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Update Profile Error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Change Password API Call
  const changePassword = async () => {
    if (!oldPassword.trim() || !newPassword.trim()) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const data = await user_password_updateAPI(oldPassword, newPassword);

      Alert.alert('Success', 'Password changed successfully');
      setOldPassword('');
      setNewPassword('');

      if (data.user) {
        Alert.alert('Success', 'Password changed successfully');
        // Clear password fields
        setOldPassword('');
        setNewPassword('');
      } else {
        Alert.alert('Error', data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change Password Error:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Save Button Click - Routes to correct function based on screenState
  const handleSaveChanges = () => {
    console.log('Handling save changes for state:', screenState);
    if (screenState === 'Profile Setup') {
      updateProfile();
    } else {
      changePassword();
    }
  };

  const changeState = state => {
    setScreenState(state);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#1E293B'}}>
      <StatusBar translucent={false} backgroundColor="#1E293B" />
      <View style={styles.container}>
        <NavBar
          Content="Edit Profile"
          BackAction="My Profile"
          showThirdBtn={false}
        />

        <View
          style={{
            display: 'flex',
            alignSelf: 'stretch',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#455266ff',
            borderRadius: 30,
            padding: 6,
            marginVertical: 20,
            marginHorizontal: 5,
          }}>
          <TouchableOpacity
            style={
              screenState === 'Security'
                ? {borderRadius: 20, width: '50%'}
                : {
                    backgroundColor: 'white',
                    color: 'black',
                    borderRadius: 20,
                    width: '50%',
                    borderWidth: 0.5,
                    borderColor: 'lightgray',
                  }
            }
            onPress={() => changeState('Profile Setup')}>
            <Text
              style={
                screenState === 'Profile Setup'
                  ? {
                      fontFamily: 'Poppins-Medium',
                      alignSelf: 'center',
                      paddingVertical: 10,
                      color: '#000000ff',
                    }
                  : {
                      fontFamily: 'Poppins-Medium',
                      alignSelf: 'center',
                      paddingVertical: 10,
                      color: '#ffff',
                    }
              }>
              Profile Setup
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={
              screenState === 'Profile Setup'
                ? {borderRadius: 20, width: '50%'}
                : {
                    backgroundColor: 'white',
                    color: 'black',
                    borderRadius: 20,
                    width: '50%',
                    borderWidth: 0.5,
                    borderColor: 'lightgray',
                  }
            }
            onPress={() => changeState('Security')}>
            <Text
              style={
                screenState === 'Profile Setup'
                  ? {
                      fontFamily: 'Poppins-Medium',
                      alignSelf: 'center',
                      paddingVertical: 10,
                      color: '#ffffffff',
                    }
                  : {
                      fontFamily: 'Poppins-Medium',
                      alignSelf: 'center',
                      paddingVertical: 10,
                      color: '#000000ff',
                    }
              }>
              Security
            </Text>
          </TouchableOpacity>
        </View>

        {screenState === 'Profile Setup' ? (
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={{flex: 0.27, marginTop: 10}}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}>
                <TouchableOpacity style={styles.profileContainer}>
                  <Image
                    source={require('../../assets/imgs/profile-pic.jpg')}
                    style={styles.profileImage}
                  />
                  <Image
                    source={require('../../assets/imgs/icons/circle-camera.png')}
                    style={styles.cameraIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.form}>
              <View style={styles.inputFields}>
                <Text
                  aria-label="Label for Username"
                  nativeID="labelUsername"
                  style={styles.formLabel}>
                  First name
                </Text>
                <TextInput
                  aria-label="input"
                  aria-labelledby="labelUsername"
                  style={styles.formInputText}
                  value={firstName}
                  onChangeText={setFirstName}
                  allowFontScaling={false}
                />
              </View>
              <View style={styles.inputFields}>
                <Text
                  aria-label="Label for Username"
                  nativeID="labelUsername"
                  style={styles.formLabel}>
                  Last Name
                </Text>
                <TextInput
                  aria-label="input"
                  aria-labelledby="labelUsername"
                  style={styles.formInputText}
                  value={lastName}
                  onChangeText={setLastName}
                  allowFontScaling={false}
                />
              </View>
              <View style={styles.inputFields}>
                <Text
                  aria-label="Label for Username"
                  nativeID="labelUsername"
                  style={styles.formLabel}>
                  Email
                </Text>
                <TextInput
                  aria-label="input"
                  aria-labelledby="labelUsername"
                  // add a style to make marginBottom 20
                  style={[styles.formInputText, {marginBottom: 20}]}
                  value={email}
                  onChangeText={setEmail}
                  allowFontScaling={false}
                />
              </View>

              <PrimaryBtn
                style={{marginTop: 40, marginBottom: 40}}
                onClickMethod={handleSaveChanges}
                Content={'Save Changes'}
              />
            </View>
          </ScrollView>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.form}>
              <View style={styles.inputFields}>
                <Text
                  aria-label="Label for Username"
                  nativeID="labelUsername"
                  style={styles.formLabel}>
                  Old Password
                </Text>
                <TextInput
                  aria-label="input"
                  aria-labelledby="labelUsername"
                  style={styles.formInputText}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  allowFontScaling={false}
                />
              </View>
              <View style={styles.inputFields}>
                <Text
                  aria-label="Label for Username"
                  nativeID="labelUsername"
                  style={styles.formLabel}>
                  New Password
                </Text>
                <TextInput
                  aria-label="input"
                  aria-labelledby="labelUsername"
                  // add a style to make marginBottom 20
                  style={[styles.formInputText, {marginBottom: 20}]}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  allowFontScaling={false}
                />
              </View>
              <PrimaryBtn
                style={{marginTop: 40, marginBottom: 40}}
                onClickMethod={handleSaveChanges}
                Content={'Save Changes'}
              />
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  profileContainer: {
    width: 130,
    height: 130,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'white',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  cameraIcon: {
    width: 25,
    height: 25,
    position: 'absolute',
    bottom: 5,
    right: 3,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'stretch',
    marginTop: 10,
    paddingHorizontal: 40,
    paddingTop: 0,
  },
  formLabel: {
    fontSize: 16,
    color: 'gray',
    fontWeight: '800',
    fontStyle: 'bold',
    fontFamily: 'Poppins-Regular',
  },
  formInputText: {
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 9,
    // i want to add marginTop of 1% because of the screen size of different mobile devices
    marginTop: '1%',
    paddingLeft: 10,
    height: 35,
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: 'center',
    color: '#000',
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
  },
  inputFields: {
    marginVertical: '2%',
  },
});

export default EditUserProfile;
