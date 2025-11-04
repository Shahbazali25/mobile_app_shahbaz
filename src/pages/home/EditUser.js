import React from 'react';
import {StyleSheet, StatusBar} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import NavBar from '../../layouts/navigations/navbar';
import EditUserForm from '../../layouts/forms/editUserForm';

function EditUser() {
  const route = useRoute();
  const user_id = route.params?.user_id;
  const cloud_id = route.params?.cloud_id;
  console.log(user_id, cloud_id);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={true} />
      <NavBar
        Content={`Edit Profile`}
        BackAction="AccountManagement"
        showThirdBtn={false}
      />
      <EditUserForm user_id={user_id} cloud_id={cloud_id} />
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

export default EditUser;
