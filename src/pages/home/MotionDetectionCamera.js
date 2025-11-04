import React from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute} from '@react-navigation/native';
import NavBar from '../../layouts/navigations/navbar';
import MotionDetectionForm from '../../layouts/forms/motionDetectionForm';

function MotionDetectionCamera() {
  const route = useRoute();
  const camera_id = route.params?.camera_id;
  const stream_link = route.params?.stream_link;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={true} />
      <NavBar
        Content="Motion Detection"
        BackAction="Cameras"
        showThirdBtn={false}
        goBack={true}
      />
      <MotionDetectionForm camera_id={camera_id} stream_link={stream_link} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#1E293B',
  },
});

export default MotionDetectionCamera;
