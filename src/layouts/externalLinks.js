import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';

export default function ExternalLinks({onClickMethod, Content, ButtonContent}) {
  return (
    <View style={styles.authRoute}>
      <Text style={styles.externalLinkText}>{Content}</Text>
      <TouchableOpacity onPress={onClickMethod}>
        <Text style={[styles.externalLink, {fontSize: 16}]}>
          {ButtonContent}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  externalLinkText: {
    color: 'gray',
    fontSize: 15,
    marginHorizontal: 6,
  },
  authRoute: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  externalLink: {
    color: '#304FFE',
    fontWeight: 'bold',
  },
});
