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
import CustomGenericPicker from '../CustomGenericPicker';
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
  const [role_id, setRole_id] = useState();

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

  useEffect(() => {
    console.log('Selected role_id:', role_id);
  }, [role_id]);

  const userCreate = async () => {
    setLoading(true);

    try {
      if (!role_id) {
        errorMessage('Role Selection', 'Kindly select role for this user');
        return;
      }
      if (!firstName) {
        errorMessage(
          'FirstName Input',
          'Kindly Enter First Name for this User',
        );
        return;
      }
      if (!lastName) {
        errorMessage('Last Name Input', 'Kindly Enter Last Name for this User');
        return;
      }
      if (!email || email.trim() === '') {
        errorMessage('Email Input', 'Kindly Enter Email for this User');
        return;
      }

      // Check email format with regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        errorMessage('Invalid Email', 'Kindly enter a valid email address');
        return;
      }

      if (!password) {
        errorMessage('Password Input', 'Kindly Enter Password for this User');
        return;
      }
      console.log('\n\n\n Form Values:', {
        selectedOption,
        firstName,
        lastName,
        email,
        password,
        role_id,
      });
      const response = await signupApi(
        email,
        password,
        firstName,
        lastName,
        role_id,
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
          setRole_id(selectedUser.id); // <-- ADD THIS
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
    <SafeAreaView style={{flex: 1}} edges={['left', 'right']}>
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
          <CustomGenericPicker
  options={(roles || []).map(role => ({
    label: role.name,
    value: role.id,
  }))}
  selectedValue={selectedOption}
  onValueChange={value => {
    setSelectedOption(value);
    setRole_id(value); // keep your existing logic
  }}
  placeholder="Select Role"
/>
        </View>

        <View style={{marginBottom: 70, marginTop: 20}}>
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
    // borderTopLeftRadius: 30,
    // borderTopRightRadius: 30,
    height: '100%',
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
