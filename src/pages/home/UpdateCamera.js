import React from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute} from '@react-navigation/native';
import NavBar from '../../layouts/navigations/navbar';
import UpdateCameraForm from '../../layouts/forms/updateCameraForm';

function UpdateCamera() {
  const route = useRoute();
  const camera_id = route.params?.camera_id;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={true} />
      <NavBar
        Content="Update Camera"
        BackAction="Cameras"
        showThirdBtn={true}
        goBack={true}
                  textStyle={{color: '#fff'}} // 👈 make heading text white

      />
      <UpdateCameraForm camera_id={camera_id} />
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

export default UpdateCamera;
