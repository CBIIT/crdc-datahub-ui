import env from '../../env';

function loginController() {
  const NIH_AUTH_URL = process.env.NIH_AUTHENTICATION_URL || process.env.REACT_APP_NIH_AUTHENTICATION_URL;
  const NIH_CLIENT_ID = process.env.NIH_CLIENT_ID || process.env.REACT_APP_NIH_CLIENT_ID;

  const originDomain = window.location.origin;
  const urlParam = {
    client_id: `${NIH_CLIENT_ID}`,
    redirect_uri: `${originDomain}`,
    response_type: 'code',
    scope: 'openid email profile'
    // state: JSON.stringify(state || {}),
  };

  const params = new URLSearchParams(urlParam).toString();
  const redirectUrl = `${NIH_AUTH_URL}?${params}`;
  window.location.href = redirectUrl;
  return null;
}

export default loginController;
