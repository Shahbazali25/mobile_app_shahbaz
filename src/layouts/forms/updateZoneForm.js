import {React, useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import PrimaryBtn from '../buttons/primaryBtn';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AnimatedLottieView from 'lottie-react-native';
import {getZoneById} from '../../components/apis/zones/getZoneById';
import {zoneToUpdate} from '../../components/apis/zones/updateZone';

export default function UpdateZoneForm({zoneId}) {
  const animation = useRef(null);
  const [name, setName] = useState(null);
  const [description, setDescription] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);

  const navigation = useNavigation();

  useEffect(() => {
    animation.current?.play();
    const fetchZones = async () => {
      try {
        const fetchedZones = await getZoneById(zoneId);
        console.log('fetchedZones', fetchedZones);
        setName(fetchedZones.name);
        setDescription(fetchedZones.description);
        setSelectedIcon(fetchedZones.type);
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

  const zoneUpdate = async () => {
    setLoading(true);
    try {
      const update = await zoneToUpdate(
        name,
        selectedIcon,
        description,
        zoneId,
      );
      if (!update.error) {
        Toast.show({
          type: 'success',
          text1: 'Zone Update',
          text2: 'Zone Updated Succesfully',
        });
      }
      navigation.navigate('ZonesConfiguration');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Zone Update Error',
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleDetectionType = type => {
    setSelectedIcon(type === selectedIcon ? null : type);
  };

  const zoneIcons = {
    'baby-room': require('../../assets/imgs/zoneIcons/baby-room.png'),
    'changing-room': require('../../assets/imgs/zoneIcons/changing-room.png'),
    computer: require('../../assets/imgs/zoneIcons/computer.png'),
    'dining-table': require('../../assets/imgs/zoneIcons/dining-table.png'),
    'factory-outside': require('../../assets/imgs/zoneIcons/factory-outside.png'),
    factory: require('../../assets/imgs/zoneIcons/factory.png'),
    hall: require('../../assets/imgs/zoneIcons/hall.png'),
    'home-office': require('../../assets/imgs/zoneIcons/home-office.png'),
    'interior-design': require('../../assets/imgs/zoneIcons/interior-design.png'),
    'kitchen-second': require('../../assets/imgs/zoneIcons/kitchen-second.png'),
    kitchen: require('../../assets/imgs/zoneIcons/kitchen.png'),
    'living-room': require('../../assets/imgs/zoneIcons/living-room.png'),
    'meeting-room': require('../../assets/imgs/zoneIcons/meeting-room.png'),
    meeting: require('../../assets/imgs/zoneIcons/meeting.png'),
    'office-building': require('../../assets/imgs/zoneIcons/office-building.png'),
    office: require('../../assets/imgs/zoneIcons/office.png'),
    security: require('../../assets/imgs/zoneIcons/security.png'),
    'surgery-room': require('../../assets/imgs/zoneIcons/surgery-room.png'),
    'washing-machine': require('../../assets/imgs/zoneIcons/washing-machine.png'),
  };

  const zoneIconKeys = Object.keys(zoneIcons);

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
          Zone Details
        </Text>
        <View style={styles.inputFields}>
          <Text
            aria-label="Label for Username"
            nativeID="labelUsername"
            style={styles.formLabel}>
            Zone Name
          </Text>
          <TextInput
            aria-label="input"
            aria-labelledby="labelUsername"
            style={styles.formInputText}
            placeholder="Dining Room"
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
            Icon
          </Text>
          <View style={styles.detectionTypeOptionsContainer}>
            {/* i want to show 4 icons in a row and fill the remaining space */}
            {zoneIconKeys.map((type, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.detectionTypeOption,
                  selectedIcon === type && styles.selectedDetectionType,
                ]}
                onPress={() => toggleDetectionType(type)}>
                <Image
                  source={zoneIcons[type]}
                  style={{width: 35, height: 45, marginHorizontal: '1%'}}
                />
              </TouchableOpacity>
            ))}
          </View>
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
            placeholder="Write description...."
            placeholderTextColor="lightgray"
            value={description}
            onChangeText={setDescription}
          />
        </View>
      </View>

      <View style={{marginBottom: 70, marginTop: 20}}>
        <PrimaryBtn
          onClickMethod={zoneUpdate}
          Content={isLoading ? 'Updating Zone...' : 'Update Zone'}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  detectionTypeOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detectionTypeOption: {
    padding: '2%',
    marginVertical: '3%',
    marginHorizontal: '1%',
    borderWidth: 1,
    borderColor: '#c5c5d3ff',
    borderRadius: 5,
  },
  selectedDetectionType: {
    backgroundColor: '#1E293B',
    borderColor: '#1E293B',
    color: 'white',
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
    fontSize: 14,
    color: '#1E293B',
    fontStyle: 'normal',
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
      ? {textAlignVertical: 'center', includeFontPadding: false}
      : {}),

    padding: Platform.select({ios: 10, android: 10}),
  },
  inputFields: {
    marginVertical: 6,
  },
});
