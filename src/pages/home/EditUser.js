import React from 'react';
import {StyleSheet, View, StatusBar} from 'react-native';
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
      <View style={styles.headerContainer}>
        <NavBar
          Content={`Edit Profile`}
          BackAction="AccountManagement"
          showThirdBtn={false}
        />
        <EditUserForm user_id={user_id} cloud_id={cloud_id} />
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

export default EditUser;
