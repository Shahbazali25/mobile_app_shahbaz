import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActionSheetIOS,
  Button,
  Platform,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Carousel from 'react-native-snap-carousel';
import AnimatedLottieView from 'lottie-react-native';
import {useNavigation} from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {VLCPlayer} from 'react-native-vlc-media-player';
import CameraNotifications from './cameraNotifications';
import webSocketService from '../components/services/socketConnection';
import {getAllZones} from '../components/apis/zones/getAllZones';
import {getCameraByZone} from '../components/apis/zones/getCamerasByZone';
import {getAllCameras} from '../components/apis/cameras/getAllCameras';
import {getAllSensors} from '../components/apis/sensors/getAllSensors';
import errorMessage from '../components/utils/errorMessage';
import {zoneIcons, sensorIcons} from '../components/utils/icons';
import shortenName from '../components/utils/shortenName';
import {getAllModes} from '../components/apis/modes/getAllModes';
import {getActiveMode} from '../components/apis/modes/getActiveMode';
import successMessage from '../components/utils/successMessage';
import {activateMode} from '../components/apis/modes/activateMode';
import {getSensorByZone} from '../components/apis/zones/getSensorsByZone';
import {screenWidth} from '../components/utils/constants';
import {checkUserRole} from '../components/utils/checkRole';
import NetInfo from '@react-native-community/netinfo';
import WebrtcWebView from '../components/WebrtcWebView';
import CustomZonePicker from './CustomZonePicker'; // Adjust path as needed
import CustomCameraStatusPicker from './CustomCameraStatusPicker'; // Adjust path as needed

function Cameras({userData}) {
  const animation = useRef(null);
  const [isLoading, setLoading] = useState(true);
  const [cameras, setCameras] = useState(null);
  const [selectedOption, setSelectedOption] = useState('all');
  const [zones, setZones] = useState(null);
  const [selectedStatus, setStatusOption] = useState('All Cameras');
  const navigation = useNavigation();
  const [notificationCount, setNotificationCount] = useState(0);
  const [sensorValues, setSensorValues] = useState(null);
  const [sensors, setSensors] = useState(null);
  const [modes, setModes] = useState();
  const [activeMode, setActiveMode] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    checkConnection();

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    webSocketService
      .connect()
      .then(() => {
        checkUserRole()
          .then(role => {
            if (role === 0 || role === 1 || role === 2 || role == 5) {
              setupSocketListeners();
            }
          })
          .catch(err => {
            console.log(String(err));
          });
      })
      .catch(err => {
        console.error('Failed to connect to socket:', err);
      });

    return () => {
      webSocketService.disconnect();
    };
  }, []);

  useEffect(() => {
    animation.current?.play();
    fetchInitialData();
  }, []);

  const filterCamerasByActiveMode = (camerasToFilter, linkedCameraIds) => {
    const filtered = camerasToFilter.filter(camera =>
      linkedCameraIds.includes(camera.network_id),
    );
    setCameras(filtered);
  };

  const filterSensorsByActiveMode = (sensorsToFilter, linkedSensorIds) => {
    const filtered = sensorsToFilter.filter(sensor =>
      linkedSensorIds.includes(String(sensor.id)),
    );
    setSensors(filtered);
  };

  const checkConnection = async () => {
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected);
  };

  const onPress = () => {
    const zoneOptions = [
      'Cancel',
      'All Zones',
      ...zones.map(zone => zone.name),
    ];

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: zoneOptions,
        cancelButtonIndex: 0,
        userInterfaceStyle: 'dark',
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          return;
        }

        if (buttonIndex === 1) {
          handleZoneChange('all');
        } else {
          const selectedZone = zones[buttonIndex - 2];
          handleZoneChange(selectedZone.id);
        }
      },
    );
  };

  const onPressCameraStatus = () => {
    const statusOptions = [
      'Cancel',
      'All Cameras',
      'Active Cameras',
      'InActive Cameras',
    ];

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: statusOptions,
        cancelButtonIndex: 0,
        userInterfaceStyle: 'dark',
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          // Cancel action
          return;
        }

        if (buttonIndex === 1) {
          // All Zones selected
          setStatusOption('All Cameras');
        } else if (buttonIndex === 2) {
          setStatusOption('Active Cameras');
        } else if (buttonIndex === 3) {
          setStatusOption('InActive Cameras');
        }
      },
    );
  };

  const fetchInitialData = async () => {
    try {
      const role = await checkUserRole();
      setUserRole(role);
      await retrieveCount();
      const allModes = await getAllModes();
      setModes(allModes);
      const active = await getActiveMode();
      setActiveMode(active);

      if (role === 4 || role === 3 || role === 5) {
        const fetchedCameras = await getAllCameras();
        if (active && allModes.length > 0) {
          const currentActiveMode = allModes.find(mode => mode.id === active);
          if (currentActiveMode) {
            filterCamerasByActiveMode(
              fetchedCameras,
              currentActiveMode.linkedCameras,
            );
          } else {
            setCameras(fetchedCameras);
          }
        } else {
          setCameras(fetchedCameras);
        }
      } else if (role === 1 || role === 2 || role === 5) {
        const response = await getAllSensors();
        console.log(response);
        if (response) {
          if (active && allModes.length > 0) {
            const currentActiveMode = allModes.find(mode => mode.id === active);
            if (currentActiveMode) {
              filterSensorsByActiveMode(
                response,
                currentActiveMode.linkedSensors,
              );
            } else {
              setSensors(response);
            }
          } else {
            setSensors(response);
          }
        } else {
          console.error('Invalid zones response:', response);
          setSensors(null);
        }
      } else {
        const response = await getAllSensors();
        console.log(response);
        if (response) {
          if (active && allModes.length > 0) {
            const currentActiveMode = allModes.find(mode => mode.id === active);
            if (currentActiveMode) {
              filterSensorsByActiveMode(
                response,
                currentActiveMode.linkedSensors,
              );
            } else {
              setSensors(response);
            }
          } else {
            setSensors(response);
          }
        } else {
          console.error('Invalid zones response:', response);
          setSensors(null);
        }
        const fetchedCameras = await getAllCameras();
        if (active && allModes.length > 0) {
          const currentActiveMode = allModes.find(mode => mode.id === active);
          if (currentActiveMode) {
            filterCamerasByActiveMode(
              fetchedCameras,
              currentActiveMode.linkedCameras,
            );
          } else {
            setCameras(fetchedCameras);
          }
        } else {
          setCameras(fetchedCameras);
        }
      }
    } catch (error) {
      errorMessage('Error', String(error));
    } finally {
      allZones();
    }
  };

  const setupSocketListeners = () => {
    webSocketService.on('home', data => {
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        setSensorValues(parsedData.messages);
      } catch (error) {
        console.error('Error parsing alert data:', error);
      }
    });
  };

  const allZones = async () => {
    try {
      const response = await getAllZones();
      if (response && Array.isArray(response)) {
        setZones([{id: 'all', name: 'All Zones'}, ...response]);
      } else {
        console.error('Invalid zones response:', response);
        setZones([{id: 'all', name: 'All Zones'}]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const retrieveCount = async () => {
    try {
      const countString = await AsyncStorage.getItem('notificationCount');
      if (countString !== null) {
        // console.log('COUNT', countString);
        const count = parseInt(countString, 10);
        // console.log('COUNT-INT', count);
        setNotificationCount(count);
      } else {
      }
    } catch (error) {
      console.error('Error retrieving notification count:', error);
    }
  };

  const camerasOfSpecificZone = async zoneId => {
    try {
      const response = await getCameraByZone(zoneId);
      if (activeMode && modes.length > 0) {
        const currentActiveMode = modes.find(mode => mode.id === activeMode);
        if (currentActiveMode) {
          filterCamerasByActiveMode(response, currentActiveMode.linkedCameras);
        } else {
          setCameras(response);
        }
      } else {
        setCameras(response);
      }
    } catch (error) {
      console.error('Error fetching cameras by zone:', error);
      errorMessage(
        'Zone Cameras Error',
        'Failed to fetch cameras for the selected zone.',
      );
      setCameras([]);
    }
  };

  const sensorsOfSpecificZone = async zoneId => {
    try {
      const response = await getSensorByZone(zoneId);
      if (activeMode && modes.length > 0) {
        const currentActiveMode = modes.find(mode => mode.id === activeMode);
        if (currentActiveMode) {
          filterSensorsByActiveMode(response, currentActiveMode.linkedSensors);
        } else {
          setSensors(response);
        }
      } else {
        setSensors(response);
      }
    } catch (error) {
      console.error('Error fetching sensors by zone:', error);
      errorMessage(
        'Zone Sensors Error',
        'Failed to fetch sensors for the selected zone.',
      );
      setSensors([]);
    }
  };

  const getZoneName = zoneId => {
    const foundZone = zones && zones.find(zone => zone.id === zoneId);
    return foundZone ? foundZone.name : 'Unknown Zone';
  };

  const zoneIcon = zoneId => {
    const foundZone = zones && zones.find(zone => zone.id === zoneId);

    if (foundZone && foundZone.type) {
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

  const activateSpecificMode = async modeId => {
    const foundMode = modes.find(mode => mode.id === modeId);
    try {
      const response = await activateMode(modeId);
      if (response.data.status === 200) {
        successMessage(
          'Mode Activated',
          `${foundMode.name} activated Succesfully`,
        );
        setActiveMode(modeId);
        fetchInitialData();
      } else {
        errorMessage('Error', `Error while activating ${foundMode.name} mode`);
      }
    } catch (error) {
      errorMessage('Error', `Error while activating ${foundMode.name} mode`);
    }
  };

  const renderCameraItem = ({item}) => {
    const hasHls = isConnected ? item.cloudHls : item.localHls;

    const truncatedName = shortenName(20, item.name, 'Unnamed Camera');

    return (
      <View style={styles.cameraContainer}>
        {hasHls ? (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ViewCamera', {
                camera_id: item.network_id,
                stream_link: isConnected ? item.cloudHls : item.localHls,
                local_stream_link: item.localHls,
              })
            }>
            <VLCPlayer
              source={{uri: isConnected ? item.cloudHls : item.localHls}}
              style={styles.videoPlayer}
              autoPlay={true}
              muted={true}
              mediaOptions={{
                ':network-caching': 150,
                ':live-caching': 0,
                ':file-caching': 0,
                ':live-caching': 0,
                ':network-caching': 150,
                ':clock-jitter': 0,
                ':clock-synchro': 0,
              }}
            />
          </TouchableOpacity>
        ) : (
          <Image
            source={require('../assets/imgs/stream-na.png')}
            style={styles.cameraImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.cameraInfo}>
          <Text style={styles.cameraName}>
            {truncatedName || 'Unnamed Camera'}
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Image
              source={
                item.localHls
                  ? require('../assets/imgs/icons/lan-network-on.png')
                  : require('../assets/imgs/icons/lan-network.png')
              }
              style={{width: 16, height: 16, marginHorizontal: 6}}
            />
            <Image
              source={
                item.cloudHls
                  ? require('../assets/imgs/icons/wifi.png')
                  : require('../assets/imgs/icons/wifi-off.png')
              }
              style={{width: 16, height: 16, marginHorizontal: 6}}
            />
          </View>
        </View>
      </View>
    );
  };

  const handleZoneChange = zoneId => {
    setSelectedOption(zoneId);
    if (zoneId === 'all') {
      fetchInitialData();
    } else {
      if (userRole === 4 || userRole === 3) {
        camerasOfSpecificZone(zoneId);
      } else if (userRole === 1 || userRole === 2) {
        sensorsOfSpecificZone(zoneId);
      } else {
        camerasOfSpecificZone(zoneId);
        sensorsOfSpecificZone(zoneId);
      }
    }
  };

  const filterCamerasByStatus = (camerasToFilter, status) => {
    if (status === 'All Cameras') {
      return camerasToFilter;
    } else if (status === 'Active Cameras') {
      return camerasToFilter.filter(camera =>
        isConnected ? camera.cloudHls : camera.localHls,
      );
    } else {
      return camerasToFilter.filter(camera =>
        isConnected ? !camera.cloudHls : !camera.localHls,
      );
    }
  };

  const filteredCameras = filterCamerasByStatus(cameras, selectedStatus);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content" // or "light-content" depending on background
          backgroundColor="#fff" // match your loader bg color
          translucent={false} // ensures it’s visible
          hidden={false} // 👈 explicitly show it
        />
        <AnimatedLottieView
          ref={animation}
          source={require('../assets/animations/camera-animation.json')}
          style={styles.animation}
          autoPlay={true}
          loop
        />
      </View>
    );
  }

  const renderSensorViews = () => {
    if (!sensors) {
      return null;
    }

    return sensors.map(sensor => {
      const alertMessage =
        sensorValues &&
        sensorValues.find(value => value.topic === sensor.mqttTopic);
      // console.log(sensorValues)
      const iconSource =
        sensorIcons[sensor.type] || require('../assets/imgs/icons/faucet.png');
      let valueText = 'N/A';
      let dangerAlert = false;

      if (alertMessage) {
        const originalMessage = alertMessage.message;
        const numericMatch = originalMessage.match(/(\d+\.?\d*)/);

        if (numericMatch && numericMatch[0]) {
          valueText = parseFloat(numericMatch[0]);
          if (valueText === Math.floor(valueText)) {
            valueText = Math.floor(valueText);
          }
          if (valueText > sensor.threshold || valueText == sensor.threshold) {
            dangerAlert = true;
          } else {
            dangerAlert = false;
          }
        } else {
          valueText = 'N/A';
        }
        // console.log(valueText);
      }

      return (
        <View
          key={sensor.id}
          style={{
            marginVertical: 4,
            maxWidth: 100,
            width: 100,
            minHeight: 100,
            paddingVertical: 10,
            paddingHorizontal: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'lightgray',
            borderRadius: 10,
            // marginHorizontal: ,
          }}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 2,
            }}>
            <Image
              source={iconSource}
              style={{width: 15, height: 15, marginRight: 2}}
            />
            <Text
              style={{
                alignSelf: 'center',
                fontSize: 12,
                fontFamily: 'Poppins-Bold',
                color: '#1B3C55',
              }}>
              {valueText} {valueText !== 'N/A' && sensor.unit}
            </Text>
          </View>
          <Text
            style={{
              alignSelf: 'center',
              marginVertical: 2,
              fontFamily: 'Poppins-Regular',
              fontSize: 10,
              textAlign: 'center',
            }}>
            {sensor.name}
          </Text>
          {dangerAlert ? (
            <View
              style={{
                backgroundColor: '#ffcbd1',
                borderRadius: 16,
                borderWidth: 0,
                paddingHorizontal: 6,
                paddingVertical: 2,
                marginVertical: 5,
              }}>
              <Text
                style={{
                  color: '#c30010',
                  fontSize: 8,
                  fontFamily: 'Poppins-SemiBold',
                }}>
                Danger
              </Text>
            </View>
          ) : valueText === 'N/A' ? (
            <View
              style={{
                backgroundColor: '#d3d3d3',
                borderRadius: 16,
                borderWidth: 0,
                paddingHorizontal: 6,
                paddingVertical: 2,
                marginVertical: 5,
              }}>
              <Text
                style={{
                  color: 'gray',
                  fontSize: 8,
                  fontFamily: 'Poppins-SemiBold',
                }}>
                N/A
              </Text>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: '#abf7b1',
                borderRadius: 16,
                borderWidth: 0,
                paddingHorizontal: 6,
                paddingVertical: 2,
                marginVertical: 5,
              }}>
              <Text
                style={{
                  color: 'darkgreen',
                  fontSize: 8,
                  fontFamily: 'Poppins-SemiBold',
                }}>
                Idle
              </Text>
            </View>
          )}
        </View>
      );
    });
  };

  // Helper function to render single camera
  const renderSingleCamera = camera => {
    const truncatedName = shortenName(20, camera.name, 'Unnamed Camera');
    console.log('\n\n\n\n ############\n\nRendering single camera:', camera);
    // i want to modify the 'hasHls' value if 'camera.cloudHls' exists and if not

    const hasHls = isConnected ? camera.cloudHls : camera.localHls;

    let rtcUrl =
      isConnected &&
      hasHls?.replace('port/8888', 'rtc').replace('/index.m3u8', '/');
    console.log('RTC URL:', rtcUrl);

    return (
      <View style={styles.cameraContainer}>
        {hasHls ? (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ViewCamera', {
                camera_id: camera.network_id,
                stream_link: isConnected ? camera.cloudHls : camera.localHls,
                local_stream_link: camera.localHls,
              })
            }>
            {/* if isConnected then show WebrtcWebView otherwise show VLCPlayer */}
            {isConnected ? (
              <WebrtcWebView
                rtcUrl={rtcUrl}
                height={205}
                onError={syntheticEvent => {
                  const {nativeEvent} = syntheticEvent;
                  console.error('WebView error: ', nativeEvent);
                }}
                onMessage={event => {
                  try {
                    const data = JSON.parse(event.nativeEvent.data);
                    console.log(`[WebRTC ${data.type}]:`, data.message);
                  } catch (e) {
                    console.log('WebView message:', event.nativeEvent.data);
                  }
                }}
                onLoadEnd={() => {
                  console.log('WebView loaded');
                }}
              />
            ) : (
              <VLCPlayer
                source={{
                  uri: isConnected ? camera.cloudHls : camera.localHls,
                }}
                style={styles.videoPlayer}
                autoPlay={true}
                muted={true}
                mediaOptions={{
                  ':network-caching': 150,
                  ':live-caching': 0,
                  ':file-caching': 0,
                  ':live-caching': 0,
                  ':network-caching': 150,
                  ':clock-jitter': 0,
                  ':clock-synchro': 0,
                }}
              />
            )}
          </TouchableOpacity>
        ) : (
          <Image
            source={require('../assets/imgs/stream-na.png')}
            style={styles.cameraImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.cameraInfo}>
          <Text style={styles.cameraName}>
            {truncatedName || 'Unnamed Camera'}
          </Text>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <Image
              source={
                camera.localHls
                  ? require('../assets/imgs/icons/lan-network-on.png')
                  : require('../assets/imgs/icons/lan-network.png')
              }
              style={{width: 16, height: 16, marginHorizontal: 6}}
            />
            <Image
              source={
                camera.cloudHls
                  ? require('../assets/imgs/icons/wifi.png')
                  : require('../assets/imgs/icons/wifi-off.png')
              }
              style={{width: 16, height: 16, marginHorizontal: 6}}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <View style={{paddingBottom: 30}}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 14,
            paddingTop: 14,
          }}>
          <View style={styles.rightContainer}>
            <Image
              source={{
                uri: 'https://ibexvision.ai/assets/Updatelogo-8vB67Jtk.png',
              }}
              style={{
                width: 120,
                height: 40,
                resizeMode: 'contain',
              }}
            />
            <View style={styles.connectionStatus}>
              <Image
                source={
                  isConnected
                    ? require('../assets/imgs/icons/wifi.png')
                    : require('../assets/imgs/icons/wifi-off.png')
                }
                style={styles.wifiIcon}
              />
              <Text style={styles.connectionText}>
                {isConnected ? 'Connected' : 'Not Connected'}
              </Text>
            </View>
          </View>
          <View style={styles.notificationContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}>
              <Image
                source={require('../assets/imgs/icons/bell.png')}
                style={{width: 21, height: 21, marginHorizontal: 3}}
              />
            </TouchableOpacity>
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </View>
        </View>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 14,
          }}>
          <Image
            source={require('../assets/imgs/profile-pic.jpg')}
            style={{
              width: 40,
              height: 40,
              borderRadius: 100,
              borderWidth: 1,
              borderColor: 'lightgray',
            }}
          />
          <View style={{display: 'flex', flexDirection: 'column', padding: 14}}>
            <Text style={{fontSize: 12, fontFamily: 'Poppins-Regular'}}>
              Hey {userData.firstName} (
              {userRole === 0
                ? 'Admin'
                : userRole === 1
                ? 'Sensors Viewer'
                : userRole === 2
                ? 'Sensors Manager'
                : userRole === 3
                ? 'Camera Viewer'
                : userRole === 4
                ? 'Camera Manager'
                : userRole === 5
                ? 'Basic User'
                : 'Unknown Role'}
              ),
            </Text>
            <Text style={{fontSize: 12, fontFamily: 'Poppins-Regular'}}>
              Welcome to ibexEye!
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            // marginVertical: 6,
            marginHorizontal: 16,
            borderRadius: 12,
            padding: 8,
          }}>
          {modes &&
            modes.map(mode => (
              <TouchableOpacity
                key={mode.id}
                onPress={() => activateSpecificMode(mode.id)}
                style={{
                  flex: 1,
                  marginHorizontal: 4,
                }}>
                <View
                  style={{
                    backgroundColor:
                      mode.id === activeMode ? '#1E293B' : 'white',
                    borderRadius: 8,
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: mode.id === activeMode ? '#1E293B' : '#E5E7EB',
                  }}>
                  <Image
                    source={mode.img}
                    style={{
                      width: 20,
                      height: 20,
                      tintColor: mode.id === activeMode ? 'white' : '#64748B',
                    }}
                  />
                  <Text
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                      fontFamily: 'Poppins-Medium',
                      color: mode.id === activeMode ? 'white' : '#64748B',
                      textAlign: 'center',
                    }}>
                    {mode.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
        </View>
        {/* Compact Filter Button */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            marginVertical: 10,
          }}>
          {/* Selected Zone Display */}
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              borderRadius: 8,
              padding: 12,
              marginRight: 10,
              borderWidth: 1,
              borderColor: '#E5E7EB',
            }}>
            <Image
              source={zoneIcon(selectedOption)}
              style={{width: 22, height: 22, marginRight: 8}}
            />
            <Text
              style={{
                fontFamily: 'Poppins-Medium',
                fontSize: 12,
                color: '#1E293B',
                flex: 1,
              }}>
              {getZoneName(selectedOption)}
            </Text>
          </View>

          {/* Filter Toggle Button */}
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={{
              backgroundColor: showFilters ? '#1E293B' : '#F8FAFC',
              borderWidth: 1,
              borderColor: '#E5E7EB',
              borderRadius: 8,
              padding: 12,
              minWidth: 44,
              minHeight: 48,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{fontSize: 12}}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Expandable Filters Section */}
        {showFilters && (
          <View
            style={{
              backgroundColor: 'white',
              marginHorizontal: 20,
              padding: 10,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: '#d8dfe9ff',
              borderRadius: 8,
            }}>
            <Text
              style={{
                fontFamily: 'Poppins-SemiBold',
                fontSize: 16,
                marginBottom: 12,
                color: '#1E293B',
              }}>
              Filters
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 12,
              }}>
              {/* Zone Filter - Works on both iOS and Android */}
              <View style={{flex: 1}}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Regular',
                    fontSize: 15,
                    marginBottom: 4,
                    color: '#23416bff',
                  }}>
                  Select Zone
                </Text>
                <CustomZonePicker
                  zones={zones}
                  selectedOption={selectedOption}
                  handleZoneChange={handleZoneChange}
                />
              </View>

              {/* Zone Filter */}
              {/* {Platform.select({
                ios: (
                  <TouchableOpacity
                    onPress={onPress}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: '#1E293B',
                      borderRadius: 8,
                      padding: 12,
                      alignItems: 'center',
                    }}>
                    <Text
                      style={{
                        fontFamily: 'Poppins-Regular',
                        fontSize: 12,
                        color: '#1E293B',
                      }}>
                      {selectedOption
                        ? selectedOption === 'all'
                          ? 'All Zones'
                          : zones.find(zone => zone.id === selectedOption)
                              ?.name || 'Select Zone'
                        : 'Select Zone'}
                    </Text>
                  </TouchableOpacity>
                ),
                android: (
                  <View style={{flex: 1}}>
                    <Text
                      style={{
                        fontFamily: 'Poppins-Regular',
                        fontSize: 12,
                        marginBottom: 4,
                        color: '#64748B',
                      }}>
                      Select Zone
                    </Text>
                    <Picker
                      selectedValue={selectedOption}
                      onValueChange={handleZoneChange}
                      dropdownIconColor={'#1E293B'}
                      style={{
                        borderWidth: 1,
                        borderColor: '#E5E7EB',
                        borderRadius: 8,
                        color: '#64748B',
                      }}>
                      {zones &&
                        zones.map(zone => (
                          <Picker.Item
                            label={zone.name}
                            key={zone.id}
                            value={zone.id}
                            style={{
                              fontFamily: 'Poppins-Regular',
                              fontSize: 12,
                              backgroundColor: '#fcf0f0ff',
                            }}
                          />
                        ))}
                    </Picker>
                  </View>
                ),
              })} */}

              {/* Camera Status Filter */}
              {(userRole === 0 ||
                userRole === 3 ||
                userRole === 4 ||
                userRole === 5) && (
                <View style={{flex: 1}}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Regular',
                      fontSize: 15,
                      marginBottom: 4,
                      color: '#23416bff',
                    }}>
                    Camera Status
                  </Text>
                  <CustomCameraStatusPicker
                    selectedStatus={selectedStatus}
                    setStatusOption={setStatusOption}
                  />
                </View>
              )}

              {/* Camera Status Filter */}
              {/* {(userRole === 0 ||
                userRole === 3 ||
                userRole === 4 ||
                userRole === 5) &&
                Platform.select({
                  ios: (
                    <TouchableOpacity
                      onPress={onPressCameraStatus}
                      style={{
                        flex: 1,
                        borderWidth: 1,
                        borderColor: '#1E293B',
                        borderRadius: 8,
                        padding: 12,
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          fontFamily: 'Poppins-Regular',
                          fontSize: 12,
                          color: '#1E293B',
                        }}>
                        {selectedStatus}
                      </Text>
                    </TouchableOpacity>
                  ),
                  android: (
                    <View style={{flex: 1}}>
                      <Text
                        style={{
                          fontFamily: 'Poppins-Regular',
                          fontSize: 12,
                          marginBottom: 4,
                          color: '#64748B',
                        }}>
                        Camera Status
                      </Text>
                      <Picker
                        selectedValue={selectedStatus}
                        onValueChange={setStatusOption}
                        dropdownIconColor={'#1E293B'}
                        style={{
                          borderWidth: 1,
                          borderColor: '#E5E7EB',
                          borderRadius: 8,
                          color: '#64748B',
                          fontFamily: 'Poppins-Regular',
                        }}>
                        <Picker.Item
                          label={'All Cameras'}
                          value={'All Cameras'}
                          style={{
                            fontSize: 12,
                            fontFamily: 'Poppins-Regular',
                          }}
                        />
                        <Picker.Item
                          label={'Active Cameras'}
                          value={'Active Cameras'}
                          style={{
                            fontSize: 12,
                            fontFamily: 'Poppins-Regular',
                          }}
                        />
                        <Picker.Item
                          label={'InActive Cameras'}
                          value={'InActive Cameras'}
                          style={{
                            fontSize: 12,
                            fontFamily: 'Poppins-Regular',
                          }}
                        />
                      </Picker>
                    </View>
                  ),
                })} */}
            </View>
          </View>
        )}
        {(userRole === 0 ||
          userRole === 1 ||
          userRole === 2 ||
          userRole === 5) && (
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: 10,
              paddingHorizontal: 20,
              width: '100%',
            }}>
            <Text style={{fontFamily: 'Poppins-SemiBold', fontSize: 16}}>
              Sensors
            </Text>

            {sensors && sensors.length > 0 ? (
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-evenly',
                  flexWrap: 'wrap',
                }}>
                {renderSensorViews()}
              </View>
            ) : (
              <Text
                style={{
                  color: 'gray',
                  alignSelf: 'center',
                  fontFamily: 'Poppins-Medium',
                  fontSize: 13,
                  marginTop: 6,
                }}>
                No Sensors to Show
              </Text>
            )}
          </View>
        )}
        {(userRole === 0 ||
          userRole === 3 ||
          userRole === 4 ||
          userRole === 5) && (
          <View style={styles.camerasSection}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text style={{fontFamily: 'Poppins-SemiBold', fontSize: 16}}>
                Cameras{' '}
                <Text
                  style={{
                    marginTop: 12,
                    fontFamily: 'Poppins-Medium',
                    fontSize: 12,
                    color: 'gray',
                  }}>
                  ({selectedStatus})
                </Text>
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Cameras')}>
                <Text
                  style={{
                    fontFamily: 'Poppins-Regular',
                    textDecorationLine: 'underline',
                    color: '#1E293B',
                  }}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>
            {filteredCameras && filteredCameras.length === 0 ? (
              <Text
                style={{
                  color: 'gray',
                  alignSelf: 'center',
                  fontFamily: 'Poppins-Medium',
                  fontSize: 13,
                  marginTop: 6,
                }}>
                No Cameras to Show
              </Text>
            ) : filteredCameras && filteredCameras.length === 1 ? (
              renderSingleCamera(filteredCameras[0])
            ) : (
              <Carousel
                data={filteredCameras}
                renderItem={renderCameraItem}
                sliderWidth={screenWidth}
                itemWidth={300}
                loop={true}
                autoplay={true}
              />
            )}
          </View>
        )}
        <CameraNotifications />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 10,
    right: 11,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E7E7E7',
  },

  picker: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    fontFamily: 'Poppins-Regular',
    backgroundColor: '#E7E7E7',
    color: 'black',
    marginBottom: 10,
  },

  animation: {
    width: 300,
    height: 300,
  },
  scrollViewContent: {
    flexGrow: 1,
    backgroundColor: 'white',
  },
  camerasSection: {
    marginTop: 20,
    paddingHorizontal: 20,
    width: '100%',
  },
  cameraContainer: {
    width: '99%',
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cameraImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  cameraName: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
  },
  cameraStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: '#cefad0',
    borderRadius: 14,
  },
  cameraStatusContainerOffline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: '#FFEE8C',
    borderRadius: 14,
  },
  cameraStatus: {
    color: '#008631',
    marginHorizontal: 3,
  },
  cameraStatusOffline: {
    color: '#FFAA1D',
    marginHorizontal: 3,
  },
  videoPlayer: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    marginTop: 3,
  },
  wifiIcon: {
    width: 14,
    height: 14,
    marginRight: 5,
  },
  connectionText: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
  },
});

export default Cameras;
