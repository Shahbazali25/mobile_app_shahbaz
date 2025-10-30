import {baseURL, deviceId} from '../../../utils/baseUrl';
import {loadData} from '../../../auth/loadData';

export const saveROI = async (
  camera_id,
  rois,
  sensitivity = 1000,
  blur = 20,
  morphology = 20,
) => {
  try {
    const auth = await loadData();
    const token = auth.access_token;

    if (!token) {
      throw new Error('❌ Unauthorized: No token found');
    }
    const requestBody = {
      rois: rois || [[0, 0, [0, 0], 0, 0]],
      sensitivity: sensitivity,
      blur: blur,
      morphology: morphology,
    };

    console.log(requestBody);

    const response = await fetch(
      baseURL + `/device-detection/config/${deviceId}/${camera_id}`,
      {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      },
    );

    const status = await response.json();
    console.log(status);

    // if (!status.data.status === 200) {
    //   throw new Error('Invalid API response: Expected rois to save');
    // }

    // return status.data.status;
  } catch (error) {
    console.log('ROI SAVING ERROR:', String(error));
    throw error;
  }
};
