import React from 'react';
import {StyleSheet, StatusBar, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute} from '@react-navigation/native';
import NavBar from '../../layouts/navigations/navbar';
import RealTimeAlertForm from '../../layouts/forms/realTimeAlertForm';

function RealTimeAlertsCamera() {
  const route = useRoute();
  const camera = route.params?.camera;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={true} />
      <View 
            style = {{ backgroundColor: '#ffff', height : '100%'}} >

      <NavBar
        Content={`Real Time Alerts\n ${camera.name}`}
        BackAction="Cameras"
        showThirdBtn={false}
        goBack={true}
      />
      <RealTimeAlertForm camera_id={camera.network_id} />
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
});

export default RealTimeAlertsCamera;
