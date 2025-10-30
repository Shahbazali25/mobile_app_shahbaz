import React from 'react';
import {View, TouchableOpacity, Image} from 'react-native';
import {styles} from '../../components/styles/styles';
import {changeScreen} from '../../components/navigation/changeScreen';

function LayoutToggleBtn({screen, setScreen}) {
  return (
    <View style={styles.fixedButtonLayoutContainer}>
      <TouchableOpacity
        style={styles.fixedButton}
        onPress={() => changeScreen(screen, setScreen)}>
        <Image
          source={
            screen === 'grid'
              ? require('../../assets/imgs/icons/dropdown-bar.png')
              : require('../../assets/imgs/icons/objects-column.png')
          }
          style={styles.fixedButtonImage}
        />
      </TouchableOpacity>
    </View>
  );
}

export default LayoutToggleBtn;
