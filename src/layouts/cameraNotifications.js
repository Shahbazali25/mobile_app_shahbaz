import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {useNavigation} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AnimatedLottieView from 'lottie-react-native';
import {getCameraNotifications} from '../components/apis/cameras/notifications';
import ImageViewer from 'react-native-image-zoom-viewer';
import {checkUserRole} from '../components/utils/checkRole';

function CameraNotifications() {
  const animation = useRef(null);
  const [isLoading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(null);
  const navigation = useNavigation();
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    animation.current?.play();

    const fetchNotifications = async () => {
      try {
        const role = await checkUserRole();
        setUserRole(role);
        console.log(role);
        const response = await getCameraNotifications();
        if (role === 2 || role === 1) {
          const sensorNotificationTypes = [
            'sensor_created',
            'sensor_updated',
            'sensor_deleted',
          ];
          const filteredSensorNotifications = {
            data: response.data.filter(notification =>
              sensorNotificationTypes.includes(notification.type),
            ),
          };
          console.log(filteredSensorNotifications);
          const count = filteredSensorNotifications.data.length;
          await AsyncStorage.setItem('notificationCount', count.toString());
          setNotifications(filteredSensorNotifications);
        } else if (role === 3 || role == 4) {
          const cameraNotificationTypes = [
            'camera_created',
            'camera_create',
            'motion_detection',
            'camera_updated',
            'cloud_stream_started',
            'camera_update',
            'local_start_stream',
            'local_stop_stream',
            'camera_bind',
            "detection_config_updated"
          ];
          const filteredCameraNotifications = {
            data: response.data.filter(notification =>
              cameraNotificationTypes.includes(notification.type),
            ),
          };
          console.log(filteredCameraNotifications);
          const count = filteredCameraNotifications.data.length;
          await AsyncStorage.setItem('notificationCount', count.toString());
          setNotifications(filteredCameraNotifications);
        } else {
          setNotifications(response);
        }
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Notification Error',
          text2: String(error),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const openImageViewer = url => {
    console.log(url);
    setCurrentImageUrl(url);
    setImageViewerVisible(true);
  };

  const renderNotificationItem = (item, index) => {
    const isVideo = item.mediaType === 'video/mp4';
    const notifyType = item.type;

    const renderContent = () => {
      switch (notifyType) {
        case 'motion_detection':
          return (
            <View style={styles.notificationContainer} key={item.id || index}>
              <View style={styles.notificationHeader}>
                <View style={styles.notificationTitle}>
                  <Text style={styles.notificationBoldText}>
                    {item.title || 'No Title'}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {item.timestamp
                      ? new Date(item.timestamp).toLocaleString()
                      : 'No Time'}
                  </Text>
                </View>
              </View>
              {isVideo ? (
                <TouchableOpacity
                  activeOpacity={0.4}
                  onPress={() => openImageViewer(item.mediaUrl)}>
                  <Image source={{uri: item.mediaUrl}} style={styles.media} />
                  <View style={styles.imageOverlay}>
                    <Text style={styles.tapToViewText}>Tap to view</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <Text
                  style={{
                    fontFamily: 'Poppins-Medium',
                    fontSize: 12,
                    fontStyle: 'italic',
                  }}>
                  No Preview Available
                </Text>
              )}
              <Text style={styles.notificationDescription}>
                {item.description || 'No Description'}
              </Text>
            </View>
          );
        default:
          return (
            <View style={styles.notificationContainer} key={item.id || index}>
              <View style={styles.notificationHeader}>
                <View style={styles.notificationTitle}>
                  <Text style={styles.notificationBoldText}>
                    {item.title || 'No Title'}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {item.timestamp
                      ? new Date(item.timestamp).toLocaleString()
                      : 'No Time'}
                  </Text>
                </View>
              </View>
              <Text style={styles.notificationDescription}>
                {item.description || 'No Description'}
              </Text>
            </View>
          );
      }
    };

    return <View key={item.id}>{renderContent()}</View>;
  };

  if (isLoading) {
    return (
      <View style={styles.animationContainer}>
        <AnimatedLottieView
          ref={animation}
          source={require('../assets/animations/loading.json')}
          style={styles.animation}
          autoPlay={false}
          loop
        />
      </View>
    );
  }

  const lastThreeNotifications =
    notifications && notifications.data ? notifications.data.slice(0, 3) : [];

  return (
    <View style={styles.container}>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Text style={{fontFamily: 'Poppins-SemiBold', fontSize: 18}}>
          Notifications
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
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
      {notifications &&
      notifications.data &&
      notifications.data.length === 0 ? (
        <Text style={styles.noNotificationsText}>No notifications yet.</Text>
      ) : (
        lastThreeNotifications.map(renderNotificationItem)
      )}
      {notifications && notifications.data && notifications.data.length > 3}

      {/* Image Viewer Modal */}
      <Modal visible={imageViewerVisible} transparent={true}>
        <ImageViewer
          imageUrls={[{url: currentImageUrl}]}
          enableSwipeDown={true}
          onSwipeDown={() => setImageViewerVisible(false)}
          onClick={() => setImageViewerVisible(false)}
          renderHeader={() => (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setImageViewerVisible(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 80,
    height: 80,
  },
  container: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
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
    backgroundColor: '#f2f2f2',
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 10,
    marginVertical: 5,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  notificationTitle: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginHorizontal: 20,
  },
  notificationBoldText: {
    fontFamily: 'Poppins-Medium',
  },
  notificationTime: {
    color: 'gray',
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  notificationDescription: {
    marginTop: 10,
    fontFamily: 'Poppins-Regular',
  },
  noNotificationsText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
    fontFamily: 'Poppins-Regular',
  },
  media: {
    width: '100%',
    marginTop: 10,
    borderRadius: 8,
    aspectRatio: 16 / 9,
  },
  imageOverlay: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
  },
  tapToViewText: {
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    fontFamily: 'Poppins-Medium',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1000,
    width: 30,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CameraNotifications;
