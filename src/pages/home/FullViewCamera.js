import React from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute} from '@react-navigation/native';
import NavBar from '../../layouts/navigations/navbar';
import {VLCPlayer} from 'react-native-vlc-media-player';
import WebrtcWebView from '../../components/WebrtcWebView';



function FullViewStream() {
  const route = useRoute();
  const stream_link = route.params?.stream_link;
  const camera_name = route.params?.camera_name;
  console.log(stream_link, camera_name);


  let rtcUrl = stream_link
    ?.replace('port/8888', 'rtc')
    .replace('/index.m3u8', '/');
  console.log('RTC URL:', rtcUrl);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#1E293B'}}>
      <StatusBar translucent={true} backgroundColor="black" />
      <View style={styles.container}>
        <NavBar
          Content={camera_name + ' Live Streaming'}
          BackAction="Cameras"
          showThirdBtn={false}
          goBack={true}
        />

        <View style={styles.videoContainer}>
          <WebrtcWebView
                  rtcUrl={rtcUrl}
                  height={'100%'}
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
          /> */}
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
  videoContainer: {
    flex: 1,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
});

export default FullViewStream;
