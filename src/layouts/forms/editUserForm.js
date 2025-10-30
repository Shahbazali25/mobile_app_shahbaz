import {React, useState, useRef, useEffect} from 'react';
import {StyleSheet, Text, View, TextInput, ScrollView, Platform} from 'react-native';
import AnimatedLottieView from 'lottie-react-native';
import PrimaryBtn from '../buttons/primaryBtn';
import errorMessage from '../../components/utils/errorMessage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {getSpecificUser} from '../../components/apis/users/getSpecificUser';
import UpdateUserRole from './updateUserRole';
import { updateUserProfile } from '../../components/apis/users/updateUserProfile';

export default function EditUserForm({user_id, cloud_id}) {
  const animation = useRef(null);
  const [isLoading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [password, setPassword] = useState();
  const [email, setEmail] = useState();
  const [selectedOption, setSelectedOption] = useState(0);

  useEffect(() => {
    getInitialData();
  }, []);

  const getInitialData = async () => {
    try {
      const userData = await getSpecificUser(cloud_id);
      setFirstName(userData.firstName);
      setLastName(userData.lastName);
      setEmail(userData.email);
      setSelectedOption(userData.role);
    } catch (error) {
      errorMessage('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  const userUpdate = async () => {
    setLoading(true);
    try {
      const response = await updateUserProfile(
          firstName,
          lastName,
          email,
          password,
          user_id
      );
      if (response === 200) {
        Toast.show({
        type: 'success',
        text1: 'User Updated',
        text2: 'User Updated Succesfully',
        });
    }
    } catch (error) {
      errorMessage('Camera Creation Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
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
    <SafeAreaView style={{flex: 1}}>
      <ScrollView style={styles.form}>
        <View>
          <Text
            aria-label="Label for Username"
            nativeID="labelUsername"
            style={[styles.sectionLabel, {marginTop: 4}]}>
            Basic Information
          </Text>
          <View style={styles.inputFields}>
            <Text
              aria-label="Label for Username"
              nativeID="labelUsername"
              style={styles.formLabel}>
              First Name
            </Text>
            <TextInput
              aria-label="input"
              aria-labelledby="labelUsername"
              style={styles.formInputText}
              placeholder="John"
              placeholderTextColor="lightgray"
              value={firstName}
              onChangeText={setFirstName}
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
              placeholder="Doe"
              placeholderTextColor="lightgray"
              value={lastName}
              onChangeText={setLastName}
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
              placeholder="johndoe@mail.com"
              placeholderTextColor="lightgray"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <Text
            aria-label="Label for Username"
            nativeID="labelUsername"
            style={[styles.sectionLabel, {marginTop: 12}]}>
            Authentication
          </Text>
          <View style={styles.inputFields}>
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
              secureTextEntry={true}
              placeholder="******"
              placeholderTextColor="lightgray"
              value={password}
              onChangeText={setPassword}
            />
          </View>
          {selectedOption && selectedOption ? (
            <UpdateUserRole
              cloud_id={cloud_id}
              role_id={selectedOption}
              email={email}
            />
          ) : (
            ''
          )}
        </View>

        <View style={{marginBottom: 70}}>
          <PrimaryBtn
            onClickMethod={userUpdate}
            Content={isLoading ? 'Updating...' : 'Update User'}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 200,
    height: 200,
  },
  form: {
    flex: 1,
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
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
  },
  formInputText: {
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 9,
    marginTop: 6,
    color: 'black',
    fontFamily: 'Poppins-Regular',
    lineHeight: 20,
    ...(Platform.OS === 'android'
      ? {
          textAlignVertical: 'center',
          includeFontPadding: false,
        }
      : {}),

       padding:Platform.select({ios:10, android:10})
  },
  inputFields: {
    marginVertical: 6,
  },
  picker: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#E7E7E7',
    color: 'black',
    marginBottom: 12,
  },
});
