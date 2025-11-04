import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AnimatedLottieView from 'lottie-react-native';
import NavBar from '../../layouts/navigations/navbar';
import {getAllSensors} from '../../components/apis/sensors/getAllSensors';
import {deleteSensor} from '../../components/apis/sensors/deleteSensor';
import {sensorIcons} from '../../components/utils/icons';
import {checkUserRole} from '../../components/utils/checkRole';

function SensorSetup() {
  const navigation = useNavigation();
  const animation = useRef(null);

  const [sensors, setSensors] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [sensorToDelete, setSensorToDelete] = useState(null);
  const [menuVisible, setMenuVisible] = useState(null);

  useEffect(() => {
    animation.current?.play();
    allSensors();
  }, []);

  const allSensors = async () => {
    try {
      const role = await checkUserRole();
      setUserRole(role);
      const response = await getAllSensors();
      if (response) {
        setSensors(response);
        console.log(response);
      } else {
        console.error('Invalid sensors response:', response);
        setSensors(null);
      }
      console.log(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    console.log(sensorToDelete);
    const sensorDelete = await deleteSensor(sensorToDelete.id);
    console.log(sensorDelete);
    setDeleteModalVisible(false);
    if (sensorDelete.status === 200) {
      Toast.show({
        type: 'success',
        text1: `Sensor deleted`,
        text2: `${sensorToDelete.name} deleted Successfully`,
      });
      setLoading(true);
      allSensors();
    } else {
      Toast.show({
        type: 'error',
        text1: 'Zone Deleting Error',
        text2: String(error),
      });
    }
  };
  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setSensorToDelete(null);
  };

  if (isLoading && !userRole) {
    return (
      <View style={styles.loadingContainer}>
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
          autoPlay={true}
          loop
        />
      </View>
    );
  }

  const renderSensorItem = ({item}) => {
    const isMenuOpen = menuVisible === item.id;
    const handleMenuToggle = () => {
      setMenuVisible(isMenuOpen ? null : item.id);
    };

    const handleDelete = () => {
      setSensorToDelete(item);
      setDeleteModalVisible(true);
      setMenuVisible(null);
    };
    const handleEdit = () => {
      console.log('Edit:', item.id);
      console.log(item.mqttTopic);
      navigation.navigate('UpdateSensor', {
        sensorId: item.id,
        name: item.name,
        description: item.description,
        unit: item.unit,
        mqttTopic: item.mqttTopic,
        mqttHost: item.mqttHost,
        mqttPort: item.mqttPort,
        threshold: item.threshold,
        type: item.type,
        zoneId: item.zoneId,
      });
      setMenuVisible(null);
    };

    const sensorIcon = sensorId => {
      const foundSensor = sensors.find(sensor => sensor.id === sensorId);

      if (foundSensor && foundSensor.type) {
        console.log(foundSensor.type);
        if (sensorIcons[foundSensor.type]) {
          return sensorIcons[foundSensor.type];
        } else {
          console.warn(`Image not found for zone type: ${foundSensor.type}`);
        }
      }
    };

    return (
      <View style={styles.cameraContainer}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 10,
          }}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
            }}>
            <Image
              source={sensorIcon(item.id)}
              style={{width: 40, height: 40}}
            />
            <Text style={styles.cameraName}>{item.name}</Text>
          </View>
          {(userRole === 0 || userRole === 2) && (
            <TouchableOpacity onPress={handleMenuToggle}>
              <Image
                source={require('../../assets/imgs/icons/options-dots.png')}
                style={styles.optionsDots}
              />
            </TouchableOpacity>
          )}
          {isMenuOpen && (
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleEdit(item)}>
                <Image
                  source={require('../../assets/imgs/icons/pencil.png')}
                  style={styles.optionsIcons}
                />
                <Text style={{fontFamily: 'Poppins-Regular', fontSize: 11}}>
                  Edit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, {borderBottomWidth: 0}]}
                onPress={handleDelete}>
                <Image
                  source={require('../../assets/imgs/icons/delete.png')}
                  style={styles.optionsIcons}
                />
                <Text
                  style={{
                    fontFamily: 'Poppins-Regular',
                    fontSize: 11,
                    color: 'red',
                  }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View
          key={item.id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            paddingHorizontal: 10,
            marginTop: 7,
          }}>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: 13,
              color: 'gray',
            }}>
            {item.description}
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: 11,
              color: 'gray',
            }}>
            Last Reading: {item.lastReading}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <NavBar
          Content="Sensors Configuration"
          BackAction="My Profile"
          showThirdBtn={false}
        />
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            marginTop: 7,
          }}>
          <Text style={{fontFamily: 'Poppins-SemiBold', fontSize: 18}}>
            Sensors
          </Text>
          {(userRole === 0 || userRole === 2) && (
            <TouchableOpacity
              onPress={() => navigation.navigate('AddSensor')}
              style={styles.button}>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  color: 'white',
                  fontSize: 12,
                }}>
                Add Sensor
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{flex: 1, paddingBottom: 90, paddingHorizontal: 20}}>
          <FlatList
            data={sensors}
            renderItem={renderSensorItem}
            keyExtractor={item => item.id.toString()}
            numColumns={1}
            style={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Do you really want to delete the{' '}
              {sensorToDelete && sensorToDelete.name}?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={confirmDelete}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={cancelDelete}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E293B', // dark only behind status bar / edges
  },
  container: {
    flex: 1,
    backgroundColor: '#fff', // 👈 white background for content area
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 7,
  },

  // container: {
  //   flex: 1,
  // },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 200,
    height: 200,
  },
  scrollViewContent: {
    flexGrow: 1,
    flex: 1,
    borderWidth: 1,
    borderRadius: 9,
    borderColor: 'lightgray',
    marginTop: 12,
  },

  optionsIcons: {
    width: 14,
    height: 14,
    marginHorizontal: 3,
  },

  cameraContainer: {
    width: '100%',
    backgroundColor: 'white',
    paddingVertical: 12,
    display: 'flex',
    flexDirection: 'column',
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  cameraName: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    marginHorizontal: 8,
  },
  optionsDots: {
    width: 20,
    height: 20,
  },

  menuContainer: {
    position: 'absolute',
    top: 24,
    right: 32,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#D8E1E8',
    zIndex: 99999,
  },
  menuItem: {
    padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
    fontFamily: 'Poppins-Regular',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },

  button: {
    border: 0,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 9,
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    marginTop: 'auto',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    width: '45%',
  },
  deleteButtonText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    width: '45%',
  },
  cancelButtonText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
  },
});

export default SensorSetup;
