import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import SolisSolarData from './solar/solisSolarData';
import KnoxSolarData from './solar/knoxSolarData';

function Solars({userData}) {
  const animation = useRef(null);
  const [selectedOption, setSelectedOption] = useState('Solis Solar Data');

  useEffect(() => {
    animation.current?.play();
  }, []);

  const onPress = () => {
    const solarOption = ['Cancel', 'Solis Solar Data', 'Knox Solar Data'];

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: solarOption,
        cancelButtonIndex: 0,
        userInterfaceStyle: 'dark',
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          return;
        }

        if (buttonIndex === 1) {
          setSelectedOption('Solis Solar Data');
        } else if (buttonIndex === 2) {
          setSelectedOption('Knox Solar Data');
        }
      },
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={{flex: 1, paddingBottom: 90}}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}>Knox Solar</Text>
        </View>
          <KnoxSolarData />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  headerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 20,
  },
  userGreetingContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'lightgray',
  },
  greetingTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    padding: 14,
  },
  greetingText: {
    fontSize: 15,
    fontFamily: 'Poppins-Regular',
  },
  pickerContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 10,
    paddingHorizontal: 20,
    width: '100%',
    marginBottom: 10,
  },
  picker: {
    width: '100%',
    height: 45,
    borderRadius: 10,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#E7E7E7',
    color: 'black',
  },
  pickerItem: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    borderRadius: 15,
  },
  textContainer: {
    marginTop: 10,
  },
  text: {
    fontFamily: 'Poppins-Medium',
  },
});

export default Solars;
