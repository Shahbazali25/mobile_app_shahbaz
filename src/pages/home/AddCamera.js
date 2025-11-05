import React from 'react';
import {StyleSheet, StatusBar, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AddCameraForm from '../../layouts/forms/addCameraForm';
import NavBar from '../../layouts/navigations/navbar';

function AddCamera() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent={true}
        backgroundColor="#1E293B"
        barStyle="light-content"
      />
      <View style={styles.navbarContainer}>
        <NavBar
          Content="Add New Camera"
          BackAction="Cameras"
          showThirdBtn={false}
          textStyle={{color: '#fff'}}
        />
      </View>
      <AddCameraForm />
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

export default AddCamera;
