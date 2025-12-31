import React from 'react';
import {StyleSheet, View, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute} from '@react-navigation/native';
import NavBar from '../../layouts/navigations/navbar';
import AssignZoneToSensor from '../../layouts/forms/assignZoneToSensor';

function AssignCameraZone() {
  const route = useRoute();
  const cameraId = route.params.cameraId;
  console.log(cameraId);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={true} />
      <View style={styles.headerContainer}>

      <NavBar Content="Assign Zone" BackAction="Cameras" showThirdBtn={false} />
      <AssignZoneToSensor cameraId={cameraId} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#1E293B',
  },

   headerContainer: {
    backgroundColor: 'white',
    height: '100%',
  },
});

export default AssignCameraZone;
