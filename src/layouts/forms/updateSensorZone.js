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
import {getAllZones} from '../../components/apis/zones/getAllZones';
import {zoneAssignToSensor} from '../../components/apis/sensors/zoneAssignToSensor';

export default function UpdateSensorZone({sensorId}) {
  const animation = useRef(null);
  const [isLoading, setLoading] = useState(false);
  const [zones, setZones] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');

  useEffect(() => {
    animation.current?.play();
    const fetchSensorZone = async () => {
      try {
        const fetchedZones = await getAllZones();
        console.log(fetchedZones);
        if (!fetchedZones) {
          console.error('Invalid zones data.');
          return;
        }
        setZones(fetchedZones);

        if (sensorId) {
          for (const zone of fetchedZones) {
            if (zone.sensors) {
              console.log(zone.id + 'has sensors');
              for (const sensor of zone.sensors) {
                if (sensor.id === sensorId) {
                  console.log(
                    `Sensor ${sensorId} found in zone: ${zone.name} (ID: ${zone.id})`,
                  );
                  setSelectedOption(zone.id);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching zones:', error);
        Toast.show({
          type: 'error',
          text1: 'Zones Error',
          text2: String(error),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSensorZone();
  }, []);

  const onPress = () => {
    const zoneOptions = ['Cancel', ...zones.map(zone => zone.name)];

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: zoneOptions,
        cancelButtonIndex: 0,
        userInterfaceStyle: 'dark',
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          return;
        } else {
          console.log(zones[buttonIndex-1])
          const selectedZone = zones[buttonIndex - 1];
          setSelectedOption(selectedZone.id);
        }
      },
    );
  };

  const assignZone = async () => {
    setLoading(true);
    try {
      const assign = await zoneAssignToSensor(selectedOption, sensorId);
      console.log(assign);

      if (assign.data.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Zone Updated',
          text2: 'Zone Updated Succesfully',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Zone Updation Error',
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
        Zones
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
              marginBottom:10
            }}>
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                fontSize: 12,
                color: '#1E293B',
                alignSelf: 'center',
              }}>
              {(selectedOption &&
                zones.find(zone => zone.id === selectedOption)?.name) ||
                'Select Zone'}
            </Text>
          </TouchableOpacity>
        ),
        android: (
          <Picker
            selectedValue={selectedOption}
            onValueChange={itemValue => setSelectedOption(itemValue)}
            style={styles.picker}>
            {zones &&
              zones.map(zone => (
                <Picker.Item
                  label={zone.name}
                  key={zone.id}
                  value={zone.id}
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
      <TouchableOpacity onPress={assignZone}>
        <Text style={styles.button}>
          {isLoading ? 'Updating Zone...' : 'Update Zone'}
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
