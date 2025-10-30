import React from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AddCameraForm from '../../layouts/forms/addCameraForm';
import NavBar from '../../layouts/navigations/navbar';

function AddCamera() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={true} />
      <NavBar
        Content="Add New Camera"
        BackAction="Cameras"
        showThirdBtn={false}
      />
      <AddCameraForm />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
  },
});

export default AddCamera;
