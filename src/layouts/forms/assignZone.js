import {React, useState, useEffect, useRef} from 'react';
import {StyleSheet, Text, View, ScrollView, Platform, TouchableOpacity, ActionSheetIOS} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {Picker} from '@react-native-picker/picker';
import AnimatedLottieView from 'lottie-react-native';
import PrimaryBtn from '../buttons/primaryBtn';
import {getAllZones} from '../../components/apis/zones/getAllZones';
import {zoneAssignToSensor} from '../../components/apis/sensors/zoneAssignToSensor';

export default function AssignZone({sensorId}) {
  const animation = useRef(null);
  const [isLoading, setLoading] = useState(false);
  const [zones, setZones] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');

  const navigation = useNavigation();

  useEffect(() => {
    animation.current?.play();
    const fetchZones = async () => {
      try {
        const fetchedZones = await getAllZones();
        console.log('fetchedZones', fetchedZones);
        setZones(fetchedZones);
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

    fetchZones();
  }, []);

  const zoneAssign = async () => {
    setLoading(true);
    try {
      if (selectedOption) {
        const assign = await zoneAssignToSensor(selectedOption, sensorId);
        if (assign.data) {
          Toast.show({
            type: 'success',
            text1: 'Zone Assigned',
            text2: 'Zone Assigned Successfully',
          });
          navigation.navigate('SensorSetup');
        }
      } else {
        Toast.show({
          type: 'error',
          text1: 'Select Zone',
          text2: 'Please select a zone.',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Sensor Assigning Zone Error',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

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
          Zone Details
        </Text>
        <View style={styles.inputFields}>
          <Text
            aria-label="Label for Username"
            nativeID="labelUsername"
            style={styles.formLabel}>
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
                      key={zone}
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
        </View>
      </View>

      <View style={{marginBottom: 70, marginTop: 20}}>
        <PrimaryBtn
          onClickMethod={zoneAssign}
          Content={isLoading ? 'Assigning Zone...' : 'Assign Zone'}
          disable={isLoading ? true : false}
          opacityValue={isLoading ? 0.5 : 1}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  picker: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#E7E7E7',
    color: 'black',
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
  inputFields: {
    marginVertical: 6,
  },
});
