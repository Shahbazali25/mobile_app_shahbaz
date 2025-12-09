import {React, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import PrimaryBtn from '../buttons/primaryBtn';
import {loginAPI} from '../../components/apis/authentication/loginApi';

export default function LoginFormV2() {
  const [email, setEmail] = useState('base_user@mail.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const loginUser = async () => {
    setLoading(true);
    try {
      console.log('\n\n\n****\nAttempting login with email:', email);
      console.log(
        'Attempting login with password:',
        password ? password : 'empty',
      );
      const userData = await loginAPI(email, password);
      console.log('Login successful, user data:', userData);
      navigation.navigate('Home');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Unauthorized',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <ScrollView style={styles.form}>
      <View
        style={{
          display: 'flex',
          alignSelf: 'stretch',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'left',
          marginTop: 10,
        }}>
        <Text
          style={{
            fontFamily: 'Poppins-Medium',
            alignSelf: 'center',
            paddingVertical: 10,
            fontSize: 24,
          }}>
          Sign in
        </Text>
      </View>
      <View>
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
            style={styles.formInputText}
            onChangeText={setEmail}
            value={email}
            keyboardType="email-address"
          />
        </View>
        <View style={[styles.inputFields, {marginBottom: 20}]}>
          <Text
            aria-label="Label for Username"
            nativeID="labelUsername"
            style={styles.formLabel}>
            Password
          </Text>
          <TextInput
            aria-label="input"
            aria-labelledby="labelUsername"
            style={styles.formInputText}
            onChangeText={setPassword}
            value={password}
            secureTextEntry
          />
        </View>
        <TouchableOpacity
          style={styles.forgetPassword}
          onPress={() => navigation.navigate('ForgetPassword')}>
          <Text style={styles.externalLink}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
      <PrimaryBtn
        onClickMethod={loginUser}
        disable={loading ? true : false}
        Content={loading ? 'Signing in.....' : 'Sign in'}
        opacityValue={loading ? 0.5 : 1}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  form: {
    flex: 0.55,
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'stretch',
    paddingHorizontal: 40,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flexGrow: 1,
  },
  formLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  formInputText: {
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 9,
    marginTop: 6,
    color: 'black',
    fontFamily: 'Poppins-Regular',

    padding: Platform.select({ios: 10, android: 10}),
  },
  inputFields: {
    marginVertical: 8,
  },
  forgetPassword: {
    alignSelf: 'flex-end',
    marginTop: 2,
    marginBottom: 30,
  },
  externalLink: {
    color: '#0F172A',
    fontFamily: 'Poppins-Medium',
  },
});
