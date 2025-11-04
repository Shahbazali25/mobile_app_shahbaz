import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import AnimatedLottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import VideoPlayer from 'react-native-video-player';
import {deleteRecording} from '../../components/apis/recordings/deleteRecording';
import {checkUserRole} from '../../components/utils/checkRole';

function RecordingPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const animation = useRef(null);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const recording_id = route.params?.recording_id;
  const name = route.params?.name;

  const characterLimit = 20;
  const truncatedName = name
    ? name.length > characterLimit
      ? name.substring(0, characterLimit) + '...'
      : name
    : 'Unnamed Recording';

  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await checkUserRole();
      setUserRole(role);
    };
    fetchUserRole();
  }, []);

  const recordingDelete = async () => {
    setIsLoading(true);
    try {
      const response = await deleteRecording(recording_id);
      console.log(response);
      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: `Recording deleted`,
          text2: `Recording ${name} Deleted`,
        });
        navigation.navigate('Recordings');
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error while Deleting',
          text2: `Recording ${name} not Deleted`,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error while Deleting',
        text2: String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onLoad = data => {
    console.log(data);
  };

  const onProgress = data => {
    console.log(data);
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
    <SafeAreaView style={{flex: 1, backgroundColor: '#1E293B'}}>
      <StatusBar translucent={true} backgroundColor="black" />
      <View style={styles.container}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 10,
            paddingVertical: 15,
          }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../assets/imgs/icons/angle-small-left.png')}
              style={{width: 28, height: 28}}
            />
          </TouchableOpacity>
          <Text style={{fontSize: 20, fontFamily: 'Poppins-Medium'}}>
            {truncatedName}
          </Text>

          <TouchableOpacity
            onPress={recordingDelete}
            style={{opacity: userRole === 0 || userRole === 4 ? 1 : 0.4}}
            disabled={userRole === 0 || userRole === 4 ? false : true}>
            <Image
              source={require('../../assets/imgs/icons/delete.png')}
              style={{width: 22, height: 22}}
            />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={{display: 'flex', flexDirection: 'column'}}>
            <VideoPlayer
              source={{
                uri: `https://stream-tst-sbx.ibexvision.ai/device-recordings/serve/1/${recording_id}`,
              }}
              videoHeight={920}
              videoWidth={100}
              style={styles.videoPlayer}
              muted={true}
              controls={true}
            />
          </View>
        </ScrollView>
      </View>
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
});

export default RecordingPage;
