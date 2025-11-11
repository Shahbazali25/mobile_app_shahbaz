import {StyleSheet, Text, View, ImageBackground} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import LoginFormV2 from '../../../layouts/forms/loginForm-v2';

export default function LoginV2() {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#1E293B'}}>
      <ImageBackground
        source={require('../../../assets/imgs/onboarding-bg2.png')}
        style={[styles.container, {width: '100%'}]}
        resizeMode="cover">
          
        <View
          style={{
            flex: 0.64,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            paddingHorizontal: 15,
          }}>
          <Text style={styles.heading}>
            Go ahead and sign in
          </Text>
          {/* <Text style={styles.headingText}>
            Sign in to enjoy the best managing experience
          </Text> */}
        </View>
        <LoginFormV2 />
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    // backgroundColor: 'white',
  },

  heading: {
    color: 'white',
    fontSize: 25,
    alignSelf: 'left',
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 0,
  },
  headingText: {
    alignSelf: 'left',
    color: 'gray',
    fontSize: 12,
    marginTop: 1,
    marginBottom: 30,
    color: 'lightgray',
    fontFamily: 'Poppins-Regular',
  },
});
