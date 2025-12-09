import React from 'react';
import {StyleSheet, StatusBar, View} from 'react-native';
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
      <View style={styles.headerContainer}>

        <NavBar
          Content="Update Zone"
          BackAction="ZonesConfiguration"
          showThirdBtn={false}
          // textStyle={{color: '#fff'}} // 👈 White text for this screen only
        />
        <UpdateZoneForm zoneId={zoneId} />
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

export default UpdateZone;
