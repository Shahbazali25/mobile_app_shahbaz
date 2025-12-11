import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Platform,
  ToastAndroid,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import AnimatedLottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import {WebView} from 'react-native-webview';
import {deleteRecording} from '../../components/apis/recordings/deleteRecording';
import {checkUserRole} from '../../components/utils/checkRole';
import {loadData} from '../../components/auth/loadData';
import {baseURL, deviceId} from '../../components/utils/baseUrl';
import RNFS from 'react-native-fs';
import {PermissionsAndroid} from 'react-native';
const {width, height} = Dimensions.get('window');

function RecordingPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const pollingIntervalRef = useRef(null);
  const webViewRef = useRef(null);

  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState(null);
  const [videoStatus, setVideoStatus] = useState('idle');
  const [webViewLoading, setWebViewLoading] = useState(true);

  const recording_id = route.params?.recording_id;
  const name = route.params?.name;
  const truncatedName =
    name && name.length > 20
      ? name.substring(0, 20) + '...'
      : name || 'Unnamed Recording';

  // Fetch user role
  useEffect(() => {
    const fetchUserRole = async () => {
      const role = await checkUserRole();
      setUserRole(role);
    };
    fetchUserRole();
  }, []);

  // Fetch video URL with polling
  useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        const auth = await loadData();
        const token = auth?.access_token;

        if (!token) {
          throw new Error('No authentication token found');
        }

        const encodedId = encodeURIComponent(recording_id);
        const url = `${baseURL}/device-recordings/serve/${deviceId}/${encodedId}?access_token=${token}`;

        console.log('Fetching video from:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            accept: '*/*',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch video: ${response.status}`);
        }

        const result = await response.json();
        const status = result.data?.status;

        console.log('Video status:', status);
        console.log('Video URL:', result.data?.url);

        setVideoStatus(status || 'unknown');

        if (status === 'ready' && result.data?.url) {
          console.log('Video URL ready:', result.data.url);
          setVideoUrl(result.data.url);
          setIsLoading(false);

          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        } else if (status === 'processing' || status === 'pending') {
          setIsLoading(true);
        } else if (status === 'failed' || status === 'error') {
          throw new Error('Video processing failed');
        }
      } catch (err) {
        console.error('Error fetching video:', err);
        setError('Failed to load video. Please try again.');
        setIsLoading(false);
        setVideoStatus('error');

        Toast.show({
          type: 'error',
          text1: 'Video Error',
          text2: err.message || 'Failed to load video',
        });

        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    };

    setIsLoading(true);
    fetchVideoUrl();

    pollingIntervalRef.current = setInterval(() => {
      fetchVideoUrl();
    }, 3000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [recording_id]);

  // Delete recording
  const recordingDelete = async () => {
    setIsLoading(true);
    try {
      const response = await deleteRecording(recording_id);
      if (response.status === 200) {
        Toast.show({
          type: 'success',
          text1: 'Recording deleted',
          text2: `Recording ${name} deleted successfully`,
        });
        navigation.navigate('Recordings');
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete recording',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate HTML for video player with custom controls
  const generateVideoHTML = url => {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <meta name="mobile-web-app-capable" content="yes">
          <meta name="apple-mobile-web-app-capable" content="yes">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            html, body {
              width: 100%;
              height: 100%;
              overflow: hidden;
              background-color: #000;
            }
            
            body {
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              align-items: center;
            }
            
            #video-container {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              align-items: center;
              background-color: #000;
              position: relative;
              padding-bottom: 100px;
            }
            
            video {
              width: 100%;
              height: 100%;
              object-fit: contain;
              background-color: #000;
            }
            
            /* Hide default controls */
            video::-webkit-media-controls {
              display: none !important;
            }
            
            video::-webkit-media-controls-enclosure {
              display: none !important;
            }
            
            /* Center play/pause button */
            #center-play-button {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 80px;
              height: 80px;
              background: rgba(0, 0, 0, 0.7);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.3s ease;
              z-index: 100;
              backdrop-filter: blur(10px);
              border: 3px solid rgba(255, 255, 255, 0.3);
            }
            
            #center-play-button:active {
              transform: translate(-50%, -50%) scale(0.9);
            }
            
            #center-play-button.hidden {
              opacity: 0;
              pointer-events: none;
            }
            
            #center-play-button svg {
              width: 40px;
              height: 40px;
              fill: #fff;
            }
            
            /* Bottom controls */
            #custom-controls {
              position: absolute;
              bottom: 120px;
              left: 50%;
              transform: translateX(-50%);
              width: 92%;
              max-width: 600px;
              background: linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.85) 100%);
              padding: 16px 12px;
              border-radius: 12px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
              transition: opacity 0.3s ease;
              z-index: 50;
            }
            
            #custom-controls.hidden {
              opacity: 0;
              pointer-events: none;
            }
            
            /* Progress bar container */
            #progress-container {
              width: 100%;
              height: 30px;
              display: flex;
              align-items: center;
              margin-bottom: 12px;
              cursor: pointer;
            }
            
            #progress-bar {
              position: relative;
              width: 100%;
              height: 5px;
              background: rgba(255, 255, 255, 0.3);
              border-radius: 5px;
              overflow: hidden;
            }
            
            #progress-filled {
              height: 100%;
              background: #3B82F6;
              width: 0%;
              transition: width 0.1s linear;
              border-radius: 5px;
            }
            
            #progress-buffered {
              position: absolute;
              top: 0;
              left: 0;
              height: 100%;
              background: rgba(255, 255, 255, 0.2);
              width: 0%;
              border-radius: 5px;
            }
            
            /* Control buttons row */
            #controls-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            
            #left-controls {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            #rewind-btn,
            #forward-btn,
            #play-pause-btn {
              width: 40px;
              height: 40px;
              background: transparent;
              border: none;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0;
            }
            
            #rewind-btn svg,
            #forward-btn svg {
              width: 32px;
              height: 32px;
              fill: #fff;
            }
            
            #play-pause-btn svg {
              width: 28px;
              height: 28px;
              fill: #fff;
            }
            
            #time-display {
              color: #fff;
              font-size: 13px;
              font-weight: 500;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              white-space: nowrap;
              margin-left: 4px;
            }
            
            #fullscreen-btn {
              width: 40px;
              height: 40px;
              background: transparent;
              border: none;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0;
            }
            
            #fullscreen-btn svg {
              width: 24px;
              height: 24px;
              fill: #fff;
            }
            
            /* Loading spinner */
            .loading {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 50px;
              height: 50px;
              border: 4px solid rgba(255, 255, 255, 0.3);
              border-top: 4px solid #3B82F6;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              z-index: 10;
            }
            
            @keyframes spin {
              0% { transform: translate(-50%, -50%) rotate(0deg); }
              100% { transform: translate(-50%, -50%) rotate(360deg); }
            }
            
            .error {
              color: #DC2626;
              text-align: center;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 16px;
            }
            
            #video-player {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 100px;
            }
          </style>
        </head>
        <body>
          <div id="video-container">
            <div id="loading" class="loading"></div>
            <video
              id="video-player"
              playsinline
              preload="auto"
              webkit-playsinline="true"
              style="display: none;"
              onloadeddata="document.getElementById('loading').style.display='none'; this.style.display='block'; initializeControls();"
              onerror="handleError()"
            >
              <source src="${url}" type="video/mp4">
              Your browser does not support the video tag.
            </video>
            
            <!-- Center Play/Pause Button -->
            <div id="center-play-button" onclick="togglePlayPause()">
              <svg id="center-play-icon" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <svg id="center-pause-icon" viewBox="0 0 24 24" style="display: none;">
                <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
              </svg>
            </div>
            
            <!-- Custom Controls -->
            <div id="custom-controls">
              <!-- Progress Bar -->
              <div id="progress-container" onclick="seekVideo(event)">
                <div id="progress-bar">
                  <div id="progress-buffered"></div>
                  <div id="progress-filled"></div>
                </div>
              </div>
              
              <!-- Control Buttons -->
              <div id="controls-row">
                <div id="left-controls">
                  <!-- Rewind 10 seconds -->
                  <button id="rewind-btn" onclick="rewindVideo()">
                    <svg viewBox="0 0 24 24">
                      <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                      <text x="12" y="16" font-size="8" text-anchor="middle" fill="white" font-weight="bold">10</text>
                    </svg>
                  </button>
                  
                  <!-- Play/Pause -->
                  <button id="play-pause-btn" onclick="togglePlayPause()">
                    <svg id="play-icon" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <svg id="pause-icon" viewBox="0 0 24 24" style="display: none;">
                      <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
                    </svg>
                  </button>
                  
                  <!-- Forward 10 seconds -->
                  <button id="forward-btn" onclick="forwardVideo()">
                    <svg viewBox="0 0 24 24">
                      <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z"/>
                      <text x="12" y="16" font-size="8" text-anchor="middle" fill="white" font-weight="bold">10</text>
                    </svg>
                  </button>
                  
                  <span id="time-display">0:00 / 0:00</span>
                </div>
                
                <button id="fullscreen-btn" onclick="toggleFullscreen()">
                  <svg viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <script>
            let video;
            let centerPlayButton;
            let customControls;
            let hideControlsTimeout;
            
            function initializeControls() {
              video = document.getElementById('video-player');
              centerPlayButton = document.getElementById('center-play-button');
              customControls = document.getElementById('custom-controls');
              
              // Show controls initially
              showControls();
              
              // Auto-hide controls after 3 seconds
              resetHideControlsTimer();
              
              // Show controls on tap
              video.addEventListener('click', function(e) {
                if (customControls.classList.contains('hidden')) {
                  showControls();
                  resetHideControlsTimer();
                } else {
                  togglePlayPause();
                }
              });
              
              // Update progress
              video.addEventListener('timeupdate', updateProgress);
              video.addEventListener('progress', updateBuffered);
              
              // Update play/pause icons
              video.addEventListener('play', function() {
                updatePlayPauseIcons(true);
              });
              
              video.addEventListener('pause', function() {
                updatePlayPauseIcons(false);
              });
              
              // Hide center button when playing
              video.addEventListener('playing', function() {
                centerPlayButton.classList.add('hidden');
              });
              
              video.addEventListener('pause', function() {
                centerPlayButton.classList.remove('hidden');
              });
              
              video.addEventListener('ended', function() {
                centerPlayButton.classList.remove('hidden');
                updatePlayPauseIcons(false);
              });
              
              // Send messages to React Native
              video.addEventListener('loadedmetadata', function() {
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'loaded',
                    duration: video.duration
                  }));
                }
              });
              
              video.addEventListener('canplay', function() {
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ready'
                  }));
                }
              });
              
              video.addEventListener('ended', function() {
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ended'
                  }));
                }
              });
              
              // Auto-play
              video.play().catch(e => console.log('Auto-play prevented:', e));
            }
            
            function togglePlayPause() {
              if (video.paused) {
                video.play();
              } else {
                video.pause();
              }
              showControls();
              resetHideControlsTimer();
            }
            
            function updatePlayPauseIcons(isPlaying) {
              // Update bottom controls
              document.getElementById('play-icon').style.display = isPlaying ? 'none' : 'block';
              document.getElementById('pause-icon').style.display = isPlaying ? 'block' : 'none';
              
              // Update center button
              document.getElementById('center-play-icon').style.display = isPlaying ? 'none' : 'block';
              document.getElementById('center-pause-icon').style.display = isPlaying ? 'block' : 'none';
            }
            
            function updateProgress() {
              const progress = (video.currentTime / video.duration) * 100;
              document.getElementById('progress-filled').style.width = progress + '%';
              
              const currentTime = formatTime(video.currentTime);
              const duration = formatTime(video.duration);
              document.getElementById('time-display').textContent = currentTime + ' / ' + duration;
            }
            
            function updateBuffered() {
              if (video.buffered.length > 0) {
                const buffered = (video.buffered.end(video.buffered.length - 1) / video.duration) * 100;
                document.getElementById('progress-buffered').style.width = buffered + '%';
              }
            }
            
            function seekVideo(event) {
              const progressBar = document.getElementById('progress-container');
              const rect = progressBar.getBoundingClientRect();
              const pos = (event.clientX - rect.left) / rect.width;
              video.currentTime = pos * video.duration;
              showControls();
              resetHideControlsTimer();
            }
            
            function rewindVideo() {
              video.currentTime = Math.max(0, video.currentTime - 10);
              showControls();
              resetHideControlsTimer();
            }
            
            function forwardVideo() {
              video.currentTime = Math.min(video.duration, video.currentTime + 10);
              showControls();
              resetHideControlsTimer();
            }
            
            function toggleFullscreen() {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
              } else {
                document.exitFullscreen();
              }
            }
            
            function formatTime(seconds) {
              if (isNaN(seconds)) return '0:00';
              const mins = Math.floor(seconds / 60);
              const secs = Math.floor(seconds % 60);
              return mins + ':' + (secs < 10 ? '0' : '') + secs;
            }
            
            function showControls() {
              customControls.classList.remove('hidden');
            }
            
            function hideControls() {
              if (!video.paused) {
                customControls.classList.add('hidden');
              }
            }
            
            function resetHideControlsTimer() {
              clearTimeout(hideControlsTimeout);
              hideControlsTimeout = setTimeout(hideControls, 3000);
            }
            
            function handleError() {
              const container = document.getElementById('video-container');
              const loading = document.getElementById('loading');
              loading.style.display = 'none';
              container.innerHTML = '<div class="error">Failed to load video. Please try again.</div>';
              
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'error',
                  message: 'Failed to load video'
                }));
              }
            }
            
            // Prevent page reload on error
            window.addEventListener('error', function(e) {
              e.preventDefault();
              handleError();
            });
            
            // Auto-hide loading after 3 seconds
            setTimeout(function() {
              const loading = document.getElementById('loading');
              const video = document.getElementById('video-player');
              if (loading && loading.style.display !== 'none') {
                loading.style.display = 'none';
                video.style.display = 'block';
                initializeControls();
              }
            }, 3000);
          </script>
        </body>
      </html>
    `;
  };

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;

    if (Platform.Version >= 33) {
      // Android 13+ (target SDK 33)
      const readGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        {
          title: 'Storage Permission',
          message: 'App needs access to download videos',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return readGranted === PermissionsAndroid.RESULTS.GRANTED;
    } else if (Platform.Version >= 30) {
      // Android 11+
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to download videos',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      // Android < 11
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to download videos',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  };

  const downloadVideo = async () => {
    if (!videoUrl) {
      Toast.show({
        type: 'error',
        text1: 'Download Error',
        text2: 'No video URL available',
      });
      return;
    }

    const hasPermission = await requestStoragePermission();

    if (!hasPermission) {
      Toast.show({
        type: 'error',
        text1: 'Permission Denied',
        text2: 'Cannot download video without storage permission',
      });
      return;
    }

    try {
      const fileName = `${truncatedName.replace(/\s/g, '_')}.mp4`;
      const downloadPath =
        Platform.OS === 'android'
          ? `${RNFS.DownloadDirectoryPath}/${fileName}`
          : `${RNFS.DocumentDirectoryPath}/${fileName}`;

      const ret = RNFS.downloadFile({
        fromUrl: videoUrl,
        toFile: downloadPath,
      });

      const result = await ret.promise;

      if (result.statusCode === 200) {
        Toast.show({
          type: 'success',
          text1: 'Download Complete',
          text2: `Saved to ${downloadPath}`,
        });
      } else {
        throw new Error('Download failed');
      }
    } catch (err) {
      console.error('Download error:', err);
      Toast.show({
        type: 'error',
        text1: 'Download Failed',
        text2: err.message,
      });
    }
  };

  // Handle WebView messages
  const handleWebViewMessage = event => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView message:', data);

      switch (data.type) {
        case 'loaded':
          console.log('Video loaded, duration:', data.duration);
          setWebViewLoading(false);
          break;
        case 'ready':
          console.log('Video ready to play');
          break;
        case 'ended':
          console.log('Video ended');
          break;
        case 'error':
          console.error('Video error:', data.message);
          setError(data.message);
          setWebViewLoading(false);
          break;
      }
    } catch (err) {
      console.error('Error parsing WebView message:', err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.animationContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <AnimatedLottieView
          source={require('../../assets/animations/loading.json')}
          style={styles.animation}
          autoPlay
          loop
        />
        {videoStatus && videoStatus !== 'idle' && (
          <Text style={styles.statusText}>
            Video status:{' '}
            {videoStatus === 'processing' || videoStatus === 'pending'
              ? 'Processing video...'
              : videoStatus}
          </Text>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}>
          <Image
            source={require('../../assets/imgs/icons/angle-small-left.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <Text style={styles.headerText} numberOfLines={1}>
          {truncatedName}
        </Text>

        <TouchableOpacity
          onPress={recordingDelete}
          style={[
            styles.headerButton,
            {opacity: userRole === 0 || userRole === 4 ? 1 : 0.4},
          ]}
          disabled={!(userRole === 0 || userRole === 4)}>
          <Image
            source={require('../../assets/imgs/icons/delete.png')}
            style={styles.deleteIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={downloadVideo}
          style={[styles.headerButton, {opacity: videoUrl ? 1 : 0.5}]}
          disabled={!videoUrl}>
          <Image
            source={require('../../assets/imgs/icons/download.png')} // add a download icon
            style={styles.deleteIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Video Container */}
      <View style={styles.videoContainer}>
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                setIsLoading(true);
                setVideoStatus('idle');
                setWebViewLoading(true);
              }}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : videoUrl ? (
          <>
            {webViewLoading && (
              <View style={styles.webViewLoadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading video player...</Text>
              </View>
            )}
            <WebView
              ref={webViewRef}
              source={{html: generateVideoHTML(videoUrl)}}
              style={styles.webView}
              allowsFullscreenVideo={true}
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={false}
              scalesPageToFit={true}
              bounces={false}
              scrollEnabled={false}
              onMessage={handleWebViewMessage}
              onLoad={() => {
                console.log('WebView loaded');
              }}
              onError={syntheticEvent => {
                const {nativeEvent} = syntheticEvent;
                console.error('WebView error:', nativeEvent);
                setError('Failed to load video player');
                setWebViewLoading(false);
              }}
              onHttpError={syntheticEvent => {
                const {nativeEvent} = syntheticEvent;
                console.error('WebView HTTP error:', nativeEvent);
              }}
            />
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Preparing video...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  animationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  animation: {
    width: 200,
    height: 200,
  },
  statusText: {
    marginTop: 20,
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffffff',
    zIndex: 10,
  },
  headerButton: {
    padding: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    // tintColor: '#fff',
  },
  headerText: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    // color: '#fff',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  deleteIcon: {
    width: 22,
    height: 22,
    // tintColor: '#fff',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000',
  },
  webViewLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    zIndex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    marginTop: 16,
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
});

export default RecordingPage;
