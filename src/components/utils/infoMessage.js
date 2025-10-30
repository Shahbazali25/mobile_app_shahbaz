import Toast from 'react-native-toast-message';

export default function infoMessage(title, detail) {
  Toast.show({
    type: 'info',
    text1: title,
    text2: detail,
  });
}
