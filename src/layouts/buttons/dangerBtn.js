import {StyleSheet, Text, TouchableOpacity} from 'react-native';

export default function DangerBtn({onClickMethod, Content}) {
  return (
    <TouchableOpacity
      onPress={onClickMethod}
      icon={{
        uri: 'https://avatars0.githubusercontent.com/u/17571969?v=3&s=400',
      }}>
      <Text style={styles.button}>{Content}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    border: 0,
    borderRadius: 25,
    backgroundColor: '#DC3545',
    paddingHorizontal: 20,
    paddingVertical: 12,
    color: 'white',
    textAlign: 'center',
    marginBottom: 25,
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
});
