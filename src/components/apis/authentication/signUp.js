import {baseURL, deviceId} from '../../utils/baseUrl';
import {loadData} from '../../auth/loadData';

export const signupApi = async (
  email,
  password,
  firstName,
  lastName,
  role_id,
) => {
  try {
    const auth = await loadData();
    const token = auth.access_token;
    const response = await fetch(baseURL + '/user/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email, password, firstName, lastName, role_id}),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    // const data = await response.json();

    const syncUser = await fetch(baseURL + '/device/sync-user', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        deviceId: deviceId,
        email: email,
      }),
    });
    const syncResponse = await syncUser.json();
    console.log(syncResponse);

    const roleUpdate = await fetch(baseURL + '/device-user/role', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        deviceId: deviceId,
        targetUserEmail: email,
        newRole: role_id,
      }),
    });

    const role = await roleUpdate.json();
    console.log(roleUpdate);
    console.log(role);

    console.log('Signup successful:', response);
    return response;
  } catch (error) {
    throw error;
  }
};
