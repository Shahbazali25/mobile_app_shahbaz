import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import AnimatedLottieView from 'lottie-react-native';
import NavBar from '../../layouts/navigations/navbar';
import {getAllUsers} from '../../components/apis/users/getAllUsers';
import {loadData} from '../../components/auth/loadData';

function AccountManagement() {
  const navigation = useNavigation();
  const animation = useRef(null);
  const [users, setUsers] = useState();
  const [isLoading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(null);

  const fetchData = async () => {
    try {
      const response = await getAllUsers();
      const currentUser = await loadData();
      if (currentUser && currentUser.email) {
        const filteredUsers = response.filter(
          user => user.email !== currentUser.email,
        );
        setUsers(filteredUsers);
      } else {
        setUsers(response);
      }
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
      navigation.navigate('EditUser', {
        user_id: item.id,
        cloud_id: item.cloud_id,
        name: item.firstName + ' ' + item.lastName,
      });
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
            <Image
              source={require('../../assets/imgs/profile-pic.jpg')}
              style={{width: 40, height: 40, borderRadius: 100}}
            />
            <Text style={styles.cameraName}>
              {item.firstName} {item.lastName}
            </Text>
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
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: 11,
              color: 'gray',
            }}>
            {item.email}
          </Text>
          <Text
            style={{
              fontFamily: 'Poppins-Regular',
              fontSize: 11,
              color: 'gray',
            }}>
            Role:{' '}
            {item.role === 0
              ? 'Admin'
              : item.role === 1
              ? 'Sensor Viewer'
              : item.role === 2
              ? 'Sensor Manager'
              : item.role === 3
              ? 'Camera Viewer'
              : item.role === 4
              ? 'Camera Manager'
              : 'Basic User'}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar
          barStyle="dark-content" // or "light-content" depending on background
          backgroundColor="#c99f9fff" // match your loader bg color
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

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#1E293B'}}>
      <View style={styles.container}>
        <NavBar
          Content="Accounts Management"
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
            Accounts
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddUser')}
            style={styles.button}>
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                color: 'white',
                fontSize: 12,
              }}>
              Add Account
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{flex: 1, paddingBottom: 100, paddingHorizontal: 20}}>
          <FlatList
            data={users}
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

export default AccountManagement;
