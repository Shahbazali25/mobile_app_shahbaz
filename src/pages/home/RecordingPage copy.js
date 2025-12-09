// import React, {useState, useRef, useEffect} from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   Image,
//   StatusBar,
// } from 'react-native';
// import {SafeAreaView} from 'react-native-safe-area-context';
// import {useNavigation, useRoute} from '@react-navigation/native';
// import AnimatedLottieView from 'lottie-react-native';
// import Toast from 'react-native-toast-message';
// import VideoPlayer from 'react-native-video-player';
// import {deleteRecording} from '../../components/apis/recordings/deleteRecording';
// import {checkUserRole} from '../../components/utils/checkRole';
// import NavBar from '../../layouts/navigations/navbar';

// import {loadData} from '../../components/auth/loadData';
// import {baseURL, deviceId} from '../../components/utils/baseUrl';
//  import Video from 'react-native-video';

// function RecordingPage() {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const animation = useRef(null);
//   const [userRole, setUserRole] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const recording_id = route.params?.recording_id;
//   const name = route.params?.name;

//   const [auth, setAuth] = useState(null);

//   // const auth = loadData();
//   const [videoStatus, setVideoStatus] = useState(null);
//   const [videoUrl, setVideoUrl] = useState('');
//   const [error, setError] = useState(null);
// const pollingIntervalRef = useRef(null);

//   const startPolling = (statusUrl) => {
//     console.log("\n\n\n\n  ********** Polling:", statusUrl);

//       // Clear any existing interval
//         if (pollingIntervalRef.current) {
//             clearInterval(pollingIntervalRef.current);
//             pollingIntervalRef.current = null;
//         }

//         // Set up polling
//         pollingIntervalRef.current = setInterval(async () => {
//               console.log("\n\n\n\n  ********** Polling running  :", statusUrl);

//             try {
//                 const token = auth.access_token;
//                 const url = `${baseURL}${statusUrl}?access_token=${token}`;

//                 const response = await fetch(url, {
//                     method: 'GET',
//                     headers: {},
//                 });

//                 if (!response.ok) {
//                     throw new Error(`Polling failed: ${response.status}`);
//                 }

//                 const result = await response.json();

//                 if (result.data?.status === 'ready' && result.data?.url) {
//                     // Video is ready
//                     if (pollingIntervalRef.current) {
//                         clearInterval(pollingIntervalRef.current);
//                         pollingIntervalRef.current = null;
//                     }
//                     setVideoStatus('ready');
//                     setVideoUrl(result.data.url);

//                 } else if (result.data?.status === 'error') {
//                     // Error occurred
//                     if (pollingIntervalRef.current) {
//                         clearInterval(pollingIntervalRef.current);
//                         pollingIntervalRef.current = null;
//                     }
//                     setVideoStatus('error');
//                     setError("Failed to process video. Please try again.");
//                 }
//                 // If status is still 'pending', continue polling
//             } catch (err) {
//                 console.error("Error polling video status:", err);
//                 if (pollingIntervalRef.current) {
//                     clearInterval(pollingIntervalRef.current);
//                     pollingIntervalRef.current = null;
//                 }
//                 setVideoStatus('error');
//                 setError("Failed to check video status. Please try again.");
//             }
//         }, 3000); // Poll every 3 seconds
//   };

//   const characterLimit = 20;
//   const truncatedName = name
//     ? name.length > characterLimit
//       ? name.substring(0, characterLimit) + '...'
//       : name
//     : 'Unnamed Recording';

//   useEffect(() => {
//     const fetchUserRole = async () => {
//       const role = await checkUserRole();
//       setUserRole(role);
//     };
//     fetchUserRole();
//   }, []);

//   // Run requestVideo only after auth is loaded
//   useEffect(() => {
//     if (auth?.access_token) {
//       requestVideo();
//     }
//   }, [auth]);

//       useEffect(() => {
//     const fetchAuth = async () => {
//       const data = await loadData();   // async function
//       setAuth(data);
//     };
//     fetchAuth();
//   }, []);

//    const requestVideo = async () => {
//           setVideoStatus('loading');
//           setVideoUrl('');

//           try {

//             const token = auth?.access_token;
//             console.log('\n\n\n\n\n line 145 rcording page :: TOKEN =========:', token);
//             console.log("TOKEN:", token,'\n\n\n\n');

//               const encodedId = encodeURIComponent(recording_id);
//               const url = `${baseURL}/device-recordings/serve/${deviceId}/${encodedId}?access_token=${token}`;

//               const response = await fetch(url, {
//                   method: 'GET',
//                   headers: {},
//               });

//               if (!response.ok) {
//                   throw new Error(`Failed to request video: ${response.status}`);
//               }

//               const result = await response.json();
//               console.log('\n\n  in 163 recording page :: result =========:', result);

//               if (result.data?.status === 'ready' && result.data?.url) {
//                   // Video is immediately ready
//                   setVideoStatus('ready');
//                   setVideoUrl(result.data.url);
//                   console.log("\n\n\n *******  171  Error requesting video:\n", result.data.url, '\n\n\n');

//               } else if (result.data?.statusUrl) {
//                   // Need to poll for status
//                   setVideoStatus('loading');
//                   startPolling(result.data.statusUrl);
//               } else {
//                   throw new Error('Invalid response from server');
//               }
//           } catch (err) {
//               console.error("Error requesting video:", err);
//               setVideoStatus('error');
//               setError("Failed to load video. Please try again.");
//           }
//       };

//   const recordingDelete = async () => {
//     setIsLoading(true);
//     try {
//       const response = await deleteRecording(recording_id);
//       console.log(response);
//       if (response.status === 200) {
//         Toast.show({
//           type: 'success',
//           text1: `Recording deleted`,
//           text2: `Recording ${name} Deleted`,
//         });
//         navigation.navigate('Recordings');
//       } else {
//         Toast.show({
//           type: 'error',
//           text1: 'Error while Deleting',
//           text2: `Recording ${name} not Deleted`,
//         });
//       }
//     } catch (error) {
//       Toast.show({
//         type: 'error',
//         text1: 'Error while Deleting',
//         text2: String(error),
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const onLoad = data => {
//     console.log(data);
//   };

//   const onProgress = data => {
//     console.log(data);
//   };

//   if (isLoading) {
//     return (
//       <View style={styles.animationContainer}>
//         <AnimatedLottieView
//           ref={animation}
//           source={require('../../assets/animations/loading.json')}
//           style={styles.animation}
//           autoPlay={true}
//           loop
//         />
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView style={{flex: 1, backgroundColor: '#1E293B'}}>
//       <StatusBar translucent={true} backgroundColor="black" />
//       <View style={styles.container}>

//         {/* <NavBar
//             Content="All Cameras"
//             BackAction="Home"
//             showThirdBtn={true}
//             ThirdBtnNavigation={'AddCamera'}
//           /> */}

//         <View
//           style={{
//             display: 'flex',
//             flexDirection: 'row',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             paddingHorizontal: 10,
//             paddingVertical: 15,
//           }}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Image
//               source={require('../../assets/imgs/icons/angle-small-left.png')}
//               style={{width: 28, height: 28}}
//             />
//           </TouchableOpacity>
//           <Text style={{fontSize: 20, fontFamily: 'Poppins-Medium'}}>
//             {truncatedName}
//           </Text>

//           <TouchableOpacity
//             onPress={recordingDelete}
//             style={{opacity: userRole === 0 || userRole === 4 ? 1 : 0.4}}
//             disabled={userRole === 0 || userRole === 4 ? false : true}>
//             <Image
//               source={require('../../assets/imgs/icons/delete.png')}
//               style={{width: 22, height: 22}}
//             />
//           </TouchableOpacity>
//         </View>

//         <ScrollView contentContainerStyle={styles.scrollViewContent}>
//           <View style={{ display: "flex", flexDirection: "column" }}>

//             {videoUrl ? (
//               // <VideoPlayer
//               //   source={{ uri: videoUrl }}
//               //   videoHeight={920}
//               //   videoWidth={100}
//               //   style={styles.videoPlayer}
//               //   muted={true}
//               //   controls={false}
//               // />
//               <Video
//                 source={{ uri: videoUrl }}
//                 style={styles.videoPlayer}
//                 controls={true}        // shows ONE set of controls
//                 resizeMode="contain"
//                 onError={err => console.log("Video Error:", err)}
//               />

//             ) : (
//               <Text style={{color: 'gray', textAlign: 'center', marginTop: 20}}>
//                 Video is loading...
//               </Text>
//             )}

//           </View>
//         </ScrollView>

//       </View>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   animationContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   container: {
//     flex: 1,
//       backgroundColor: '#ffffffff',
// },
//   scrollViewContent: {
//     flexGrow: 1,
//   },
//   animation: {
//     width: 300,
//     height: 300,
//   },
//   videoPlayer: {
//     width: '100%',
//     height: 500,
//   },
// });

// export default RecordingPage;
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Slider from '@react-native-community/slider';

import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import AnimatedLottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import VideoPlayer from 'react-native-video-controls';
import {deleteRecording} from '../../components/apis/recordings/deleteRecording';
import {checkUserRole} from '../../components/utils/checkRole';
import {loadData} from '../../components/auth/loadData';
import {baseURL, deviceId} from '../../components/utils/baseUrl';

function RecordingPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const animation = useRef(null);
  const videoRef = useRef(null);

  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [auth, setAuth] = useState(null);
  const [isMounted, setIsMounted] = useState(false);
  const [readyToPlay, setReadyToPlay] = useState(true);

  const recording_id = route.params?.recording_id;
  const name = route.params?.name;

  useEffect(() => {
    if (isMounted && videoStatus === 'ready' && videoUrl) {
      const timer = setTimeout(() => setReadyToPlay(true), 100); // 100ms delay
      return () => clearTimeout(timer);
    }
  }, [isMounted, videoStatus, videoUrl]);

  // Video states
  const [videoStatus, setVideoStatus] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState(null);
  const pollingIntervalRef = useRef(null);

  // Video player states
  const [paused, setPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const startPolling = statusUrl => {
    console.log('\n\n\n\n  ********** Polling:', statusUrl);

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    pollingIntervalRef.current = setInterval(async () => {
      console.log('\n\n\n\n  ********** Polling running  :', statusUrl);

      try {
        const token = auth.access_token;
        const url = `${baseURL}${statusUrl}?access_token=${token}`;

        const response = await fetch(url, {
          method: 'GET',
          headers: {},
        });

        if (!response.ok) {
          throw new Error(`Polling failed: ${response.status}`);
        }

        const result = await response.json();

        if (result.data?.status === 'ready' && result.data?.url) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setVideoStatus('ready');
          setVideoUrl(result.data.url);
          console.log(
            '\n\n\n *******  Video ready:',
            result.data.url,
            '\n\n\n',
          );
        } else if (result.data?.status === 'error') {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
          setVideoStatus('error');
          setError('Failed to process video. Please try again.');
        }
      } catch (err) {
        console.error('Error polling video status:', err);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setVideoStatus('error');
        setError('Failed to check video status. Please try again.');
      }
    }, 3000);
  };

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

  useEffect(() => {
    if (auth?.access_token) {
      requestVideo();
    }
  }, [auth]);

  useEffect(() => {
    const fetchAuth = async () => {
      const data = await loadData();
      setAuth(data);
    };
    fetchAuth();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const requestVideo = async () => {
    setVideoStatus('loading');
    setVideoUrl('');

    try {
      const token = auth?.access_token;
      const encodedId = encodeURIComponent(recording_id);
      const url = `${baseURL}/device-recordings/serve/${deviceId}/${encodedId}?access_token=${token}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {},
      });
      if (!response.ok) {
        throw new Error(`Failed to request video: ${response.status}`);
      }
      const result = await response.json();
      if (result.data?.status === 'ready' && result.data?.url) {
        setVideoStatus('ready');
        setVideoUrl(result.data.url);
      } else if (result.data?.statusUrl) {
        setVideoStatus('loading');
        startPolling(result.data.statusUrl);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error requesting video:', err);
      setVideoStatus('error');
      setError('Failed to load video. Please try again.');
    }
  };

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

  // Video event handlers
  const onLoad = data => {
    console.log('Video loaded:', data);
    setDuration(data.duration);
  };

  const onProgress = data => {
    if (!isSeeking) {
      setCurrentTime(data.currentTime);
    }
  };

  const onEnd = () => {
    setPaused(true);
    setCurrentTime(duration);
  };

  const onError = error => {
    console.error('Video Error:', error);
    setError('Failed to play video');
  };

  // Seek handler
  const handleSeek = value => {
    setIsSeeking(true);
    setCurrentTime(value);
  };

  const handleSlidingComplete = value => {
    if (videoRef.current) {
      videoRef.current.seek(value);
    }
    setIsSeeking(false);
  };

  // Format time for display
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    setPaused(!paused);
  };

  // Skip forward/backward
  const skipForward = () => {
    const newTime = Math.min(currentTime + 10, duration);
    if (videoRef.current) {
      videoRef.current.seek(newTime);
    }
    setCurrentTime(newTime);
  };

  const skipBackward = () => {
    const newTime = Math.max(currentTime - 10, 0);
    if (videoRef.current) {
      videoRef.current.seek(newTime);
    }
    setCurrentTime(newTime);
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../assets/imgs/icons/angle-small-left.png')}
              style={{width: 28, height: 28}}
            />
          </TouchableOpacity>
          <Text style={styles.headerText}>{truncatedName}</Text>
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
          <View style={styles.videoContainer}>
            {videoStatus === 'loading' && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Preparing video...</Text>
              </View>
            )}

            {videoStatus === 'error' && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={requestVideo}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}

            {readyToPlay && (
              <View style={styles.videoWrapper}>
                <VideoPlayer
                  ref={videoRef}
                  source={{uri: videoUrl}}
                  style={styles.videoPlayer}
                  onBack={() => navigation.goBack()}
                  tapAnywhereToPause={true}
                  disableVolume={false}
                  disableBack={true}
                  disableFullscreen={false}
                  resizeMode="contain"
                  seekColor="#3B82F6"
                  controlTimeout={5000}
                  onError={err => {
                    console.error('VideoPlayer Error:', err);
                    setError('Failed to play video. See console.');
                  }}
                  onBuffer={buf => console.log('Buffering:', buf)}
                  onLoad={data => console.log('Video loaded:', data)}
                />
              </View>
            )}
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
    backgroundColor: '#ffffff',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  headerText: {
    fontSize: 20,
    fontFamily: 'Poppins-Medium',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  animation: {
    width: 300,
    height: 300,
  },
  videoContainer: {
    width: '100%',
    minHeight: 500,
  },
  videoWrapper: {
    width: '100%',
    height: 500,
    backgroundColor: '#000',
    position: 'relative',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    width: '100%',
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 16,
  },
  errorContainer: {
    width: '100%',
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 20,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  playPauseButton: {
    backgroundColor: '#3B82F6',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  playPauseText: {
    color: '#fff',
    fontSize: 24,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'center',
  },
});

export default RecordingPage;
