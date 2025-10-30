import {StyleSheet, Text, TouchableOpacity} from 'react-native';

export default function PrimaryBtn({onClickMethod, Content, disable=false, opacityValue=1}) {
  return (
    <TouchableOpacity
      onPress={onClickMethod}
      icon={{
        uri: 'https://avatars0.githubusercontent.com/u/17571969?v=3&s=400',
      }}
      disabled={disable}
      >
      <Text style={[styles.button, {opacity:opacityValue}]}>{Content}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    border: 0,
    borderRadius: 25,
    backgroundColor: '#1E293B',
    paddingHorizontal: 20,
    paddingVertical: 13,
    color: 'white',
    textAlign: 'center',
    marginBottom: 25,
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
});
