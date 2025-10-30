import Toast from 'react-native-toast-message';

export default function successMessage(title, detail) {
  Toast.show({
    type: 'success',
    text1: title,
    text2: detail,
  });
}
