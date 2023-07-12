const AUTH_SERVICE_URL = `${window.origin}/api/authn`;

/**
 * Checks login status with AuthN
 */
export const isLoggedIn = () => {
  fetch(`${AUTH_SERVICE_URL}/authenticated`, {
    method: 'POST',
  })
  .then((response) => response.json())
  .then((result) => {
    const {
      status,
    } = result;

    console.log('Is logged in:', status);

    return status === true;
  })
  .catch((error) => console.log('Error', error));

  return false;
};

/**
 * Logs in to AuthN
 *
 * @param {string} authCode Authorization code used to verify login
 */
export const logIn = (authCode) => {
  const myHeaders = new Headers();
  const raw = JSON.stringify({
    code: authCode,
    IDP: 'nih',
  });
  const requestRedirect:RequestRedirect = 'follow';
  const requestCredentials:RequestCredentials = 'include';

  myHeaders.append('Content-Type', 'application/json');

  const requestOptions = {
    body: raw,
    credentials: requestCredentials,
    headers: myHeaders,
    method: 'POST',
    redirect: requestRedirect,
    withCredentials: true,
  };

  fetch(`${AUTH_SERVICE_URL}/login`, requestOptions)
  .then((response) => response.json())
  .then((result) => console.log('Login results:', result))
  .then(() => isLoggedIn())
  .catch((error) => console.log('error', error));
};
