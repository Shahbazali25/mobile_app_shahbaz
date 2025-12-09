import React, {useState, useRef, useEffect} from 'react';
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
import {
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {
  verifyResetCode,
  resendVerificationEmail,
} from '../../../components/apis/authentication/forgetPasswordApi';
import PrimaryBtn from '../../../layouts/buttons/primaryBtn';

export default function VerifyResetCode() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  // six separate digits for the OTP boxes
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef([]);
  const timerRef = useRef(null);

  const startTimer = () => {
    setTimer(60);
    setIsTimerRunning(true);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const hasInitializedRef = useRef(false);

  // Start timer only when first coming from ForgetPassword page
  useFocusEffect(
    React.useCallback(() => {
      const previousScreen = route.params?.previousScreen;
      if (previousScreen === 'ForgetPassword' && !hasInitializedRef.current) {
        hasInitializedRef.current = true;
        startTimer();
      }
    }, []),
  );

  useEffect(() => {
    if (inputsRef.current && inputsRef.current[0]) {
      try {
        inputsRef.current[0].focus();
      } catch (e) {
        // ignore
      }
    }
  }, []);
  const navigation = useNavigation();
  const route = useRoute();
  const {email} = route.params;

  const verifyCode = async () => {
    const codeStr = digits.join('');
    if (codeStr.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Validation',
        text2: 'Please enter the 6-digit verification code.',
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Verifying code for email:', email, 'with code:', codeStr);
      await verifyResetCode(email, codeStr);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Code verified successfully.',
      });
      navigation.navigate('NewPassword', {email, code: codeStr});
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err?.message || 'Invalid verification code.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    try {
      await resendVerificationEmail(email);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: `New code sent to ${email}`,
      });
      startTimer(); // Restart the timer after successful resend
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err?.message || 'Failed to resend code.',
      });
    } finally {
      setResendLoading(false);
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
          <Text style={styles.heading}>Verify OTP</Text>
          <Text style={styles.headingText}>
            Enter the verification code sent to {email}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.codeInputContainer}>
            {digits.map((d, idx) => (
              <TextInput
                key={idx}
                ref={el => (inputsRef.current[idx] = el)}
                value={d}
                onChangeText={text => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  // If user pastes multiple digits, fill following boxes
                  if (cleaned.length > 1) {
                    const chars = cleaned.split('');
                    setDigits(prev => {
                      const next = [...prev];
                      for (let i = 0; i < chars.length && idx + i < 6; i++) {
                        next[idx + i] = chars[i];
                      }
                      return next;
                    });
                    const nextIndex = Math.min(5, idx + cleaned.length);
                    if (inputsRef.current[nextIndex])
                      inputsRef.current[nextIndex].focus();
                    return;
                  }

                  setDigits(prev => {
                    const next = [...prev];
                    next[idx] = cleaned.slice(0, 1);
                    return next;
                  });
                  if (cleaned && idx < 5) {
                    if (inputsRef.current[idx + 1])
                      inputsRef.current[idx + 1].focus();
                  }
                  if (!cleaned && idx > 0) {
                    if (inputsRef.current[idx - 1])
                      inputsRef.current[idx - 1].focus();
                  }
                }}
                keyboardType="number-pad"
                maxLength={1}
                style={styles.codeBox}
                textAlign="center"
                returnKeyType="done"
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={handleResendCode}
            disabled={resendLoading || isTimerRunning}
            style={styles.resendButton}>
            <Text
              style={[
                styles.resendText,
                isTimerRunning && styles.resendTextDisabled,
              ]}>
              {resendLoading
                ? 'Sending...'
                : isTimerRunning
                ? `Resend Code (${timer}s)`
                : 'Resend Code'}
            </Text>
          </TouchableOpacity>

          <View style={styles.buttonContainer}>
            <PrimaryBtn
              onClickMethod={verifyCode}
              Content="Verify Code"
              disable={loading || digits.join('').length < 6}
              opacityValue={loading || digits.join('').length < 6 ? 0.5 : 1}
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
  codeInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  codeBox: {
    width: 48,
    height: 56,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  resendButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    padding: 10,
  },
  resendText: {
    color: '#0d2558ff',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  resendTextDisabled: {
    color: '#0d2558ff80',
  },
  buttonContainer: {
    marginTop: 'auto',
    marginBottom: 20,
  },
});
