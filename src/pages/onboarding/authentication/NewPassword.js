import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  ImageBackground,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {resetPassword} from '../../../components/apis/authentication/forgetPasswordApi';
import PrimaryBtn from '../../../layouts/buttons/primaryBtn';

export default function NewPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const {email, code} = route.params;

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Validation',
        text2: 'Please fill in all fields.',
      });
      return;
    }

    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Validation',
        text2: 'Passwords do not match.',
      });
      return;
    }

    if (password.length < 8) {
      Toast.show({
        type: 'error',
        text1: 'Validation',
        text2: 'Password must be at least 8 characters long.',
      });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, code, password);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Password reset successfully.',
      });
      navigation.navigate('Login');
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err?.message || 'Failed to reset password.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#1E293B'}}>
      <ImageBackground
        source={require('../../../assets/imgs/onboarding-bg2.png')}
        style={[styles.container, {width: '100%'}]}
        resizeMode="cover">
        <View
          style={{
            flex: 0.55,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            paddingHorizontal: 15,
          }}>
          <TouchableOpacity
            accessibilityRole="button"
            style={{
              position: 'absolute',
              top: 36,
              left: 0,
              zIndex: 10,
              flexDirection: 'row',
              alignItems: 'center',
              padding: 6,
              borderRadius: 20,
            }}
            onPress={() => navigation.goBack()}>
            <Image
              source={require('../../../assets/imgs/icons/angle-small-left.png')}
              style={{width: 28, height: 28, tintColor: 'white'}}
            />
            <Text
              style={{
                color: 'white',
                marginLeft: 2,
                fontFamily: 'Poppins-Regular',
                fontSize: 16,
              }}>
              Back
            </Text>
          </TouchableOpacity>
          <Text style={styles.heading}>New Password</Text>
          <Text style={styles.headingText}>Enter your new password</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              placeholderTextColor="#888"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.buttonContainer}>
            <PrimaryBtn
              onClickMethod={handleResetPassword}
              Content="Reset Password"
              disable={loading}
              opacityValue={loading ? 0.5 : 1}
            />
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 25,
    color: '#fff',
    marginBottom: 0,
    fontFamily: 'Poppins-Bold',
  },
  headingText: {
    fontSize: 15,
    color: '#fff',
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  formContainer: {
    flex: 0.55,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
});
