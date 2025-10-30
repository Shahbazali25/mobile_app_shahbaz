import React from 'react';
import {View, TouchableOpacity, Image, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import shortenName from '../../components/utils/shortenName';

function NavBar({Content, BackAction, showThirdBtn, ThirdBtnFunction, goBack}) {
  const navigation = useNavigation();

  return (
    <View
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 15,
      }}>
      <TouchableOpacity
        onPress={() =>
          goBack ? navigation.goBack() : navigation.navigate(BackAction)
        }>
        <Image
          source={require('../../assets/imgs/icons/angle-small-left.png')}
          style={{width: 28, height: 28}}
        />
      </TouchableOpacity>
      <Text style={{fontSize: 20, fontFamily: 'Poppins-Medium'}}>
        {shortenName(30,Content, 'Unknown Camera')}
      </Text>
      {showThirdBtn && showThirdBtn ? (
        <TouchableOpacity onPress={() => navigation.navigate('AddCamera')}>
          <Image
            source={require('../../assets/imgs/icons/add.png')}
            style={{width: 26, height: 26}}
          />
        </TouchableOpacity>
      ) : (
        <View></View>
      )}
    </View>
  );
}

export default NavBar;
