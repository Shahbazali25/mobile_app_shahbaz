import {baseURL} from '../../utils/baseUrl';

// Helper to parse response safely and return useful error info
const parseResponse = async response => {
  const contentType = response.headers.get('content-type') || '';
  const status = response.status;

  // Try to parse JSON when possible
  if (contentType.includes('application/json')) {
    const json = await response.json();
    return {ok: response.ok, status, body: json};
  }

  // Fallback to text for HTML/error pages (avoids JSON parse errors)
  const text = await response.text();
  return {ok: response.ok, status, body: text};
};

// Map API and HTTP status to a friendly message or throw
const handleApiStatus = parsed => {
  const httpStatus = parsed.status;
  const body = parsed.body;

  // If body is an object and contains an API-level status, prefer it
  const apiStatus =
    body && typeof body === 'object' && body.status
      ? Number(body.status)
      : null;
  const effectiveStatus = apiStatus || httpStatus;
  // Prefer a clean message from the body. If the body is HTML (starts with '<'),
  // strip tags and fall back to defaults when the result is empty or meaningless.
  const stripHtml = str =>
    String(str)
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  let messageFromBody = '';
  if (body && typeof body === 'object') {
    messageFromBody = body.message || '';
  } else if (typeof body === 'string') {
    const cleaned = stripHtml(body);
    // If cleaned text is very short or looks like a generic HTML page, ignore it.
    messageFromBody = cleaned.length > 10 ? cleaned : '';
  }

  switch (effectiveStatus) {
    case 200:
      // success
      return messageFromBody || 'Success';
    case 400:
      throw new Error(messageFromBody || 'Invalid email or validation error');
    case 404:
      throw new Error(messageFromBody || 'User not found');
    case 500:
      throw new Error(messageFromBody || 'Server error');
    default:
      if (!(httpStatus >= 200 && httpStatus < 300)) {
        throw new Error(
          messageFromBody || `Request failed with status ${httpStatus}`,
        );
      }
      return messageFromBody || '';
  }
};

// Send OTP to email
export const sendForgetPasswordOTP = async email => {
  try {
    console.log('Sending OTP to thisiiiiiisss email:', email);
    // This endpoint expects a GET. Send the email as a query parameter.
    // Do NOT send a body with GET requests — many servers/proxies reject it.
    const url = `${baseURL}/verify/forgot-password?email=${encodeURIComponent(
      email,
    )}`;
    const response = await fetch(url, {
      method: 'GET',
    });
    console.log('Response received for sendForgetPasswordOTP:', response);

    const parsed = await parseResponse(response);
    // interpret API-level or HTTP status and throw friendly errors when needed
    handleApiStatus(parsed);
    console.log('OTP sent successfully:', parsed.body);
    return parsed.body;
  } catch (error) {
    console.log('sendForgetPasswordOTP error:', error);
    throw error;
  }
};

// Verify OTP code
export const verifyResetCode = async (email, code) => {
  try {
    console.log(
      '\n\n\n****\nVerifying reset code for email:',
      email,
      'with code:',
      code,
    );
    const response = await fetch(`${baseURL}/verify/verify-reset-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email, code}),
    });

    const parsed = await parseResponse(response);
    handleApiStatus(parsed);
    return parsed.body;
  } catch (error) {
    console.log('verifyResetCode error:', error);
    throw error;
  }
};

// Resend OTP
export const resendVerificationEmail = async email => {
  try {
    console.log(
      '\n\n\n****\nResending verification email (via forgot-password) to:',
      email,
    );
    // Use the same forgot-password endpoint to resend the OTP. This keeps
    // behavior consistent and avoids relying on a separate resend endpoint.
    const result = await sendForgetPasswordOTP(email);
    return result;
  } catch (error) {
    console.log('resendVerificationEmail error:', error);
    throw error;
  }
};

// Reset password with new password
export const resetPassword = async (email, code, newPassword) => {
  try {
    const response = await fetch(`${baseURL}/verify/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        code,
        new_password: newPassword,
      }),
    });

    const parsed = await parseResponse(response);
    handleApiStatus(parsed);
    return parsed.body;
  } catch (error) {
    console.log('resetPassword error:', error);
    throw error;
  }
};
