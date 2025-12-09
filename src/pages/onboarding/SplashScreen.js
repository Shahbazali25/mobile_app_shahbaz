import {StyleSheet, Text, Image, View, ImageBackground} from 'react-native';
import PrimaryBtn from '../../layouts/buttons/primaryBtn';

export default function SplashScreen({navigation}) {
  const handleGetStarted = () => {
    navigation.navigate('Login');
  };
  return (
    <ImageBackground
      source={require('../../assets/imgs/onboarding-bg2.png')}
      style={[styles.container, {width: '100%'}]}
      resizeMode="cover">
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/imgs/logos/main-logo.png')}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.text}>Your Smart Surveillance Companion</Text>
      </View>
      <View style={styles.buttonContainer}>
        <PrimaryBtn onClickMethod={handleGetStarted} Content={'Get Started'} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
    marginTop: -80,
  },
  imageContainer: {
    justifyContent: 'center',
  },
  image: {
    width: 250,
    height: 250,
  },
  buttonContainer: {
    alignSelf: 'stretch',
    marginHorizontal: 30,
    marginBottom: 20,
  },
});
