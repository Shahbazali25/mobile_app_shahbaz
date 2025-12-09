import React from 'react';
import {StyleSheet, StatusBar, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useRoute} from '@react-navigation/native';
import NavBar from '../../layouts/navigations/navbar';
import UpdateSensorForm from '../../layouts/forms/updateSensorForm';

function UpdateSensor() {
  const route = useRoute();
  const sensorId = route.params?.sensorId;
  const name = route.params?.name;
  const description = route.params?.description;
  const unit = route.params?.unit;
  const zoneId = route.params?.zoneId;
  const mqttTopic = route.params?.mqttTopic;
  const mqttHost = route.params?.mqttHost;
  const mqttPort = route.params?.mqttPort;
  const threshold = route.params?.threshold;
  const type = route.params?.type;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={true} />
      <View style={styles.headerContainer}>
        <NavBar
          Content="Update Sensor"
          BackAction="SensorSetup"
          showThirdBtn={false}
          // textStyle={{color: '#fff'}} // 👈 White text for this screen only
        />
        <UpdateSensorForm
          sensorId={sensorId}
          name={name}
          description={description}
          unit={unit}
          mqttTopic={mqttTopic}
          mqttHost={mqttHost}
          mqttPort={mqttPort}
          threshold={threshold}
          type={type}
          zoneId={zoneId}
        />
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

export default UpdateSensor;
