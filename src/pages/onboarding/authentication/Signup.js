import {StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import ExternalLinks from '../../../layouts/externalLinks';
import SignupForm from '../../../layouts/forms/signupForm';

export default function Signup() {
  const navigation = useNavigation();

  const handleSignin = () => {
    navigation.navigate('Login');
  };
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.heading}>Sign up</Text>
        <Text style={styles.headingText}>
          Create your account to securely monitor your cameras anytime, anywhere
        </Text>
        <SignupForm />
      </View>
      <ExternalLinks
        onClickMethod={handleSignin}
        Content={'Already have an account?'}
        ButtonContent={'Sign in'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 25,
    alignSelf: 'center',
  },
  headingText: {
    textAlign: 'center',
    color: 'gray',
    paddingHorizontal: 60,
    fontSize: 15,
    marginVertical: 10,
  },
});
