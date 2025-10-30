import React from 'react';
import {View, TouchableOpacity, Image, Text} from 'react-native';
import {styles} from '../../components/styles/styles';

function FloatingBtn({screen, setScreen, bottomOffset = 80}) {
  const changeType = (currentScreen, setScreenFunc) => {
    if (currentScreen === 'Solar') {
      setScreenFunc('Surveillance');
    } else {
      setScreenFunc('Solar');
    }
  };

  return (
    <View style={[styles.fixedButtonContainer, {bottom: bottomOffset}]}>
      <TouchableOpacity
        style={styles.fixedButton}
        onPress={() => changeType(screen, setScreen)}>
        <Image
          source={
            screen === 'Solar'
              ? require('../../assets/imgs/icons/camera.png')
              : require('../../assets/imgs/icons/float-sun.png')
          }
          style={styles.fixedButtonImage}
        />
        {/* make sure that the text should showing in one line like min-width */}
        <Text
          style={{
            fontFamily: 'Poppins-Regular',
            color: 'white',
            marginVertical: 2,
            fontSize: 10.5,
            minWidth: 45,
            textAlign: 'center',
          }}>
          {screen === 'Solar' ? 'Camera' : 'Solar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default FloatingBtn;
