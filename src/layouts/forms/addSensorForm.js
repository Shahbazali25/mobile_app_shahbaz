import {React, useState, useRef} from 'react';
import {StyleSheet, Text, View, TextInput, ScrollView, Platform} from 'react-native';
import Toast from 'react-native-toast-message';
import {useNavigation} from '@react-navigation/native';
import AnimatedLottieView from 'lottie-react-native';
import PrimaryBtn from '../buttons/primaryBtn';
import {createSensor} from '../../components/apis/sensors/createSensor';

export default function AddSensorForm() {
  const animation = useRef(null);
  const [name, setName] = useState('Dining Room Temperature');
  const [description, setDescription] = useState(
    'DHT22 temperature sensor in the dining room',
  );
  const [unit, setUnit] = useState('C');
  const [type, setType] = useState('temperature');
  const [mqttTopic, setMQTTTopic] = useState('home/dht22/temperature');
  const [mqttHost, setMQTTHost] = useState('192.168.18.62');
  const [mqttPort, setMQTTPort] = useState('1883');
  const [threshold, setThreshold] = useState('100');
  const [isLoading, setLoading] = useState(false);

  const navigation = useNavigation();

  const sensorCreate = async () => {
    setLoading(true);
    try {
      const create = await createSensor(
        name,
        description,
        unit,
        type,
        mqttTopic,
        mqttHost,
        parseInt(mqttPort),
        '',
        '',
        'mqtt',
        'number',
        true,
        true,
        parseInt(threshold),
        null,
      );
      console.log(create);

      if (create.data.status === 201) {
        Toast.show({
          type: 'success',
          text1: 'Sensor Created',
          text2: 'Sensor Created Succesfully',
        });
        navigation.navigate('AssignSensorZone', {
          sensorId: create.data.data.id,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Sensor Creation Error',
        text2: error.message,
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
            value={name}
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
            value={description}
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
            value={type}
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
            value={unit}
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
            value={threshold}
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
            value={mqttTopic}
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
            value={mqttHost}
            onChangeText={setMQTTHost}
          />
        </View>
        <View style={[styles.inputFields, {marginBottom:16}]}>
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
            value={mqttPort}
            onChangeText={setMQTTPort}
          />
        </View>
      </View>

      <View style={{marginBottom: 70}}>
        <PrimaryBtn
          onClickMethod={sensorCreate}
          Content={isLoading ? 'Adding Sensor...' : 'Add Sensor'}
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
