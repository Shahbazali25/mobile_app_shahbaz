import {React, useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  ActionSheetIOS,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import {SafeAreaView} from 'react-native-safe-area-context';
import AnimatedLottieView from 'lottie-react-native';
import NavBar from '../../layouts/navigations/navbar';
import {Picker} from '@react-native-picker/picker';
import {getAllRecordings} from '../../components/apis/recordings/getAllRecordings';

export default function Recordings() {
  const animation = useRef(null);
  const [isLoading, setLoading] = useState(true);
  const [allRecordings, setAllRecordings] = useState([]);
  const [filteredRecordings, setFilteredRecordings] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState(null);
  const [selectedEndTime, setSelectedEndTime] = useState(null);
  const [cameraOptions, setCameraOptions] = useState([
    {label: 'All Cameras', value: 'all'},
  ]);
  const [zoneOptions, setZoneOptions] = useState([
    {label: 'All Zones', value: 'all'},
  ]);
  const [dateOptions, setDateOptions] = useState([]);
  const [timeOptions, setTimeOptions] = useState([]);
  const navigation = useNavigation();
  const parseDateTime = dateTimeString => {
    const [datePart, timePart] = dateTimeString.split(' - ');
    return {
      date: datePart.trim(),
      time: timePart.trim(),
    };
  };

  useEffect(() => {
    animation.current?.play();

    const fetchAndProcessRecordings = async () => {
      try {
        const response = await getAllRecordings();
        console.log('Recordings Data:', response);
        setAllRecordings(response);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Unauthorized',
          text2:
            'Unexpected Error, Try your internet connection and then try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessRecordings();
  }, []);

  useEffect(() => {
    if (allRecordings) {
      const uniqueCameras = [
        ...new Set(allRecordings.map(rec => rec.cameraName)),
      ];
      setCameraOptions([
        {label: 'All Cameras', value: 'all'},
        ...uniqueCameras.map(camera => ({label: camera, value: camera})),
      ]);

      const uniqueZones = [...new Set(allRecordings.map(rec => rec.zoneName))];
      setZoneOptions([
        {label: 'All Zones', value: 'all'},
        ...uniqueZones.map(zone => ({label: zone, value: zone})),
      ]);

      const uniqueDates = [
        ...new Set(allRecordings.map(rec => parseDateTime(rec.savedDate).date)),
      ].sort();
      setDateOptions([
        {label: 'All Dates', value: 'all'},
        ...uniqueDates.map(date => ({label: date, value: date})),
      ]);

      const uniqueTimes = [
        ...new Set(allRecordings.map(rec => parseDateTime(rec.savedDate).time)),
      ].sort();
      setTimeOptions([
        {label: 'All Times', value: 'all'},
        ...uniqueTimes.map(time => ({label: time, value: time})),
      ]);

      setFilteredRecordings(allRecordings);
    }
  }, [allRecordings]);

  useEffect(() => {
    let filtered = [...allRecordings];

    if (selectedCamera !== 'all') {
      filtered = filtered.filter(rec => rec.cameraName === selectedCamera);
    }

    if (selectedZone !== 'all') {
      filtered = filtered.filter(rec => rec.zoneName === selectedZone);
    }

    if (selectedStartDate && selectedStartDate !== 'all') {
      filtered = filtered.filter(rec => {
        const recDate = parseDateTime(rec.savedDate).date;
        return recDate >= selectedStartDate;
      });
    }

    if (selectedEndDate && selectedEndDate !== 'all') {
      filtered = filtered.filter(rec => {
        const recDate = parseDateTime(rec.savedDate).date;
        return recDate <= selectedEndDate;
      });
    }

    if (selectedStartTime && selectedStartTime !== 'all') {
      filtered = filtered.filter(rec => {
        const recTime = parseDateTime(rec.savedDate).time;
        return recTime >= selectedStartTime;
      });
    }

    if (selectedEndTime && selectedEndTime !== 'all') {
      filtered = filtered.filter(rec => {
        const recTime = parseDateTime(rec.savedDate).time;
        return recTime <= selectedEndTime;
      });
    }

    setFilteredRecordings(filtered);
  }, [
    selectedCamera,
    selectedZone,
    selectedStartDate,
    selectedEndDate,
    selectedStartTime,
    selectedEndTime,
    allRecordings,
  ]);

  const onPressStartDate = () => {
    const dateOption = ['Cancel', ...dateOptions.map(date => date.label)];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: dateOption,
        cancelButtonIndex: 0,
        userInterfaceStyle: 'dark',
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          return;
        } else {
          const selectedDate = dateOptions[buttonIndex - 1];
          setSelectedStartDate(selectedDate.value);
        }
      },
    );
  };

  const onPressEndDate = () => {
    const dateOption = ['Cancel', ...dateOptions.map(date => date.label)];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: dateOption,
        cancelButtonIndex: 0,
        userInterfaceStyle: 'dark',
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          return;
        } else {
          const selectedDate = dateOptions[buttonIndex - 1];

          if (selectedStartDate && selectedDate.value <= selectedStartDate) {
            Toast.show({
              type: 'error',
              text1: 'Invalid Date Range',
              text2: 'End date must be after start date.',
            });
            return;
          }

          setSelectedEndDate(selectedDate.value);
        }
      },
    );
  };

  const onPressStartTime = () => {
    const timeOption = ['Cancel', ...timeOptions.map(time => time.label)];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: timeOption,
        cancelButtonIndex: 0,
        userInterfaceStyle: 'dark',
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          return;
        } else {
          const selectedTime = timeOptions[buttonIndex - 1];
          setSelectedStartTime(selectedTime.value);
        }
      },
    );
  };

  const onPressEndTime = () => {
    const timeOption = ['Cancel', ...timeOptions.map(time => time.label)];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: timeOption,
        cancelButtonIndex: 0,
        userInterfaceStyle: 'dark',
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          return;
        } else {
          const selectedTime = timeOptions[buttonIndex - 1];
          if (selectedStartTime && selectedTime.value <= selectedStartTime) {
            Toast.show({
              type: 'error',
              text1: 'Invalid Time Range',
              text2: 'End time must be after start time.',
            });
            return;
          }

          setSelectedEndTime(selectedTime.value);
        }
      },
    );
  };

  useEffect(() => {
    animation.current?.play();

    const fetchAndProcessRecordings = async () => {
      try {
        const response = await getAllRecordings();
        console.log('Recordings Data:', response);
        setAllRecordings(response);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Unauthorized',
          text2:
            'Unexpected Error, Try your internet connection and then try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessRecordings();
  }, []);

  useEffect(() => {
    if (allRecordings) {
      const uniqueCameras = [
        ...new Set(allRecordings.map(rec => rec.cameraName)),
      ];
      setCameraOptions([
        {label: 'All Cameras', value: 'all'},
        ...uniqueCameras.map(camera => ({label: camera, value: camera})),
      ]);
      const uniqueZones = [...new Set(allRecordings.map(rec => rec.zoneName))];
      setZoneOptions([
        {label: 'All Zones', value: 'all'},
        ...uniqueZones.map(zone => ({label: zone, value: zone})),
      ]);
      setFilteredRecordings(allRecordings);
    }
  }, [allRecordings]);

  useEffect(() => {
    let filtered = [...allRecordings];

    if (selectedCamera !== 'all') {
      filtered = filtered.filter(rec => rec.cameraName === selectedCamera);
    }

    if (selectedZone !== 'all') {
      filtered = filtered.filter(rec => rec.zoneName === selectedZone);
    }

    setFilteredRecordings(filtered);
  }, [selectedCamera, selectedZone, allRecordings]);

  if (isLoading) {
    return (
      <View style={styles.animationContainer}>
        <StatusBar
          barStyle="dark-content" // or "light-content" depending on background
          backgroundColor="#fff" // match your loader bg color
          translucent={false} // ensures it’s visible
          hidden={false} // 👈 explicitly show it
        />
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

  const renderRecordingItem = (item, index) => {
    return (
      <TouchableOpacity
        style={styles.notificationContainer}
        key={item.id || index}
        onPress={() =>
          navigation.navigate('RecordingPage', {
            recording_id: item.id,
            name: item.name,
          })
        }>
        <View style={styles.notificationTitle}>
          <Text style={styles.notificationBoldText}>
            {item.name || 'No Title'}
          </Text>
          <Text style={styles.notificationTime}>
            Saved at: {item.savedDate ? item.savedDate : 'No Time'}
          </Text>
          <Text style={styles.notificationTime}>Camera: {item.cameraName}</Text>
          <Text style={styles.notificationTime}>Zone: {item.zoneName}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const onPress = () => {
    const zoneOption = ['Cancel', ...zoneOptions.map(zone => zone.label)];
    console.log(zoneOption);
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: zoneOption,
        cancelButtonIndex: 0,
        userInterfaceStyle: 'dark',
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          return;
        } else {
          console.log(zoneOptions[buttonIndex - 1]);
          const selectedZone = zoneOptions[buttonIndex - 1];
          setSelectedZone(selectedZone.value);
        }
      },
    );
  };

  const onPressCamera = () => {
    const cameraOption = ['Cancel', ...cameraOptions.map(zone => zone.label)];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: cameraOption,
        cancelButtonIndex: 0,
        userInterfaceStyle: 'dark',
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          return;
        } else {
          console.log(cameraOptions[buttonIndex - 1]);
          const selectedCamera = cameraOptions[buttonIndex - 1];
          setSelectedCamera(selectedCamera.value);
        }
      },
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 🔹 Dark header area */}
      <View style={styles.headerContainer}>
        <NavBar
          Content="Recordings"
          BackAction="Home"
          showThirdBtn={false}
          textStyle={{color: '#fff'}} // 👈 make heading text white
        />
      </View>
      {/* 🔹 White main content */}
      <View style={styles.contentContainer}>
        <Text style={{fontFamily: 'Poppins-SemiBold', fontSize: 16}}>
          Filters
        </Text>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between',
          }}>
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
                  width: '45%',
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
                  {(selectedZone &&
                    zoneOptions.find(zone => zone.id === selectedZone)?.name) ||
                    'Select Zone'}
                </Text>
              </TouchableOpacity>
            ),
            android: (
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '45%',
                }}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Regular',
                    fontSize: 13,
                    marginTop: 10,
                    color: 'gray',
                  }}>
                  Select Zone
                </Text>
                <View
                  style={{
                    backgroundColor: '#E7E7E7',
                    borderRadius: 40,
                    overflow: 'hidden', // Ensures corners are clipped
                    width: '100%',
                    height: 50,
                    justifyContent: 'center',
                  }}>
                  <Picker
                    selectedValue={selectedZone}
                    onValueChange={itemValue => setSelectedZone(itemValue)}
                    dropdownIconColor={'black'}
                    dropdownIconRippleColor={'#1E293B'}
                    style={{
                      width: '100%',
                      height: 50,
                      color: 'black',
                      fontFamily: 'Poppins-Regular',
                      paddingHorizontal: 10, // Optional: adds spacing inside
                    }}>
                    {zoneOptions.map((item, index) => (
                      <Picker.Item
                        key={index}
                        label={item.label}
                        value={item.value}
                        style={{
                          fontFamily: 'Poppins-Regular',
                          fontSize: 12,
                        }}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            ),
          })}
          {Platform.select({
            ios: (
              <TouchableOpacity
                onPress={onPressCamera}
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
                  width: '45%',
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
                  {(selectedCamera &&
                    cameraOptions.find(zone => zone.id === selectedCamera)
                      ?.name) ||
                    'Select Camera'}
                </Text>
              </TouchableOpacity>
            ),
            android: (
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '45%',
                }}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Regular',
                    fontSize: 13,
                    marginTop: 10,
                    color: 'gray',
                  }}>
                  Select Camera
                </Text>
                <View
                  style={{
                    backgroundColor: '#E7E7E7',
                    borderRadius: 20,
                    overflow: 'hidden', // ensures corners clip
                    width: '100%',
                    height: 50,
                    justifyContent: 'center',
                  }}>
                  <Picker
                    selectedValue={selectedCamera}
                    onValueChange={itemValue => setSelectedCamera(itemValue)}
                    dropdownIconColor="black"
                    style={{
                      width: '100%',
                      height: 50,
                      color: 'black',
                      fontFamily: 'Poppins-Regular',
                    }}>
                    {cameraOptions.map((item, index) => (
                      <Picker.Item
                        key={index}
                        label={item.label}
                        value={item.value}
                        style={{
                          fontFamily: 'Poppins-Regular',
                          fontSize: 12,
                        }}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            ),
          })}
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between',
          }}>
          {Platform.select({
            ios: (
              <>
                <TouchableOpacity
                  onPress={onPressStartDate}
                  style={styles.filterTouchable}>
                  <Text style={styles.filterText}>
                    {selectedStartDate || 'Start Date'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onPressEndDate}
                  style={styles.filterTouchable}>
                  <Text style={styles.filterText}>
                    {selectedEndDate || 'End Date'}
                  </Text>
                </TouchableOpacity>
              </>
            ),
            android: (
              <>
                <View style={{width: '45%'}}>
                  <Text style={styles.pickerLabel}>Start Date</Text>
                  <View
                    style={{
                      backgroundColor: '#E7E7E7',
                      borderRadius: 40,
                      overflow: 'hidden',
                      height: 50,
                      justifyContent: 'center',
                    }}>
                    <Picker
                      selectedValue={selectedStartDate}
                      onValueChange={itemValue =>
                        setSelectedStartDate(itemValue)
                      }
                      dropdownIconColor={'black'}
                      dropdownIconRippleColor={'#1E293B'}
                      style={{
                        width: '100%',
                        height: 50,
                        color: 'black',
                        fontFamily: 'Poppins-Regular',
                      }}>
                      {dateOptions.map((item, index) => (
                        <Picker.Item
                          key={index}
                          label={item.label}
                          value={item.value}
                          style={{
                            fontFamily: 'Poppins-Regular',
                            fontSize: 12,
                          }}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={{width: '45%'}}>
                  <Text style={styles.pickerLabel}>End Date</Text>
                  <View
                    style={{
                      backgroundColor: '#E7E7E7',
                      borderRadius: 40,
                      overflow: 'hidden',
                      height: 50,
                      justifyContent: 'center',
                    }}>
                    <Picker
                      selectedValue={selectedEndDate}
                      onValueChange={itemValue => {
                        if (
                          selectedStartDate &&
                          itemValue <= selectedStartDate
                        ) {
                          Toast.show({
                            type: 'error',
                            text1: 'Invalid Date Range',
                            text2: 'End date must be after start date.',
                          });
                          return;
                        }
                        setSelectedEndDate(itemValue);
                      }}
                      dropdownIconColor={'black'}
                      dropdownIconRippleColor={'#1E293B'}
                      style={{
                        width: '100%',
                        height: 50,
                        color: 'black',
                        fontFamily: 'Poppins-Regular',
                      }}>
                      {dateOptions.map((item, index) => (
                        <Picker.Item
                          key={index}
                          label={item.label}
                          value={item.value}
                          style={{
                            fontFamily: 'Poppins-Regular',
                            fontSize: 12,
                          }}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              </>
            ),
          })}
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'space-between',
          }}>
          {Platform.select({
            ios: (
              <>
                <TouchableOpacity
                  onPress={onPressStartTime}
                  style={styles.filterTouchable}>
                  <Text style={styles.filterText}>
                    {selectedStartTime || 'Start Time'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onPressEndTime}
                  style={styles.filterTouchable}>
                  <Text style={styles.filterText}>
                    {selectedEndTime || 'End Time'}
                  </Text>
                </TouchableOpacity>
              </>
            ),
            android: (
              <>
                <View style={{width: '45%'}}>
                  <Text style={styles.pickerLabel}>Start Time</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={selectedStartTime}
                      onValueChange={itemValue =>
                        setSelectedStartTime(itemValue)
                      }
                      dropdownIconColor={'black'}
                      dropdownIconRippleColor={'#1E293B'}
                      style={styles.picker}>
                      {timeOptions.map((item, index) => (
                        <Picker.Item
                          key={index}
                          label={item.label}
                          value={item.value}
                          style={styles.pickerItem}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>

                <View style={{width: '45%'}}>
                  <Text style={styles.pickerLabel}>End Time</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={selectedEndTime}
                      onValueChange={itemValue => {
                        // Validate end time
                        if (
                          selectedStartTime &&
                          itemValue <= selectedStartTime
                        ) {
                          Toast.show({
                            type: 'error',
                            text1: 'Invalid Time Range',
                            text2: 'End time must be after start time.',
                          });
                          return;
                        }
                        setSelectedEndTime(itemValue);
                      }}
                      dropdownIconColor={'black'}
                      dropdownIconRippleColor={'#1E293B'}
                      style={styles.picker}>
                      {timeOptions.map((item, index) => (
                        <Picker.Item
                          key={index}
                          label={item.label}
                          value={item.value}
                          style={styles.pickerItem}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              </>
            ),
          })}
        </View>
      </View>
      <ScrollView style={styles.form}>
        <View style={styles.container}>
          {filteredRecordings && filteredRecordings.length === 0 ? (
            <Text style={styles.noNotificationsText}>
              No recordings found with the selected filters.
            </Text>
          ) : (
            filteredRecordings && filteredRecordings.map(renderRecordingItem)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pickerWrapper: {
    backgroundColor: '#E7E7E7',
    borderRadius: 40,
    overflow: 'hidden', // ensures corners are rounded on Android
    height: 50,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    height: 50,
    color: 'black',
    fontFamily: 'Poppins-Regular',
  },
  pickerItem: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  pickerLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    marginTop: 10,
    color: 'gray',
  },

  safeArea: {
    flex: 1,
    backgroundColor: '#1E293B', // dark only for top
  },
  headerContainer: {
    backgroundColor: '#1E293B', // dark header area (NavBar section)
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff', // main content white
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: 20,

    marginTop: 6,
    marginBottom: 15,
    borderRadius: 30,
    minHeight: 170,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: 30,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flexGrow: 1,
    // backgroundColor: 'transparent',
  },
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 120,
    height: 120,
  },
  container: {
    flex: 1,
    paddingHorizontal: 5,
    width: '100%',
    marginBottom: 80,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
  },
  notificationContainer: {
    flexDirection: 'column',
    padding: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 10,
    marginVertical: 5,
  },
  notificationTitle: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginHorizontal: 20,
  },
  notificationBoldText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
  },
  notificationTime: {
    color: 'gray',
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  noNotificationsText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
    fontFamily: 'Poppins-Regular',
  },
  picker: {
    width: '100%',
    height: 50,
    borderRadius: 40,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#E7E7E7',
    color: 'black',
  },
  filterTouchable: {
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    borderColor: '#1E293B',
    borderRadius: 4,
    padding: 8,
    width: '45%',
    marginTop: 4,
    marginBottom: 10,
  },
  filterText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#1E293B',
    alignSelf: 'center',
  },
  pickerLabel: {
    fontFamily: 'Poppins-Regular',
    fontSize: 13,
    marginTop: 10,
    color: 'gray',
  },
  pickerItem: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    borderRadius: 15,
  },
});
