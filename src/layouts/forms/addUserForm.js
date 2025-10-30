import {React, useState, useRef, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  Platform,
  TouchableOpacity,
  ActionSheetIOS,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AnimatedLottieView from 'lottie-react-native';
import PrimaryBtn from '../buttons/primaryBtn';
import {Picker} from '@react-native-picker/picker';
import errorMessage from '../../components/utils/errorMessage';
import {getAllRoles} from '../../components/apis/users/getAllRoles';
import {signupApi} from '../../components/apis/authentication/signUp';
import successMessage from '../../components/utils/successMessage';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function AddUserForm() {
  const animation = useRef(null);
  const navigation = useNavigation();
  const [isLoading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState();
  const [lastName, setLastName] = useState();
  const [password, setPassword] = useState();
  const [email, setEmail] = useState();
  const [selectedOption, setSelectedOption] = useState(0);
  const [roles, setRoles] = useState();

  useEffect(() => {
    const getRoles = async () => {
      try {
        const data = await getAllRoles();
        console.log(data);
        setRoles(data);
      } catch (error) {
        errorMessage('Error', String(error));
      } finally {
        setLoading(false);
      }
    };
    getRoles();
  }, []);

  const userCreate = async () => {
    setLoading(true);
    try {
      if (!selectedOption) {
        errorMessage('Role Selection', 'Kindly select role for this user');
        return;
      }
      const response = await signupApi(
        email,
        password,
        firstName,
        lastName,
        selectedOption,
      );
      const data = await response.json();
      console.log(data);
      successMessage(
        'User Created',
        `${firstName} ${lastName} created successfully`,
      );
      navigation.navigate('AccountManagement');
    } catch (error) {
      errorMessage('Camera Creation Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onPress = () => {
    const userOptions = ['Cancel', ...roles.map(role => role.name)];
    console.log(userOptions);
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: userOptions,
        cancelButtonIndex: 0,
        userInterfaceStyle: 'dark',
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          return;
        } else {
          console.log(roles[buttonIndex - 1]);
          const selectedUser = roles[buttonIndex - 1];
          setSelectedOption(selectedUser.id);
        }
      },
    );
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
            style={[styles.sectionLabel, {marginTop: 0}]}>
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
          <Text
            aria-label="Label for Username"
            nativeID="labelUsername"
            style={[styles.sectionLabel, {marginTop: 12}]}>
            Assign Role
          </Text>
          {Platform.select({
            ios: (
              <TouchableOpacity
                onPress={onPress}
                style={{
                  borderWidth: 1,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  alignSelf: 'center',
                  borderColor: '#1E293B',
                  borderRadius: 4,
                  padding: 8,
                  width: '100%',
                  marginTop: 4,
                  marginBottom: 10,
                }}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Regular',
                    fontSize: 12,
                    color: '#1E293B',
                    alignSelf: 'center',
                  }}>
                  {(selectedOption &&
                    roles.find(role => role.id === selectedOption)?.name) ||
                    'Select Role'}
                </Text>
              </TouchableOpacity>
            ),
            android: (
              // the selectedOption is not showing border radius on android picker
              <View
                style={{
                  borderRadius: 15,
                  overflow: 'hidden',
                  height: 50,
                  marginBottom: 12,
                }}>
                <Picker selectedValue={selectedOption} style={styles.picker}>
                  {roles &&
                    roles.map(role => (
                      <Picker.Item
                        label={role.name}
                        key={role.id}
                        value={role.id}
                        style={{
                          fontFamily: 'Poppins-Regular',
                          fontSize: 12,
                          borderRadius: 15,
                        }}
                      />
                    ))}
                </Picker>
              </View>
            ),
          })}
        </View>

        <View style={{marginBottom: 70}}>
          <PrimaryBtn
            onClickMethod={userCreate}
            Content={isLoading ? 'Adding...' : 'Add User'}
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

    padding: Platform.select({ios: 10, android: 7}),
  },
  inputFields: {
    marginVertical: 6,
  },

  picker: {
    width: '100%',
    height: 50,
    borderRadius: 0,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#E7E7E7',
    color: 'black',
    marginBottom: 12,
  },
});
