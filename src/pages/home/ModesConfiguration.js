import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import AnimatedLottieView from 'lottie-react-native';
import NavBar from '../../layouts/navigations/navbar';
import {getAllModes} from '../../components/apis/modes/getAllModes';
import {checkUserRole} from '../../components/utils/checkRole';

function ModesConfiguration() {
  const navigation = useNavigation();
  const animation = useRef(null);
  const [modes, setModes] = useState();
  const [isLoading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [menuVisible, setMenuVisible] = useState(null);

  const fetchData = async () => {
    try {
      const response = await getAllModes();
      const role = await checkUserRole();
      setUserRole(role);
      console.log(response);
      setModes(response);
    } catch (error) {
      console.error('Error fetching data:', error);
      errorMessage(
        'Data Error',
        'Unexpected Error, Try your internet connection and then try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    animation.current?.play();
    fetchData();
  }, []);

  const renderZoneItem = ({item}) => {
    const isMenuOpen = menuVisible === item.id;

    const handleMenuToggle = () => {
      setMenuVisible(isMenuOpen ? null : item.id);
    };

    const handleEdit = () => {
      console.log('Edit:', item.id);
      navigation.navigate('UpdateMode', {modeId: item.id, name: item.name});
      setMenuVisible(null);
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
            <Image source={item.img} style={{width: 40, height: 40}} />
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
          {(userRole === 0 ||
            userRole === 3 ||
            userRole === 4 ||
            userRole === 5) && (
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                fontSize: 11,
                color: 'gray',
              }}>
              No. of Cameras Associated: {item.cameraCount}
            </Text>
          )}
          {(userRole === 0 ||
            userRole === 1 ||
            userRole === 2 ||
            userRole === 5) && (
            <Text
              style={{
                fontFamily: 'Poppins-Regular',
                fontSize: 11,
                color: 'gray',
              }}>
              No. of Sensors Associated: {item.sensorsCount}
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (isLoading && !userRole) {
    return (
      <View style={styles.loadingContainer}>
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
    <SafeAreaView style={{flex: 1, backgroundColor: '#FFFFFF'}}>
      <View style={styles.container}>
        <NavBar
          Content="Modes Configuration"
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
            Modes
          </Text>
        </View>
        <View style={{flex: 1, paddingBottom: 60, paddingHorizontal: 20}}>
          <FlatList
            data={modes}
            renderItem={renderZoneItem}
            keyExtractor={item => item.id.toString()}
            numColumns={1}
            style={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

export default ModesConfiguration;
