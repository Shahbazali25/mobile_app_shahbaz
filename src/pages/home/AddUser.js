import React from 'react';
import {StyleSheet,  View, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import NavBar from '../../layouts/navigations/navbar';
import AddUserForm from '../../layouts/forms/addUserForm';

function AddUser() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar translucent={true} />
      <View style={styles.headerContainer}>
        <NavBar
          Content="Add New User"
          BackAction="AccountManagement"
          showThirdBtn={false}
          // textStyle={{color: '#fff'}}
        />
        <AddUserForm />

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

export default AddUser;
