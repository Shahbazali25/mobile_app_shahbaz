import {React, useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
} from 'react-native';
import Toast from 'react-native-toast-message';
import {SafeAreaView} from 'react-native-safe-area-context';
import AnimatedLottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getCameraNotifications} from '../../components/apis/cameras/notifications';
import {alertStatus} from '../../components/apis/cameras/alertsStatus';
import ImageViewer from 'react-native-image-zoom-viewer';
import {checkUserRole} from '../../components/utils/checkRole';

export default function Notifications() {
  const animation = useRef(null);
  const [isLoading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const openImageViewer = url => {
    console.log(url);
    setCurrentImageUrl(url);
    setImageViewerVisible(true);
  };

  useEffect(() => {
    animation.current?.play();

    const fetchNotifications = async () => {
      try {
        const role = await checkUserRole();
        console.log(role);
        const response = await getCameraNotifications();
        console.log('Notifications:', response);
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
          text1: 'Unauthorized',
          text2: String(error),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

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

  const handleViewStatus = async alertId => {
    console.log(alertId);
    console.log(notifications);
    if (notifications && notifications.data) {
      const updatedNotificationsData = notifications.data.map(notification => {
        if (notification.id === alertId) {
          console.log(notification.id);
          return {...notification, view: 0};
        }
        return notification;
      });
      console.log(updatedNotificationsData);
      setNotifications({...notifications, data: updatedNotificationsData});
      const response = await alertStatus(alertId);
      const updatedCount = updatedNotificationsData.filter(
        item => item.view === 1,
      ).length;
      await AsyncStorage.setItem('notificationCount', updatedCount.toString());
      console.log(response);
    } else {
      console.error('Notifications data is undefined or null.');
    }
  };

  const renderNotificationItem = (item, index) => {
    const isVideo = item.mediaType === 'video/mp4';
    const notifyType = item.type;

    const renderContent = () => {
      switch (notifyType) {
        case 'motion_detection':
          return (
            <TouchableOpacity
              style={styles.notificationContainer}
              key={item.id || index}
              onPress={() => handleViewStatus(item.id)}>
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
            </TouchableOpacity>
          );
        default:
          return (
            <TouchableOpacity
              style={
                item.view === 0
                  ? styles.notificationContainer
                  : styles.notificationContainerRead
              }
              key={item.id || index}
              onPress={() => handleViewStatus(item.id)}>
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
            </TouchableOpacity>
          );
      }
    };

    return <View key={item.id}>{renderContent()}</View>;
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View
        style={{
          display: 'flex',
          alignSelf: 'stretch',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'left',
          marginTop: 10,
          paddingHorizontal: 30,
        }}>
        <Text
          style={{
            fontFamily: 'Poppins-Medium',
            alignSelf: 'center',
            paddingVertical: 10,
            fontSize: 24,
          }}>
          Notifications
        </Text>
      </View>
      <ScrollView style={styles.form}>
        <View style={styles.container}>
          {notifications &&
          notifications.data &&
          notifications.data.length === 0 ? (
            <Text style={styles.noNotificationsText}>
              No notifications yet.
            </Text>
          ) : (
            notifications &&
            notifications.data &&
            notifications.data.map(renderNotificationItem)
          )}
        </View>
      </ScrollView>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  form: {
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: 30,
    backgroundColor: 'white',
    flexGrow: 1,
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
  notificationContainerRead: {
    flexDirection: 'column',
    padding: 20,
    backgroundColor: '#D8E1E8',
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 10,
    marginVertical: 5,
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
    borderRadius: 10,
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
