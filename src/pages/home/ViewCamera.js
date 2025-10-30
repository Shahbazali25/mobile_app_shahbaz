import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import WebrtcWebView from '../../components/WebrtcWebView';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import AnimatedLottieView from 'lottie-react-native';
import {VLCPlayer} from 'react-native-vlc-media-player';
import {PERMISSIONS, RESULTS, request, check} from 'react-native-permissions';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import Toast from 'react-native-toast-message';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import NavBar from '../../layouts/navigations/navbar';
import {getLastFrame} from '../../components/apis/cameras/motionDetection/getLastFrame';
import {getCameraById} from '../../components/apis/cameras/getCameraById';
import {startStream} from '../../components/apis/cameras/stream/startStream';
import {stopStream} from '../../components/apis/cameras/stream/stopStream';
import {deleteCamera} from '../../components/apis/cameras/deleteCamera';
import {checkUserRole} from '../../components/utils/checkRole';
import errorMessage from '../../components/utils/errorMessage';
import successMessage from '../../components/utils/successMessage';

function ViewCamera() {
  const navigation = useNavigation();
  const route = useRoute();
  const camera_id = route.params?.camera_id;
  const [stream_link, setStreamLink] = useState(route.params?.stream_link);
  const [local_stream_link, setLocalStreamLink] = useState(
    route.params?.local_stream_link,
  );
  const animation = useRef(null);
  const [camera, setCamera] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recording, setRecording] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [frameImage, setFrameImage] = useState(null);
  const [streamModalVisible, setStreamModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  let rtcUrl = stream_link
    ?.replace('port/8888', 'rtc')
    .replace('/index.m3u8', '/');
  console.log('RTC URL:', rtcUrl);

  const STORAGE_KEYS = {
    GRID_LAYOUT: '@camera_grid_layout',
    SELECTED_CAMERAS: '@camera_selected_cameras',
  };

  const checkPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const permission = PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY;
        const result = await check(permission);

        if (result !== RESULTS.GRANTED) {
          return (await request(permission)) === RESULTS.GRANTED;
        }
        return true;
      } else {
        if (Platform.Version >= 33) {
          const permission = PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
          const result = await check(permission);
          console.log('Permission check for Android 33+:', result);
          if (result !== RESULTS.GRANTED) {
            return (await request(permission)) === RESULTS.GRANTED;
          }
          return true;
        } else if (Platform.Version >= 29) {
          const permission = PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;
          const result = await check(permission);
          console.log('Permission check for Android 10+:', result);

          if (result !== RESULTS.GRANTED) {
            return (await request(permission)) === RESULTS.GRANTED;
          }
          return true;
        } else {
          const permission = PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE;
          const result = await check(permission);
          console.log('Permission check for Android less:', result);
          if (result !== RESULTS.GRANTED) {
            return (await request(permission)) === RESULTS.GRANTED;
          }
          return true;
        }
      }
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
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

  const saveImageToDevice = async imageUri => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 29) {
        let finalUri = imageUri;
        if (imageUri.startsWith('http')) {
          const fileName = `snapshot_${new Date().getTime()}.jpg`;
          const filePath = `${RNFS.CachesDirectoryPath}/${fileName}`;
          const downloadResult = await RNFS.downloadFile({
            fromUrl: imageUri,
            toFile: filePath,
          }).promise;

          if (downloadResult.statusCode === 200) {
            finalUri = `file://${filePath}`;
          }
        }

        try {
          await Share.open({
            url: finalUri,
            type: 'image/jpeg',
            title: 'Save Image',
            subject: 'Camera Snapshot',
            saveToFiles: true,
            failOnCancel: false,
            excludedActivityTypes: [
              'com.android.bluetooth.opp.BluetoothOppReceiver',
              'com.facebook.katana.activity.composer.ImplicitShareIntentHandler',
              'com.google.android.apps.docs.add-ons.drive.viewer.activities.ViewActivityClient',
            ],
          });
          return true;
        } catch (shareError) {
          if (
            shareError.message &&
            (shareError.message.includes('User did not share') ||
              shareError.message.includes('User cancelled') ||
              shareError.message.includes('User canceled'))
          ) {
            console.log('User canceled sharing');
            return false;
          }
          throw shareError;
        }
      } else {
        const dirPath =
          Platform.OS === 'ios'
            ? `${RNFS.DocumentDirectoryPath}/CameraSnapshots`
            : `${RNFS.PicturesDirectoryPath}/CameraSnapshots`;

        const dirExists = await RNFS.exists(dirPath);
        if (!dirExists) {
          await RNFS.mkdir(dirPath);
        }

        const fileName = `snapshot_${new Date().getTime()}.jpg`;
        const filePath = `${dirPath}/${fileName}`;

        if (imageUri.startsWith('http')) {
          await RNFS.downloadFile({
            fromUrl: imageUri,
            toFile: filePath,
          }).promise;
        } else {
          await RNFS.copyFile(imageUri, filePath);
        }

        if (Platform.OS === 'ios') {
          await CameraRoll.save(`file://${filePath}`, {type: 'photo'});
          return true;
        } else {
          try {
            await Share.open({
              url: `file://${filePath}`,
              type: 'image/jpeg',
              saveToFiles: true,
              failOnCancel: false,
            });
            return true;
          } catch (shareError) {
            console.log('Share error or cancellation:', shareError.message);
            return false;
          }
        }
      }
    } catch (error) {
      console.error('Error saving image:', error);
      throw error;
    }
  };

  const handleSnapshot = async () => {
    try {
      setIsLoading(true);
      const hasPermission = await checkPermission();

      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'This app needs permission to save photos to your device.',
          [{text: 'OK'}],
        );
        setIsLoading(false);
        return;
      }

      const latestFrame = await getLastFrame(camera_id);
      setFrameImage({uri: latestFrame});
      const saved = await saveImageToDevice(latestFrame);

      setIsLoading(false);

      if (saved) {
        // Toast.show({
        //   type: 'success',
        //   text1: 'Snapshot Saved',
        //   text2: 'The image has been saved to your device',
        // });
      } else {
        console.log('User canceled sharing process');
      }
    } catch (error) {
      setIsLoading(false);
      Toast.show({
        type: 'error',
        text1: 'Snapshot Failed',
        text2: String(error),
      });
    }
  };

  const fetchCamera = async () => {
    try {
      const role = await checkUserRole();
      setUserRole(role);
      const fetchedCamera = await getCameraById(camera_id);
      console.log('fetchedCamera', fetchedCamera.message);
      setCamera(fetchedCamera.message);
      if (stream_link) {
        setRecording(true);
      }
    } catch (error) {
      console.error('Error fetching camera:', error);
      Toast.show({
        type: 'error',
        text1: 'Camera Error',
        text2: String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    animation.current?.play();
    fetchCamera();
  }, []);

  const handleStreaming = async () => {
    if (recording) {
      console.log(!recording);
      setStreamModalVisible(true);
    } else {
      setRecording(true);
      startStreaming();
    }
  };

  const startStreaming = async () => {
    try {
      const streamingResponse = await startStream(camera.network_id);
      if (!streamingResponse.status === 200) {
        errorMessage('Error', 'Error while starting stream');
      } else {
        successMessage('Stream Initiated', `Wait for 4-5 secs for streaming`);
      }
    } catch (error) {
      console.error('Error Start streaming:', error);
      errorMessage('Error', String(error));
    } finally {
      setRecording(!recording);
      fetchCamera();
    }
  };

  const stopStreaming = async () => {
    try {
      const streamingResponse = await stopStream(camera.network_id);
      if (!streamingResponse.status === 200) {
        errorMessage('Error', `Error while stoping stream`);
      } else {
        setRecording(false);
        setStreamLink(null);
        successMessage(
          'Stream Stoped',
          `Stream of Camera ${camera.network_id} stopped`,
        );
      }
    } catch (error) {
      console.error('Error while Stop streaming:', error);
      errorMessage('Error', String(error));
    } finally {
      setStreamModalVisible(false);
    }
  };
  const confirmDelete = async () => {
    console.log('Delete:', camera.network_id);
    try {
      await deleteCamera(camera.network_id);
      await removeCameraFromStorage(camera.id);
      navigation.navigate('Cameras');
    } catch (error) {
      console.error('Error deleting camera:', error);
      errorMessage(
        'Error while Deleting',
        `Camera ${camera.network_id} not Deleted`,
      );
    } finally {
      setDeleteModalVisible(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.animationContainer}>
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
      <StatusBar translucent={true} backgroundColor="black" />
      <View style={styles.container}>
        <NavBar
          Content={camera.name}
          BackAction="Cameras"
          showThirdBtn={false}
        />

        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'column',
              paddingBottom: 100,
            }}>
            {stream_link ? (
              <View>
                <WebrtcWebView
                  rtcUrl={rtcUrl}
                  height={225}
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

                {/* <VLCPlayer
                  source={{uri: stream_link}}
                  style={styles.videoPlayer}
                  autoPlay={true}
                  muted={true}
                  videoAspectRatio={'16:9'}
                  mediaOptions={{
                    ':network-caching': 150,
                    ':live-caching': 0,
                    ':file-caching': 0,
                    ':live-caching': 0,
                    ':network-caching': 150,
                    ':clock-jitter': 0,
                    ':clock-synchro': 0,
                  }}
                /> */}
              </View>
            ) : (
              <Image
                source={require('../../assets/imgs/stream-na.png')}
                style={styles.cameraImage}
                resizeMode="contain"
              />
            )}
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                paddingHorizontal: 16,
                marginVertical: 20,
                alignItems: 'center',
                justifyContent: 'space-around',
                borderBottomWidth: 1,
                borderBottomColor: 'lightgray',
              }}>
              <TouchableOpacity
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: userRole === 0 || userRole === 4 ? 1 : 0.4,
                }}
                onPress={() =>
                  navigation.navigate('UpdateCamera', {
                    camera_id: camera.network_id,
                  })
                }
                disabled={userRole === 0 || userRole === 4 ? false : true}>
                <Image
                  source={require('../../assets/imgs/icons/pen-circle.png')}
                  style={{width: 30, height: 30}}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'Poppins-Regular',
                    marginVertical: 4,
                    color: 'gray',
                  }}>
                  Edit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity:
                    stream_link && (userRole === 0 || userRole === 4) ? 1 : 0.4,
                }}
                onPress={handleSnapshot}
                disabled={
                  stream_link && (userRole === 0 || userRole === 4)
                    ? false
                    : true
                }>
                <Image
                  source={require('../../assets/imgs/icons/circle-camera.png')}
                  style={{width: 30, height: 30}}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'Poppins-Regular',
                    marginVertical: 4,
                    color: 'gray',
                  }}>
                  Snapshot
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleStreaming()}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: userRole === 0 || userRole === 4 ? 1 : 0.4,
                }}
                disabled={userRole === 0 || userRole === 4 ? false : true}>
                <Image
                  source={
                    recording
                      ? require('../../assets/imgs/icons/signal-stream-slash.png')
                      : require('../../assets/imgs/icons/signal-stream.png')
                  }
                  style={{width: 30, height: 30}}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'Poppins-Regular',
                    marginVertical: 4,
                    color: 'gray',
                  }}>
                  {recording ? 'Stop Streaming' : 'Start Streaming'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: stream_link ? 1 : 0.4,
                }}
                onPress={() =>
                  navigation.navigate('FullViewStream', {
                    camera_name: camera.name,
                    stream_link: stream_link,
                  })
                }
                disabled={stream_link ? false : true}>
                <Image
                  source={require('../../assets/imgs/icons/expand.png')}
                  style={{width: 30, height: 30}}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'Poppins-Regular',
                    marginVertical: 4,
                    color: 'gray',
                  }}>
                  Full View
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: userRole === 0 || userRole === 4 ? 1 : 0.4,
                }}
                onPress={() => setDeleteModalVisible(true)}
                disabled={userRole === 0 || userRole === 4 ? false : true}>
                <Image
                  source={require('../../assets/imgs/icons/cross-circle.png')}
                  style={{width: 30, height: 30}}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: 'Poppins-Regular',
                    marginVertical: 4,
                    color: 'gray',
                  }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                paddingHorizontal: 35,
              }}>
              <Text style={{fontFamily: 'Poppins-Medium', fontSize: 15}}>
                Camera Status
              </Text>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Image
                  source={
                    local_stream_link
                      ? require('../../assets/imgs/icons/lan-network-on.png')
                      : require('../../assets/imgs/icons/lan-network.png')
                  }
                  style={{width: 20, height: 20, marginHorizontal: 6}}
                />
                <Image
                  source={
                    stream_link
                      ? require('../../assets/imgs/icons/wifi.png')
                      : require('../../assets/imgs/icons/wifi-off.png')
                  }
                  style={{width: 20, height: 20, marginHorizontal: 6}}
                />
              </View>
              <Text
                style={{
                  fontFamily: 'Poppins-Medium',
                  fontSize: 15,
                  marginTop: 15,
                }}>
                Settings
              </Text>
              <View
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  borderWidth: 1,
                  borderColor: 'gray',
                  borderRadius: 10,
                  marginVertical: 10,
                }}>
                <TouchableOpacity
                  style={{
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onPress={() =>
                    navigation.navigate('MotionDetection', {
                      camera_id: camera_id,
                      stream_link: stream_link,
                    })
                  }>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={require('../../assets/imgs/icons/face-viewfinder.png')}
                      style={{width: 30, height: 30, marginHorizontal: 14}}
                    />
                    <Text style={{fontFamily: 'Poppins-Regular'}}>
                      Motion Detection
                    </Text>
                  </View>
                  <Image
                    source={require('../../assets/imgs/icons/angle-small-right.png')}
                    style={{width: 16, height: 16, marginHorizontal: 14}}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'row',
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onPress={() =>
                    navigation.navigate('RealTimeAlertsCamera', {
                      camera: camera,
                    })
                  }>
                  <View
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Image
                      source={require('../../assets/imgs/icons/light-emergency-on.png')}
                      style={{width: 30, height: 30, marginHorizontal: 14}}
                    />
                    <Text style={{fontFamily: 'Poppins-Regular'}}>
                      Real Time Alerts
                    </Text>
                  </View>
                  <Image
                    source={require('../../assets/imgs/icons/angle-small-right.png')}
                    style={{width: 16, height: 16, marginHorizontal: 14}}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
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
                onPress={stopStreaming}>
                <Text style={styles.deleteButtonText}>Stop</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setStreamModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
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
                onPress={() => setDeleteModalVisible(false)}>
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
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  animation: {
    width: 300,
    height: 300,
  },

  videoPlayer: {
    width: '100%',
    height: 500,
  },
  cameraImage: {
    width: '100%',
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
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

export default ViewCamera;
