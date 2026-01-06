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
import AnimatedLottieView from 'lottie-react-native';
import {getAllZones} from '../../components/apis/zones/getAllZones';
import {zoneAssignToSensor} from '../../components/apis/sensors/zoneAssignToSensor';
import CustomGenericPicker from '../CustomGenericPicker';
export default function UpdateSensorZone({sensorId}) {
  const animation = useRef(null);
  const [isLoading, setLoading] = useState(false);
  const [zones, setZones] = useState(null);
 
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    animation.current?.play();
    const fetchSensorZone = async () => {
      try {
        const fetchedZones = await getAllZones();
        console.log('\n\n *** \n all sensor zones:: ', fetchedZones);
        if (!fetchedZones) {
          console.error('Invalid zones data.');
          return;
        }
        setZones(fetchedZones);

        if (sensorId) {
          for (const zone of fetchedZones) {
            if (zone.sensors) {
              for (const sensor of zone.sensors) {
                if (sensor.id === sensorId) {
                  setSelectedOption(zone.id);
                  break;
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
          console.log(zones[buttonIndex - 1]);
          const selectedZone = zones[buttonIndex - 1];
          setSelectedOption(selectedZone.id);
        }
      },
    );
  };

  const assignZone = async () => {
    setLoading(true);
    try {
       console.log(
        '\n\n *** \nSending this to backend',
        selectedOption,
        sensorId,
      );
      const assign = await zoneAssignToSensor(selectedOption, sensorId);
      console.log('\n\n *** \n assign this to assign', assign);

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
 const zoneOptions = Array.isArray(zones)
  ? zones.map(zone => ({
      label: zone.name,
      value: zone.id,
    }))
  : [];

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
      
<CustomGenericPicker
  options={(zones || []).map(zone => ({ label: zone.name, value: zone.id }))}
  selectedValue={selectedOption}
  onValueChange={value => setSelectedOption(value)}
  placeholder="Select Zone"
/>


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
    marginTop: 10,
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
