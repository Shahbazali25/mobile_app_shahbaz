import {React, useState, useEffect, useRef} from 'react';
import {StyleSheet, Text, View, TextInput, ScrollView, Platform} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AnimatedLottieView from 'lottie-react-native';
import PrimaryBtn from '../buttons/primaryBtn';
import {updateSensorInfo} from '../../components/apis/sensors/updateSensorInfo';
import UpdateSensorZone from './updateSensorZone';

export default function UpdateSensorForm({
  sensorId,
  name,
  description,
  unit,
  mqttTopic,
  mqttHost,
  mqttPort,
  threshold,
  type,
  zoneId,
}) {
  console.log(mqttTopic)
  const animation = useRef(null);
  const [isLoading, setLoading] = useState(false);
  const [nameState, setName] = useState(name);
  const [descriptionState, setDescription] = useState(description);
  const [unitState, setUnit] = useState(unit);
  const [typeState, setType] = useState(type);
  const [mqttTopicState, setMQTTTopic] = useState(mqttTopic);
  const [mqttHostState, setMQTTHost] = useState(mqttHost);
  const [mqttPortState, setMQTTPort] = useState(mqttPort.toString());
  const [thresholdState, setThreshold] = useState(threshold.toString());

  const navigation = useNavigation();

  useEffect(() => {
    animation.current?.play();
  }, []);

  const sensorUpdate = async () => {
    setLoading(true);
    try {
      const updatedSensor = await updateSensorInfo(
        sensorId,
        nameState,
        descriptionState,
        unitState,
        typeState,
        mqttTopicState,
        mqttHostState,
        parseInt(mqttPortState),
        '',
        '',
        'mqtt',
        'number',
        true,
        true,
        parseInt(thresholdState),
        zoneId,
      );
      console.log('updatedCamera', updatedSensor);
      Toast.show({
        type: 'success',
        text1: `Sensor with id ${sensorId} Updated`,
        text2: updatedSensor.message,
      });
      navigation.navigate('SensorSetup');
    } catch (error) {
      console.error('Error fetching Sensor:', error);
      Toast.show({
        type: 'error',
        text1: 'Sensor Error',
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
            Sensor Name
          </Text>
          <TextInput
            aria-label="input"
            aria-labelledby="labelUsername"
            style={styles.formInputText}
            placeholder="Dining Room Temperature"
            placeholderTextColor="lightgray"
            value={nameState}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputFields}>
          <Text
            aria-label="Label for Username"
            nativeID="labelUsername"
            style={styles.formLabel}>
            Description
          </Text>
          <TextInput
            aria-label="input"
            aria-labelledby="labelUsername"
            style={styles.formInputText}
            placeholder="DHT22 temperature sensor in the dining room"
            placeholderTextColor="lightgray"
            value={descriptionState}
            onChangeText={setDescription}
          />
        </View>
        <View style={styles.inputFields}>
          <Text
            aria-label="Label for Username"
            nativeID="labelUsername"
            style={styles.formLabel}>
            Type
          </Text>
          <TextInput
            aria-label="input"
            aria-labelledby="labelUsername"
            style={styles.formInputText}
            placeholder="temperature"
            placeholderTextColor="lightgray"
            value={typeState}
            onChangeText={setType}
          />
        </View>
        <View style={styles.inputFields}>
          <Text
            aria-label="Label for Username"
            nativeID="labelUsername"
            style={styles.formLabel}>
            Unit
          </Text>
          <TextInput
            aria-label="input"
            aria-labelledby="labelUsername"
            style={styles.formInputText}
            value={unitState}
            onChangeText={setUnit}
            placeholder="°C"
            placeholderTextColor="lightgray"
          />
        </View>
        <View style={styles.inputFields}>
          <Text
            aria-label="Label for Username"
            nativeID="labelUsername"
            style={styles.formLabel}>
            Threshold Value
          </Text>
          <TextInput
            aria-label="input"
            aria-labelledby="labelUsername"
            style={styles.formInputText}
            placeholder="Dining Room Temperature"
            placeholderTextColor="lightgray"
            value={thresholdState}
            onChangeText={setThreshold}
          />
        </View>
        <Text
          aria-label="Label for Username"
          nativeID="labelUsername"
          style={[styles.sectionLabel, {marginTop: 4}]}>
          Authentication
        </Text>
        <View style={styles.inputFields}>
          <Text
            aria-label="Label for Username"
            nativeID="labelUsername"
            style={styles.formLabel}>
            MQTT Topic
          </Text>
          <TextInput
            aria-label="input"
            aria-labelledby="labelUsername"
            style={styles.formInputText}
            placeholder="Dining Room Temperature"
            placeholderTextColor="lightgray"
            value={mqttTopicState}
            onChangeText={setMQTTTopic}
          />
        </View>
        <View style={styles.inputFields}>
          <Text
            aria-label="Label for Username"
            nativeID="labelUsername"
            style={styles.formLabel}>
            MQTT Host
          </Text>
          <TextInput
            aria-label="input"
            aria-labelledby="labelUsername"
            style={styles.formInputText}
            placeholder="Dining Room Temperature"
            placeholderTextColor="lightgray"
            value={mqttHostState}
            onChangeText={setMQTTHost}
          />
        </View>
        <View style={[styles.inputFields, {marginBottom: 16}]}>
          <Text
            aria-label="Label for Username"
            nativeID="labelUsername"
            style={styles.formLabel}>
            MQTT Port
          </Text>
          <TextInput
            aria-label="input"
            aria-labelledby="labelUsername"
            style={styles.formInputText}
            placeholder="Dining Room Temperature"
            placeholderTextColor="lightgray"
            value={mqttPortState}
            onChangeText={setMQTTPort}
          />
        </View>
        <UpdateSensorZone sensorId={sensorId} />
      </View>

      <View style={{marginBottom: 70}}>
        <PrimaryBtn
          onClickMethod={sensorUpdate}
          Content={isLoading ? 'Updating Sensor...' : 'Update Sensor'}
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
