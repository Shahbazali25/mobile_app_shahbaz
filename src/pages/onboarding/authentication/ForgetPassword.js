import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
  ImageBackground,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {sendForgetPasswordOTP} from '../../../components/apis/authentication/forgetPasswordApi';
import PrimaryBtn from '../../../layouts/buttons/primaryBtn';

export default function ForgetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const sendOtp = async () => {
    console.log('Send OTP clicked with email:', email);
    // Add more logging to track function execution
    // Check if email is valid and syntactically correct
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      console.log('Email validation failed - invalid email');
      Toast.show({
        type: 'error',
        text1: 'Validation',
        text2: 'Please enter an email.',
      });
      return;
    }

    setLoading(true);
    try {
      await sendForgetPasswordOTP(email);
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: `OTP sent to ${email}`,
      });
      navigation.navigate('VerifyResetCode', {
        email,
        previousScreen: 'ForgetPassword',
      });
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Account Not Found',
        text2: 'try another email.' || err?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#1E293B'}}>
      <ImageBackground
        source={require('../../../assets/imgs/onboarding-bg.png')}
        style={[styles.container, {width: '100%'}]}
        resizeMode="cover">
        <View
          style={{
            flex: 0.45,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            paddingHorizontal: 15,
          }}>
          <TouchableOpacity
            accessibilityRole="button"
            style={{
              position: 'absolute',
              top: 56, // increased distance from top to avoid status bar overlap
              left: 12,
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
            {/* Fallback text in case the image is not visible on some devices/themes */}
            <Text
              style={{
                color: 'white',
                marginLeft: 8,
                fontFamily: 'Poppins-Regular',
                fontSize: 16,
              }}>
              Back
            </Text>
          </TouchableOpacity>
          <Text style={styles.heading}>Forgot Password</Text>
          <Text style={styles.headingText}>
            Enter the email address associated with your account to receive an
            OTP.
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.buttonContainer}>
            <PrimaryBtn
              onClickMethod={sendOtp}
              Content="Send OTP"
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
    fontSize: 40,
    color: '#fff',
    marginBottom: 10,
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
