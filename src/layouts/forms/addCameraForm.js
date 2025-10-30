import {React, useState, useRef} from 'react';
import {StyleSheet, Text, View, TextInput, ScrollView, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import AnimatedLottieView from 'lottie-react-native';
import PrimaryBtn from '../buttons/primaryBtn';
import {createCamera} from '../../components/apis/cameras/createCamera';
import errorMessage from '../../components/utils/errorMessage';

export default function AddCameraForm() {
  const animation = useRef(null);
  const navigation = useNavigation();
  const [isLoading, setLoading] = useState(false);
  const [name, setName] = useState('Front Door Camera');
  const [mac, setMac] = useState('6c:1c:71:53:c7:bc');
  const [host, setHost] = useState('192.168.18.45');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('L2B2809F');
  const [authToken, setAuthToken] = useState('nt04y493tmlcv3q0wietm');
  const [streamInputPath, setStreamInputPath] = useState(
    'cam/realmonitor?channel=1&subtype=1',
  );
  const [streamKey, setStreamKey] = useState(
    '0f300817fdd843cab50cfa01b0bfdb37/2/3/2',
  );
  
  const cameraCreate = async () => {
    setLoading(true);
    try {
      const create = await createCamera(
        name,
        mac,
        host,
        username,
        password,
        authToken,
        streamInputPath,
        streamKey,
      );
      console.log(create);

      if (create.data) {
        navigation.navigate('AssignCameraZone', {
          cameraId: create.data.network_id,
        });
      }
    } catch (error) {
      errorMessage('Camera Creation Error', error.message)
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
            Camera Name
          </Text>
          <TextInput
            aria-label="input"
            aria-labelledby="labelUsername"
            style={styles.formInputText}
            placeholder="Front Door Camera"
            placeholderTextColor="lightgray"
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputFields}>
          <Text
            aria-label="Label for Username"
            nativeID="labelUsername"
            style={styles.formLabel}>
            Mac Address
          </Text>
          <TextInput
            aria-label="input"
            aria-labelledby="labelUsername"
            style={styles.formInputText}
            placeholder="XX:XX:XX:XX:XX"
            placeholderTextColor="lightgray"
            value={mac}
            onChangeText={setMac}
          />
        </View>
        <View style={styles.inputFields}>
          <Text
            aria-label="Label for Username"
            nativeID="labelUsername"
            style={styles.formLabel}>
            Host
          </Text>
          <TextInput
            aria-label="input"
            aria-labelledby="labelUsername"
            style={styles.formInputText}
            placeholder="192.168.18.45"
            placeholderTextColor="lightgray"
            value={host}
            onChangeText={setHost}
          />
        </View>
        <View style={styles.inputFields}>
          <Text
            aria-label="Label for Username"
            nativeID="labelUsername"
            style={styles.formLabel}>
            Port
          </Text>
          <TextInput
            aria-label="input"
            aria-labelledby="labelUsername"
            style={styles.formInputText}
            value="554"
            editable={false}
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
            Username
          </Text>
          <TextInput
            aria-label="input"
            aria-labelledby="labelUsername"
            style={styles.formInputText}
            placeholder="johndoe"
            placeholderTextColor="lightgray"
            value={username}
            onChangeText={setUsername}
          />
        </View>
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
          Stream Configuration
        </Text>
        <View style={[styles.inputFields, {marginBottom:12}]}>
          <Text
            aria-label="Label for Username"
            nativeID="labelUsername"
            style={styles.formLabel}>
            Strem Input Path
          </Text>
          <TextInput
            aria-label="input"
            aria-labelledby="labelUsername"
            style={styles.formInputText}
            placeholder="Enter RSTP path"
            placeholderTextColor="lightgray"
            value={streamInputPath}
            onChangeText={setStreamInputPath}
          />
        </View>
      </View>

      <View style={{marginBottom: 70}}>
        <PrimaryBtn
          onClickMethod={cameraCreate}
          Content={isLoading ? 'Adding...' : 'Add Camera'}
          disable={isLoading ? true : false}
          opacityValue={isLoading ? 0.5 : 1}
        />
      </View>
    </ScrollView>
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
    color:'black',
    borderRadius: 9,
    marginTop: 6,
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
});
