import React from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import NavBar from '../../layouts/navigations/navbar';
import AddCameraZoneForm from '../../layouts/forms/addCameraZoneForm';

function AddCameraZone() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={true} />
      <NavBar
        Content="Add Zone"
        BackAction="ZonesConfiguration"
        showThirdBtn={false}
      />
      <AddCameraZoneForm />
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

export default AddCameraZone;
