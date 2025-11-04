import React from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import NavBar from '../../layouts/navigations/navbar';
import AssignZone from '../../layouts/forms/assignZone';
import {useRoute} from '@react-navigation/native';

function AssignSensorZone() {
  const route = useRoute();

  const sensorId = route.params.sensorId;
  console.log(sensorId);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={true} />
      <NavBar
        Content="Assign Zone"
        BackAction="SensorSetup"
        showThirdBtn={false}
      />
      <AssignZone sensorId={sensorId} />
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

export default AssignSensorZone;
