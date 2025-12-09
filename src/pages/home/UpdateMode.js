import React from 'react';
import {StyleSheet,  View, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import NavBar from '../../layouts/navigations/navbar';
import {useRoute} from '@react-navigation/native';
import UpdateZoneForm from '../../layouts/forms/updateZoneForm';
import UpdateModeForm from '../../layouts/forms/updateModeForm';

function UpdateMode() {
  const route = useRoute();
  const modeId = route.params.modeId;
  const modeName = route.params.name;
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={true} />
       <View style={styles.headerContainer}>
        <NavBar
          Content={`Update ${modeName} Mode`}
          BackAction="ModesConfiguration"
          showThirdBtn={false}
          // textStyle={{color: '#fff'}}
        />

      <UpdateModeForm modeId={modeId} />
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
    height: '100%'
  },
});

export default UpdateMode;
