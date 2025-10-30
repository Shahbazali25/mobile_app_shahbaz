import {React, useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {Picker} from '@react-native-picker/picker';
import AnimatedLottieView from 'lottie-react-native';
import {getAllRoles} from '../../components/apis/users/getAllRoles';
import {updateRole} from '../../components/apis/users/updateRole';
import errorMessage from '../../components/utils/errorMessage';

export default function UpdateUserRole({cloud_id, role_id, email}) {
  const animation = useRef(null);
  const [isLoading, setLoading] = useState(false);
  const [roles, setRoles] = useState(null);
  const [selectedOption, setSelectedOption] = useState(role_id && role_id);

  useEffect(() => {
    animation.current?.play();
    const getInitialData = async () => {
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

    getInitialData();
  }, []);

  const assignRole = async () => {
    setLoading(true);
    try {
      const assign = await updateRole(email, selectedOption);
      console.log(assign);

      if (assign === 200) {
        Toast.show({
          type: 'success',
          text1: 'Role Updated',
          text2: 'Role Updated Succesfully',
        });
      }
      else{
        errorMessage('Error', 'User Role not updated due to some issue')
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Role Updation Error',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const onPress = () => {
    const userOptions = ['Cancel', ...roles.map(role => role.name)];
    console.log(userOptions)
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
          autoPlay={false}
          loop
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.form}>
      <Text
        aria-label="Label for Username"
        nativeID="labelUsername"
        style={[styles.sectionLabel, {marginTop: 12}]}>
        Update User Role
      </Text>
      {roles &&
        Platform.select({
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
            <Picker
              selectedValue={selectedOption}
              onValueChange={itemValue => setSelectedOption(itemValue)}
              style={styles.picker}>
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
          ),
        })}
      <TouchableOpacity onPress={assignRole}>
        <Text style={styles.button}>
          {isLoading ? 'Updating Role...' : 'Update Role'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 6,
    color: '#1E293B',
    borderColor: '#1E293B',
    alignSelf: 'flex-start',
    padding: 8,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    marginBottom: 25,
  },
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
    paddingHorizontal: 2,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#1E293B',
  },
  picker: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#E7E7E7',
    color: 'black',
    marginTop: 5,
    marginBottom: 10,
  },
});
