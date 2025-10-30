import {baseURL, deviceId} from '../../../utils/baseUrl';
import {loadData} from '../../../auth/loadData';

export const getLastFrame = async camera_id => {
  try {
    const auth = await loadData();
    const token = auth.access_token;
    if (!token) {
      throw new Error('❌ Unauthorized: No token found');
    }

    const response = await fetch(
      baseURL + `/device-detection/frame/${deviceId}/${camera_id}?format=image`,
      {
        method: 'GET',
        headers: {
          Accept: 'image/*',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const base64 = `data:image/jpeg;base64,${arrayBufferToBase64(arrayBuffer)}`;
    return base64;
  } catch (error) {
    console.log('IMAGE FETCHING ERROR:', String(error));
    throw error;
  }
};

// Helper function to convert ArrayBuffer to Base64
const arrayBufferToBase64 = buffer => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};
