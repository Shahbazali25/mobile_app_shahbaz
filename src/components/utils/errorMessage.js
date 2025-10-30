import Toast from 'react-native-toast-message';

export default function errorMessage(title, detail) {
  Toast.show({
    type: 'error',
    text1: title,
    text2: detail,
  });
}
