import {StyleSheet, Text, View, TextInput, Platform} from 'react-native';
import PrimaryBtn from '../buttons/primaryBtn';

export default function SignupForm() {
  const signupUser = () => {
    console.log('Testing');
  };
  return (
    <View style={styles.form}>
      <View style={styles.inputFields}>
        <Text
          aria-label="Label for Username"
          nativeID="labelUsername"
          style={styles.formLabel}>
          Full Name
        </Text>
        <TextInput
          aria-label="input"
          aria-labelledby="labelUsername"
          style={styles.formInputText}
        />
      </View>
      <View style={styles.inputFields}>
        <Text
          aria-label="Label for Username"
          nativeID="labelUsername"
          style={styles.formLabel}>
          Username
        </Text>
        <TextInput
          aria-label="input"
          aria-labelledby="labelUsername"
          style={styles.formInputText}
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
          style={styles.formInputText}
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
        />
      </View>
      <PrimaryBtn onClickMethod={signupUser} Content={'Sign up'} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignSelf: 'stretch',
    marginVertical: 30,
    paddingHorizontal: 40,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'semibold',
  },
  formInputText: {
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 9,
    marginTop: 6,
    padding:Platform.select({ios:10, android:10})
  },
  inputFields: {
    marginVertical: 8,
  },
});
