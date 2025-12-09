import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import AnimatedLottieView from 'lottie-react-native';
import NavBar from '../../layouts/navigations/navbar';
import {getAllZones} from '../../components/apis/zones/getAllZones';
import {deleteZone} from '../../components/apis/zones/deleteZone';

function ZonesConfiguration() {
  const navigation = useNavigation();
  const animation = useRef(null);

  const [zones, setZones] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState(null);
  const [menuVisible, setMenuVisible] = useState(null);

  useEffect(() => {
    animation.current?.play();
    allZones();
  }, []);

  const allZones = async () => {
    try {
      const response = await getAllZones();
      if (response && Array.isArray(response)) {
        setZones(response);
        console.log(response);
      } else {
        console.error('Invalid zones response:', response);
        setZones(null);
      }
      console.log(response);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    console.log(zoneToDelete);
    const zoneDelete = await deleteZone(zoneToDelete.id);
    console.log(zoneDelete);
    setDeleteModalVisible(false);
    if (zoneDelete.status === 200) {
      Toast.show({
        type: 'success',
        text1: `Zone deleted`,
        text2: `${zoneToDelete.name} deleted Successfully`,
      });
          allZones();

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
    setZoneToDelete(null);
  };

  const renderZoneItem = ({item}) => {
    const isMenuOpen = menuVisible === item.id;

    const handleMenuToggle = () => {
      setMenuVisible(isMenuOpen ? null : item.id);
    };

    const handleDelete = () => {
      setZoneToDelete(item);
      setDeleteModalVisible(true);
      setMenuVisible(null);
    };
    const handleEdit = () => {
      console.log('Edit:', item.id);
      navigation.navigate('UpdateZone', {zoneId: item.id});
      setMenuVisible(null);
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
      all: require('../../assets/imgs/zoneIcons/office.png'),
    };

    const zoneIcon = zoneId => {
      const foundZone = zones.find(zone => zone.id === zoneId);

      if (foundZone && foundZone.type) {
        console.log(foundZone.type);
        if (zoneIcons[foundZone.type]) {
          return zoneIcons[foundZone.type];
        } else {
          console.warn(`Image not found for zone type: ${foundZone.type}`);
          return zoneIcons['all'];
        }
      } else {
        return zoneIcons['all'];
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
            <Image source={zoneIcon(item.id)} style={{width: 50, height: 50}} />
            <Text style={styles.cameraName}>{item.name}</Text>
          </View>
          <TouchableOpacity onPress={handleMenuToggle}>
            <Image
              source={require('../../assets/imgs/icons/options-dots.png')}
              style={styles.optionsDots}
            />
          </TouchableOpacity>
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
            No. of Cameras Associated: {item.cameraCount}
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: 11,
              color: 'gray',
            }}>
            No. of Sesnors Associated: {item.sensorsCount}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
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
    <SafeAreaView style={{flex: 1, backgroundColor: '#1E293B'}}>
      <View style={styles.container}>
        <NavBar
          Content="Zones Configuration"
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
            Zones
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddCameraZone')}
            style={styles.button}>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                color: 'white',
                fontSize: 12,
              }}>
              Add Zone
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{flex: 1, paddingBottom: 90, paddingHorizontal: 20}}>
          <FlatList
            data={zones}
            renderItem={renderZoneItem}
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
              {zoneToDelete && zoneToDelete.name}?
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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

export default ZonesConfiguration;
