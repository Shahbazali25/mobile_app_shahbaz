import {React, useState, useEffect, useRef} from 'react';
import {StyleSheet, Text, View, TextInput, ScrollView, Platform} from 'react-native';
import Toast from 'react-native-toast-message';
import AnimatedLottieView from 'lottie-react-native';
import PrimaryBtn from '../buttons/primaryBtn';
import UpdateCameraZone from './updateCameraZone';
import {getCameraById} from '../../components/apis/cameras/getCameraById';
import {updateCameraInfo} from '../../components/apis/cameras/updateCameraInfo';

export default function UpdateCameraForm({camera_id}) {
  const animation = useRef(null);
  const [isLoading, setLoading] = useState(true);
  const [name, setName] = useState(null);
  const [mac, setMac] = useState(null);
  const [host, setHost] = useState(null);
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [streamInputPath, setStreamInputPath] = useState(null);
  const [streamKey, setStreamKey] = useState(null);
  const [camera, setCamera] = useState(null);

  useEffect(() => {
    animation.current?.play();
    const fetchCamera = async () => {
      try {
        const fetchedCamera = await getCameraById(camera_id);
        console.log('fetchedCamera', fetchedCamera.message);
        setCamera(fetchedCamera.message);
        setName(fetchedCamera.message.name);
        setMac(fetchedCamera.message.mac);
        setHost(fetchedCamera.message.host);
        setUsername(fetchedCamera.message.username);
        setPassword(fetchedCamera.message.password);
        setAuthToken(fetchedCamera.message.authToken);
        setStreamInputPath(fetchedCamera.message.streamInputPath);
        setStreamKey(fetchedCamera.message.streamKey);
      } catch (error) {
        console.error('Error fetching camera:', error);
        Toast.show({
          type: 'error',
          text1: 'Camera Error',
          text2: String(error),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCamera();
  }, []);

  const cameraUpdate = async () => {
    setLoading(true);
    try {
      const updatedCamera = await updateCameraInfo(
        camera_id,
        name,
        mac,
        host,
        username,
        password,
        authToken,
        streamInputPath,
        streamKey,
      );
      console.log('updatedCamera', updatedCamera);
      Toast.show({
        type: 'success',
        text1: 'Camera Update',
        text2: updatedCamera.message,
      });
    } catch (error) {
      console.error('Error fetching camera:', error);
      Toast.show({
        type: 'error',
        text1: 'Camera Error',
        text2: String(error),
      });
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
          autoPlay={false}
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
        <View style={styles.inputFields}>
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
        <UpdateCameraZone camera_id={camera_id} />
      </View>

      <View style={{marginBottom: 70}}>
        <PrimaryBtn
          onClickMethod={cameraUpdate}
          Content={isLoading ? 'Updating...' : 'Update Camera'}
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
    borderRadius: 9,
    marginTop: 6,
    fontFamily: 'Poppins-Regular',
    color: 'black',
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
