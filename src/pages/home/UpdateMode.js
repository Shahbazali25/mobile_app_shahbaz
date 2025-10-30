import React from 'react';
import {StyleSheet, StatusBar} from 'react-native';
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
      <NavBar
        Content={`Update ${modeName} Mode`}
        BackAction="ModesConfiguration"
        showThirdBtn={false}
      />
      <UpdateModeForm modeId={modeId} />
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

export default UpdateMode;
