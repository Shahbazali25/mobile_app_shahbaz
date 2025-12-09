import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  FlatList,
  Modal,
  ScrollView,
  Switch,
  Dimensions,
  TouchableWithoutFeedback, Keyboard 
} from 'react-native';
import {screenWidth} from '../../components/utils/constants';
import {changeScreen} from '../../components/navigation/changeScreen';
import Video from 'react-native-video';

import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import AnimatedLottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import {VLCPlayer} from 'react-native-vlc-media-player';

import WebrtcWebView from '../../components/WebrtcWebView';

import NavBar from '../../layouts/navigations/navbar';
import {getAllCameras} from '../../components/apis/cameras/getAllCameras';
import {deleteCamera} from '../../components/apis/cameras/deleteCamera';
import {startStream} from '../../components/apis/cameras/stream/startStream';
import {stopStream} from '../../components/apis/cameras/stream/stopStream';
import shortenName from '../../components/utils/shortenName';
import errorMessage from '../../components/utils/errorMessage';
import successMessage from '../../components/utils/successMessage';

function CameraScreen() {
  const [useWebRTC, setUseWebRTC] = useState(true);

  const animation = useRef(null);
  const navigation = useNavigation();
  const [isLoading, setLoading] = useState(true);
  const [cameras, setCameras] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [streamModalVisible, setStreamModalVisible] = useState(false);
  const [cameraToDelete, setCameraToDelete] = useState(null);
  const [streamToStop, setStreamToStop] = useState(null);
  const [menuVisible, setMenuVisible] = useState(null);
  const [screen, setScreen] = useState('grid');
  const [userRole, setUserRole] = useState(null);
  const [selectedGrid, setSelectedGrid] = useState(1);
  const [cameraSelectionModalVisible, setCameraSelectionModalVisible] =
    useState(false);
  const [selectedCamerasForGrid, setSelectedCamerasForGrid] = useState([]);
  const [availableCamerasForSelection, setAvailableCamerasForSelection] =
    useState([]);

  const STORAGE_KEYS = {
    GRID_LAYOUT: '@camera_grid_layout',
    SELECTED_CAMERAS: '@camera_selected_cameras',
  };

  const GRID_LAYOUTS = [
    {
      id: 1,
      label: '1 Camera',
      icon: require('../../assets/imgs/icons/one-grid.png'),
    },
    {
      id: 2,
      label: '2 Cameras',
      icon: require('../../assets/imgs/icons/two-grid.png'),
    },
    {
      id: 3,
      label: '3 Cameras',
      icon: require('../../assets/imgs/icons/three-grids.png'),
    },
    {
      id: 4,
      label: '4 Cameras',
      icon: require('../../assets/imgs/icons/four-grid.png'),
    },
    {
      id: 6,
      label: '6 Cameras',
      icon: require('../../assets/imgs/icons/six-grid.png'),
    },
    {
      id: 8,
      label: '8 Cameras',
      icon: require('../../assets/imgs/icons/eight-grid.png'),
    },
    {
      id: 9,
      label: '9 Cameras',
      icon: require('../../assets/imgs/icons/nine-grid.png'),
    },
    {
      id: 12,
      label: '12 Cameras',
      icon: require('../../assets/imgs/icons/twelve-grid.png'),
    },
  ];

  useEffect(() => {
    animation.current?.play();
    const initializeScreen = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setUserRole(userData.role);
        }

        const fetchedCameras = await getAllCameras();
        console.log("\n\n\n\n\n  totallllll ",fetchedCameras);
        setCameras(fetchedCameras);
        const storedSelectedCameras = await loadLayoutFromStorage();
        const validatedSelectedCameras = storedSelectedCameras.filter(
          storedCamera =>
            fetchedCameras.some(
              fetchedCamera => fetchedCamera.id === storedCamera.id,
            ),
        );

        if (
          validatedSelectedCameras.length === 0 &&
          fetchedCameras.length > 0
        ) {
          validatedSelectedCameras.push(fetchedCameras[0]);
        }

        setSelectedCamerasForGrid(validatedSelectedCameras);
      } catch (error) {
        console.error('Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeScreen();
  }, []);

  const saveLayoutToStorage = async (gridSize, selectedCameras) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.GRID_LAYOUT,
        JSON.stringify(gridSize),
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.SELECTED_CAMERAS,
        JSON.stringify(selectedCameras),
      );
    } catch (error) {
      console.error('Error saving layout to storage:', error);
    }
  };

  const loadLayoutFromStorage = async () => {
    try {
      const storedGridSize = await AsyncStorage.getItem(
        STORAGE_KEYS.GRID_LAYOUT,
      );
      const storedSelectedCameras = await AsyncStorage.getItem(
        STORAGE_KEYS.SELECTED_CAMERAS,
      );

      if (storedGridSize) {
        const parsedGridSize = JSON.parse(storedGridSize);
        setSelectedGrid(parsedGridSize);
      }

      return storedSelectedCameras ? JSON.parse(storedSelectedCameras) : [];
    } catch (error) {
      console.error('Error loading layout from storage:', error);
      return [];
    }
  };

  const removeCameraFromStorage = async cameraId => {
    try {
      const storedSelectedCameras = await AsyncStorage.getItem(
        STORAGE_KEYS.SELECTED_CAMERAS,
      );
      if (storedSelectedCameras) {
        let parsedCameras = JSON.parse(storedSelectedCameras);
        parsedCameras = parsedCameras.filter(camera => camera.id !== cameraId);

        await AsyncStorage.setItem(
          STORAGE_KEYS.SELECTED_CAMERAS,
          JSON.stringify(parsedCameras),
        );
      }
    } catch (error) {
      console.error('Error removing camera from storage:', error);
    }
  };

  const fetchCameras = async () => {
    try {
      const fetchedCameras = await getAllCameras();
      console.log('Fetched Cameras', fetchedCameras);
      setCameras(fetchedCameras);
    } catch (error) {
      console.error('Error fetching cameras:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGridSelection = async gridSize => {
    setSelectedGrid(gridSize);

    if (selectedCamerasForGrid.length > gridSize) {
      const reducedSelection = selectedCamerasForGrid.slice(0, gridSize);
      setSelectedCamerasForGrid(reducedSelection);
      await saveLayoutToStorage(gridSize, reducedSelection);
    }

    if (
      gridSize === 1 &&
      (!selectedCamerasForGrid || selectedCamerasForGrid.length === 0) &&
      cameras &&
      cameras.length > 0
    ) {
      setSelectedCamerasForGrid([cameras[0]]);
      await saveLayoutToStorage(gridSize, [cameras[0]]);
    } else {
      setAvailableCamerasForSelection(cameras);
      setCameraSelectionModalVisible(true);
    }
  };

  const toggleCameraSelection = async camera => {
    const isSelected = selectedCamerasForGrid.some(c => c.id === camera.id);

    if (selectedGrid === 1) {
      setSelectedCamerasForGrid([]); 
      await new Promise(resolve => setTimeout(resolve, 0));
      setSelectedCamerasForGrid([camera]);
      return;
    }
    console.log('im here broo \n\n\n');
    if (isSelected) {
      const newSelection = selectedCamerasForGrid.filter(
        c => c.id !== camera.id,
      );
      setSelectedCamerasForGrid(newSelection);
    } else if (selectedCamerasForGrid.length < selectedGrid) {
      const newSelection = [...selectedCamerasForGrid, camera];
      setSelectedCamerasForGrid(newSelection);
    }
  };

  const submitCameraSelection = async () => {
    await saveLayoutToStorage(selectedGrid, selectedCamerasForGrid);
    setCameraSelectionModalVisible(false);
  };

  const renderGridLayout = () => {
    console.log('Grid layout working');
    if (selectedGrid === 1) {
      return renderSingleCameraView();
    } else if (selectedGrid === 2) {
      return renderTwoCameraView();
    } else if (selectedGrid === 3) {
      return renderThreeCameraView();
    } else if (selectedGrid === 4) {
      return renderFourCameraView();
    } else if (selectedGrid === 6) {
      return renderSixCameraView();
    } else if (selectedGrid === 8) {
      return renderEightCameraView();
    } else if (selectedGrid === 9) {
      return renderNineCameraView();
    } else if (selectedGrid === 12) {
      return renderTwelveCameraView();
    }
  };

  const renderSingleCameraView = () => {
    console.log('***Show one cameras');
    console.log(
      '***Selected Cameras Grid Length:',
      selectedCamerasForGrid.length,
    );
    console.log('***Selected Cameras Grid:', selectedCamerasForGrid);

    if (selectedCamerasForGrid && selectedCamerasForGrid.length > 0) {
      const selectedCamera = selectedCamerasForGrid[0];
      console.log('Selected Camera:', selectedCamera);

      if (selectedCamera && selectedCamera.cloudHls) {
        console.log('Has HLS Stream *** ', selectedCamera.cloudHls);
        return (
          <TouchableOpacity
            style={{width: '100%', height: 285}}
            onPress={() =>
              navigation.navigate('ViewCamera', {
                camera_id: selectedCamera.network_id,
                stream_link: selectedCamera.cloudHls,
                local_stream_link: selectedCamera.localHls,
              })
            }>
            {renderCameraVideo(selectedCamera, '100%', 285)}


          </TouchableOpacity>
        );
      }
    }

   

    return (
     
      <View style={styles.cameraContainer1}>
       <View
          style={[
            styles.cameraContainerTop0,
            {height: 190, justifyContent: 'center', alignItems: 'center'},
          ]}>
        {/* 
          <Text
            style={{
              fontFamily: 'Poppins-Medium',
              alignSelf: 'center',
            }}>
            Camera not availableee
          </Text>
        */}

         <Image
            source={require('../../assets/imgs/stream-na.png')}
            style={styles.cameraImage2}
            resizeMode="cover"
          />
         </View>

      </View>
    );
  };
  const renderTwoCameraView = () => {
    return (
      <View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          {renderCameraVideo(selectedCamerasForGrid[0], '100%', 215)}
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          {renderCameraVideo(selectedCamerasForGrid[1], '100%', 215)}
        </View>
      </View>
    );
  };

  const renderThreeCameraView = () => {
    return (
      <View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          {renderCameraVideo(selectedCamerasForGrid[0], '100%', 275)}
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          {renderCameraVideo(selectedCamerasForGrid[1], '50%')}
          {renderCameraVideo(selectedCamerasForGrid[2], '50%')}
        </View>
      </View>
    );
  };

  const renderFourCameraView = () => {
    return (
      <View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          {selectedCamerasForGrid
            .slice(0, 2)
            .map(camera => renderCameraVideo(camera, '50%'))}
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          {selectedCamerasForGrid
            .slice(2, 4)
            .map(camera => renderCameraVideo(camera, '50%'))}
        </View>
      </View>
    );
  };
  const renderSixCameraView = () => {
    return (
      <View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          {selectedCamerasForGrid
            .slice(0, 2)
            .map(camera => renderCameraVideo(camera, '50%'))}
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          {selectedCamerasForGrid
            .slice(2, 4)
            .map(camera => renderCameraVideo(camera, '50%'))}
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          {selectedCamerasForGrid
            .slice(4, 6)
            .map(camera => renderCameraVideo(camera, '50%'))}
        </View>
      </View>
    );
  };

  const renderEightCameraView = () => {
    return (
      <View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          {selectedCamerasForGrid
            .slice(0, 2)
            .map(camera => renderCameraVideo(camera, '50%'))}
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          {selectedCamerasForGrid
            .slice(2, 4)
            .map(camera => renderCameraVideo(camera, '50%'))}
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          {selectedCamerasForGrid
            .slice(4, 6)
            .map(camera => renderCameraVideo(camera, '50%'))}
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          {selectedCamerasForGrid
            .slice(6, 8)
            .map(camera => renderCameraVideo(camera, '50%'))}
        </View>
      </View>
    );
  };

  const renderNineCameraView = () => {
    return (
      <View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          {selectedCamerasForGrid
            .slice(0, 2)
            .map(camera => renderCameraVideo(camera, '50%'))}
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          {selectedCamerasForGrid
            .slice(2, 4)
            .map(camera => renderCameraVideo(camera, '50%'))}
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          {selectedCamerasForGrid
            .slice(4, 6)
            .map(camera => renderCameraVideo(camera, '50%'))}
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          {selectedCamerasForGrid
            .slice(6, 8)
            .map(camera => renderCameraVideo(camera, '50%'))}
        </View>
        <View style={{flexDirection: 'row', justifyContent: 'center'}}>
          {selectedCamerasForGrid
            .slice(8, 9)
            .map(camera => renderCameraVideo(camera, '100%', 222))}
        </View>
      </View>
    );
  };
  const renderTwelveCameraView = () => {
    return (
      <View>
        <View style={{flexDirection: 'row'}}>
          {selectedCamerasForGrid
            .slice(0, 2)
            .map(camera => renderCameraVideo(camera, '50%'))}
        </View>
        <View style={{flexDirection: 'row'}}>
          {selectedCamerasForGrid
            .slice(2, 4)
            .map(camera => renderCameraVideo(camera, '50%'))}
        </View>
        <View style={{flexDirection: 'row'}}>
          {selectedCamerasForGrid
            .slice(4, 6)
            .map(camera => renderCameraVideo(camera, '50%'))}
        </View>
        <View style={{flexDirection: 'row'}}>
          {selectedCamerasForGrid
            .slice(6, 8)
            .map(camera => renderCameraVideo(camera, '50%'))}
        </View>
        <View style={{flexDirection: 'row'}}>
          {selectedCamerasForGrid
            .slice(8, 10)
            .map(camera => renderCameraVideo(camera, '50%'))}
        </View>
        <View style={{flexDirection: 'row'}}>
          {selectedCamerasForGrid
            .slice(10, 12)
            .map(camera => renderCameraVideo(camera, '50%'))}
        </View>
      </View>
    );
  };

  const renderCameraVideo = (camera, width, height = 115) => {
    console.log('\n\n\nCamera info for renderCameraVideo:', camera?.cloudHls);
    if (!camera || camera.cloudHls == null)
      return (
        <View
          style={{
            width,
            height,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}>
            <Image
            source={require('../../assets/imgs/stream-na.png')}
            style={styles.cameraImage2}
            resizeMode="cover"
          />
        </View>
      );

    let rtcUrl = camera?.cloudHls
      .replace('port/8888', 'rtc')
      .replace('/index.m3u8', '/');
    console.log('RTC URL:', rtcUrl);
    // Use WebrtcWebView component (renders the iframe HTML internally)
    return (
      <TouchableOpacity
        style={[styles.gridCameraView, {width: width}]}
        key={camera.id}
        onPress={() =>
          navigation.navigate('ViewCamera', {
            camera_id: camera.network_id,
            stream_link: camera.cloudHls,
            local_stream_link: camera.localHls,
          })
        }>
        {camera.cloudHls ? (
          <View style={{height: height, width: '100%', position: 'relative'}}>
            {useWebRTC ? (
              <>
                <WebrtcWebView
                  rtcUrl={rtcUrl}
                  height={height}
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
                
              </>
            ) : (
              <>
                <VLCPlayer
                  source={{uri: camera.cloudHls}}
                  style={[styles.videoPlayer, {height: height}]}
                  autoPlay={true}
                  muted={true}
                  mediaOptions={{
                    ':network-caching': 0,
                    ':live-caching': 0,
                    ':file-caching': 0,
                    ':clock-jitter': 0,
                    ':clock-synchro': 0,
                  }}
                />
                <View style={styles.streamLabel}>
                  <Text style={styles.streamLabelText}>HLS</Text>
                </View>
              </>
            )}
          </View>
        ) : (
          <Image
            source={require('../../assets/imgs/stream-na.png')}
            style={styles.cameraImage}
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>
    );
  };

 

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setCameraToDelete(null);
  };

  const confirmDelete = async () => {
    try {
      await deleteCamera(cameraToDelete.network_id);
      await removeCameraFromStorage(cameraToDelete.id);

      const updatedCameras = await getAllCameras();
      setCameras(updatedCameras);

      const updatedSelectedCameras = selectedCamerasForGrid.filter(
        camera => camera.id !== cameraToDelete.id,
      );
      const finalSelectedCameras =
        updatedSelectedCameras.length > 0
          ? updatedSelectedCameras
          : updatedCameras.length > 0
          ? [updatedCameras[0]]
          : [];

      setSelectedCamerasForGrid(finalSelectedCameras);
      await saveLayoutToStorage(selectedGrid, finalSelectedCameras);
    } catch (error) {
      console.error('Error deleting camera:', error);
      errorMessage(
        'Error while Deleting',
        `Camera ${cameraToDelete.network_id} not Deleted`,
      );
    } finally {
      setDeleteModalVisible(false);
      setCameraToDelete(null);
    }
  };

  const cancelStream = () => {
    setStreamModalVisible(false);
    setStreamToStop(null);
  };

  const streamingStop = async () => {
    try {
      const streamingResponse = await stopStream(streamToStop.network_id);
      if (!streamingResponse.status === 200) {
        errorMessage('Error', `Error while stoping stream`);
      } else {
        successMessage(
          'Stream Stoped',
          `Stream of Camera ${streamToStop.network_id} stopped`,
        );
      }
    } catch (error) {
      console.error('Error while Stop streaming:', error);
      errorMessage('Error', String(error));
    } finally {
      fetchCameras();
      setStreamModalVisible(false);
      setMenuVisible(null);
    }
  };

  const renderCameraItem = ({item}) => {
    const hasHls = item.cloudHls;
    const isMenuOpen = menuVisible === item.id;
    
    
    
    const handleMenuToggle = () => {
      setMenuVisible(isMenuOpen ? null : item.id);
    };
    const handleOutsidePress = () => {
      console.log(" im called, close menu");
        setMenuVisible(null);
     
    };
        // let rtcUrl = hasHls;
         let rtcUrl = hasHls?.replace('port/8888', 'rtc')
      .replace('/index.m3u8', '/');
      // console.log('\n\n\n\n  *****  %%%  ***** \n\n item:', item);
      console.log('\n\n\n rtcUrl >>>>>>>>>>>>>>>>>:', rtcUrl, '\n\n');

    const handleDelete = () => {
      setCameraToDelete(item);
      setDeleteModalVisible(true);
      setMenuVisible(null);
    };

    const stoppingStream = () => {
      setStreamToStop(item);
      setStreamModalVisible(true);
      setMenuVisible(null);
    };

    const handleEdit = () => {
      console.log('Edit:', item.network_id);
      navigation.navigate('UpdateCamera', {camera_id: item.network_id});
      setMenuVisible(null);
    };

    const truncatedName = shortenName(20, item.name, 'Unnamed Camera');

    const handleView = () => {
      setMenuVisible(null);
      navigation.navigate('ViewCamera', {
        camera_id: item.network_id,
        camera_name: item.name,
        stream_link: item.cloudHls,
        local_stream_link: item.localHls,
      });
    };

    const streamingStart = async () => {
      try {
        const streamingResponse = await startStream(item.network_id);
        if (!streamingResponse.status === 200) {
          errorMessage('Error', 'Error while starting stream');
        } else {
          successMessage('Stream Initiated', `Wait for 4-5 secs for streaming`);
        }
      } catch (error) {
        console.error('Error Start streaming:', error);
        errorMessage('Error', String(error));
      } finally {
        fetchCameras();
        setMenuVisible(null);
      }
    };

    return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>

      <View style={styles.cameraContainer}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 3,
            paddingVertical: 10,
          }}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
            }}>
            <Text style={styles.cameraName}>{truncatedName}</Text>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <Image
                source={
                  item.localHls
                    ? require('../../assets/imgs/icons/lan-network-on.png')
                    : require('../../assets/imgs/icons/lan-network.png')
                }
                style={{width: 16, height: 16, marginHorizontal: 6}}
              />
              <Image
                source={
                  item.cloudHls
                    ? require('../../assets/imgs/icons/wifi.png')
                    : require('../../assets/imgs/icons/wifi-off.png')
                }
                style={{width: 16, height: 16, marginHorizontal: 6}}
              />
            </View>
          </View>
          <TouchableOpacity onPress={handleMenuToggle}>
            <Image
              source={require('../../assets/imgs/icons/options-dots.png')}
              style={styles.optionsDots}
            />
          </TouchableOpacity>
          {isMenuOpen && (
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>

            <View style={styles.menuContainer}>
               { !item.cloudHls &&   (
                 <TouchableOpacity
                   style={[
                     styles.menuItem,
                     {opacity: userRole === 0 || userRole === 4 ? 1 : 0.4},
                   ]}
                   onPress={streamingStart}
                   disabled={userRole === 0 || userRole === 4 ? false : true}>
                   <Image
                     source={require('../../assets/imgs/icons/signal-stream.png')}
                     style={styles.optionsIcons}
                   />
                   <Text style={{fontFamily: 'Poppins-Regular', fontSize: 11}}>
                     Start Stream
                   </Text>
                 </TouchableOpacity>
               )}

              { item.cloudHls &&   (
                
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {opacity: userRole === 0 || userRole === 4 ? 1 : 0.4},
                ]}
                onPress={stoppingStream}
                disabled={userRole === 0 || userRole === 4 ? false : true}>
                <Image
                  source={require('../../assets/imgs/icons/signal-stream-slash.png')}
                  style={styles.optionsIcons}
                />
                <Text style={{fontFamily: 'Poppins-Regular', fontSize: 11}}>
                  Stop Stream
                </Text>
              </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.menuItem} onPress={handleView}>
                <Image
                  source={require('../../assets/imgs/icons/optionCamera.png')}
                  style={styles.optionsIcons}
                />
                <Text style={{fontFamily: 'Poppins-Regular', fontSize: 11}}>
                  View
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {opacity: userRole === 0 || userRole === 4 ? 1 : 0.4},
                ]}
                onPress={() => handleEdit(item)}
                disabled={userRole === 0 || userRole === 4 ? false : true}>
                <Image
                  source={require('../../assets/imgs/icons/pencil.png')}
                  style={styles.optionsIcons}
                />
                <Text style={{fontFamily: 'Poppins-Regular', fontSize: 11}}>
                  Edit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.menuItem,
                  {
                    opacity: userRole === 0 || userRole === 4 ? 1 : 0.4,
                    borderBottomWidth: 0,
                  },
                ]}
                onPress={handleDelete}
                disabled={userRole === 0 || userRole === 4 ? false : true}>
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
            </TouchableWithoutFeedback>
          )}
        </View>
        {hasHls ? (
          <View>
           
             <WebrtcWebView
                  rtcUrl={rtcUrl}
                  height={186}
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
{/* <Video
      source={{ uri: rtcUrl }}     // rtcUrl must be an HLS (.m3u8) URL
      style={{ width: '100%', height: 186 }}
      resizeMode="cover"
      controls={true}
      onError={(err) => {
        console.log("Video Error:", err);
      }}
      onLoad={() => {
        console.log("Video Loaded");
      }}
      onBuffer={(e) => {
        console.log("Buffering: ", e);
      }}
    /> */}

          </View>
        ) : (
          <Image
            source={require('../../assets/imgs/stream-na.png')}
            style={styles.cameraImage}
            resizeMode="cover"
          />
        )}
      </View>
    </TouchableWithoutFeedback>

    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content" 
          backgroundColor="#fff"
          translucent={false}
          hidden={false} 
        />
        <AnimatedLottieView
          ref={animation}
          source={require('../../assets/animations/camera-animation.json')}
          style={styles.animation}
          autoPlay={false}
          loop
        />
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - 60) / 2; 
  const renderItem = ({item}) => (
    <TouchableOpacity
      onPress={() => handleGridSelection(item.id)}
      style={{
        width: itemWidth,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        margin: 4,
        marginHorizontal: 5,
        paddingVertical: 12,
        paddingHorizontal: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Image
        source={item.icon}
        style={{width: 27, height: 27, marginRight: 8}}
      />
      <Text
        style={{
          fontFamily: 'Poppins-Regular',
          marginLeft: item.label === '1 Camera' ? 8 : 0,
        }}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.homeSafeArea}>
        <StatusBar translucent={true} backgroundColor="black" />
        <View
          style={[
            styles.homeScreenContainer,
            {paddingBottom: screen === 'grid' ? 0 : 80},
          ]}>
          <NavBar
            Content="All Cameras"
            BackAction="Home"
            showThirdBtn={userRole === 0 ? true : false}
            ThirdBtnNavigation={'AddCamera'}
          />
         
            <ScrollView 
            style={{flexGrow: 1, display: screen === 'grid' ? 'flex' : 'none' }}>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  paddingBottom: 80,
                }}>
                {renderGridLayout()}

                <View
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    paddingHorizontal: 15,
                    marginBottom: 20,
                  }}>
                  <Text
                    style={{
                      fontFamily: 'Poppins-Medium',
                      fontSize: 15,
                      marginBottom: 0,
                      marginTop: 12,
                    }}>
                    Layouts
                  </Text>

                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: 'gray',
                      borderRadius: 10,
                      marginVertical: 5,
                      paddingVertical: 5,
                    }}>
                    <FlatList
                      data={GRID_LAYOUTS}
                      scrollEnabled={false}
                      renderItem={renderItem}
                      keyExtractor={item => item.id.toString()}
                      numColumns={2} 
                      contentContainerStyle={{
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      showsVerticalScrollIndicator={false}
                    />
                  </View>

                 
                </View>
              </View>
            </ScrollView>
         
            <FlatList
              data={cameras}
              renderItem={renderCameraItem}
              keyExtractor={item => item.id.toString()}
              numColumns={1}
              style={[
    styles.scrollViewContent,
    {display: screen === 'list' ? 'flex' : 'none'}
  ]}
              showsVerticalScrollIndicator={false}
            />
          
        </View>
        
        {/* this TouchableOpacity change the screen as 'grid' or 'list' */}
        <View style={styles.fixedButtonLayoutContainer}>
              <TouchableOpacity
                style={styles.fixedButton}
                onPress={() => changeScreen(screen, setScreen)}>
                <Image
                  source={
                    screen === 'grid'
                      ? require('../../assets/imgs/icons/dropdown-bar.png')
                      : require('../../assets/imgs/icons/objects-column.png')
                  }
                  style={styles.fixedButtonImage}
                />
              </TouchableOpacity>
            </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={cameraSelectionModalVisible}
          onRequestClose={() => setCameraSelectionModalVisible(false)}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                Select {selectedGrid} Cameras
              </Text>
              {/* list to select the cameras from available cameras list <= grid selected */}
              <ScrollView style={{width: '100%', flexGrow: 1, maxHeight: 200}}>
                {availableCamerasForSelection &&
                  availableCamerasForSelection.map(camera => (
                    <TouchableOpacity
                      key={camera.id}
                      style={[
                        styles.cameraSelectItem,
                        selectedCamerasForGrid.some(c => c.id === camera.id) &&
                          styles.selectedCameraItem,
                        selectedCamerasForGrid.length >= selectedGrid &&
                          selectedGrid !== 1 &&
                          !selectedCamerasForGrid.some(
                            c => c.id === camera.id,
                          ) &&
                          styles.disabledCameraItem,
                      ]}
                      onPress={() => toggleCameraSelection(camera)}>
                      <Text
                        style={[
                          styles.cameraSelectItemText,
                          selectedCamerasForGrid.some(
                            c => c.id === camera.id,
                          ) && styles.selectedCameraItemText,
                        ]}>
                        {camera.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={submitCameraSelection}>
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="slide"
          transparent={true}
          visible={deleteModalVisible}
          onRequestClose={() => setDeleteModalVisible(false)}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                Do you really want to delete the camera?
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
        <Modal
          animationType="slide"
          transparent={true}
          visible={streamModalVisible}
          onRequestClose={() => setStreamModalVisible(false)}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>
                Do you really want to stop the stream?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={streamingStop}>
                  <Text style={styles.deleteButtonText}>Stop</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={cancelStream}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  gridCameraView: {
    width: '50%',
  },



 fixedButtonLayoutContainer: {
    position: 'absolute',
    bottom: screenWidth < 800 ? 90 : 100,
    right: 22,
  },
    fixedButtonImage: {
    width: 21,
    height: 21,
  },
   fixedButton: {
      backgroundColor: '#1B3C55',
      paddingVertical: screenWidth < 800 ? 10 : 15,
      paddingHorizontal: screenWidth < 800 ? 3 : 7,
      borderRadius: 12,
      alignItems: 'right',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: screenWidth < 800 ? 75 : 100,
    },




  gridCameraView: {
    margin: 2,
    backgroundColor: '#000',
    borderRadius: 4,
    overflow: 'hidden',
  },
  videoPlayer: {
    width: '100%',
  },
  cameraImage: {
    width: '100%',
    height: '100%',
  },
  cameraImage2: {
    width: '90%',
    height: '120%',
  },
  streamLabel: {
    position: 'absolute',
    textAlign: 'center',
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  streamLabelText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: '#f5f5f5',
    marginVertical: 5,
    borderRadius: 8,
  },
  toggleLabel: {
    marginHorizontal: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#333',
  },

  cameraContainer1: {
    marginTop: 5,
    marginBottom: 10,
    height: 215,
    marginHorizontal: 15,
  },

  videoPlayer2: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },

  cameraContainerTopVideo: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: '70%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#010b13ff',
    borderRadius: 10,
  },
  cameraContainerTop0: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: '100%',
    marginBottom: 20,
    // borderWidth: 1,
    // borderColor: '#010b13ff',
    // borderRadius: 10,
  },
  cameraContainerTop: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: '50%',
    marginBottom: 10,
  },
  cameraContainerBottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: '50%',
  },
  cameraContainerTop1: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: '33.33%',
    marginBottom: 10,
  },
  cameraContainerBottom1: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: '33.33%',
    marginTop: 10,
  },
  cameraContainerMiddle: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: '33.33%',
  },

  cameraContainerTop2: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: '50%',
    marginBottom: 10,
  },
  cameraContainerBottom2: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: '50%',
    marginTop: 10,
  },

  cameraContainerMiddle3: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: '33.33%',
  },
  cameraContainerTop3: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: '33.33%',
    marginBottom: 10,
  },
  cameraContainerBottom3: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: '33.33%',
    marginTop: 10,
  },
  cameraContainerMiddle4: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: '33.33%',
  },
  cameraContainerTop4: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: '33.33%',
    marginBottom: 10,
  },
  cameraContainerBottom4: {
    flexDirection: 'row',
    justifyContent: 'center',
    height: '33.33%',
    marginTop: 10,
  },

  cameraSelectItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#adb6cfff',
    width: '100%',
    borderRadius: 20,
    marginBottom: 4,
  },
  disabledCameraItem: {
    opacity: 0.5,
    fontFamily: 'Poppins-Regular',
  },
  cameraSelectItemText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  selectedCameraItem: {
    backgroundColor: '#485977ff',
  },

  selectedCameraItemText: {
    color: '#ffffffff',
  },
  submitButton: {
    backgroundColor: '#1B3C55',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    width: '100%',
  },
  submitButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 300,
    height: 300,
  },
  homeSafeArea: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  homeScreenContainer: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  scrollViewContent: {
    flexGrow: 1,
    alignSelf: 'center',
  },
  cameraContainer: {
    width: 330,
    backgroundColor: 'white',
    borderRadius: 10,
    marginVertical: 12,
    display: 'flex',
    flexDirection: 'column',
  },
  cameraImage: {
    width: '100%',
    height: 200,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsDots: {
    width: 20,
    height: 20,
  },
  optionsIcons: {
    width: 14,
    height: 14,
    marginHorizontal: 3,
  },
  menuContainer: {
    position: 'absolute',
    top: 16,
    right: 30,
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
  cameraName: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
  },
  cameraStatus: {
    color: '#008631',
    marginHorizontal: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#cefad0',
    borderRadius: 14,
    fontFamily: 'Poppins-Medium',
    fontSize: 10,
  },
  videoPlayer: {
    width: '100%',
    height: 200,
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
    fontSize: 19,
    fontWeight: 'bold',
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

export default CameraScreen;
