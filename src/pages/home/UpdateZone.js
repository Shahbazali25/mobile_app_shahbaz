import React from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import NavBar from '../../layouts/navigations/navbar';
import {useRoute} from '@react-navigation/native';
import UpdateZoneForm from '../../layouts/forms/updateZoneForm';

function UpdateZone() {
  const route = useRoute();
  const zoneId = route.params.zoneId;
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={true} />
      <NavBar
        Content="Update Zone"
        BackAction="ZonesConfiguration"
        showThirdBtn={false}
      />
      <UpdateZoneForm zoneId={zoneId} />
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

export default UpdateZone;
