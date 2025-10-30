import React from 'react';
import {View, StyleSheet, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute} from '@react-navigation/native';
import NavBar from '../../layouts/navigations/navbar';
import {VLCPlayer} from 'react-native-vlc-media-player';

function FullViewStream() {
  const route = useRoute();
  const stream_link = route.params?.stream_link;
  const camera_name = route.params?.camera_name;
  console.log(stream_link, camera_name);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#FFFFFF'}}>
      <StatusBar translucent={true} backgroundColor="black" />
      <View style={styles.container}>
        <NavBar
          Content={camera_name+" Live Streaming"}
          BackAction="Cameras"
          showThirdBtn={false}
          goBack={true}
        />

        <View style={styles.videoContainer}>
          <VLCPlayer
            source={{uri: stream_link}}
            style={styles.videoPlayer}
            autoPlay={true}
            muted={true}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
