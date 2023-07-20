import env from '../../env';

/**
 * Redirects to NIH login to get an authorization code
 *
 * @returns null
 */
const loginController = () => {
  const NIH_AUTHORIZE_URL = env.REACT_APP_NIH_AUTHORIZE_URL || env.NIH_AUTHORIZE_URL;
  const NIH_CLIENT_ID = env.REACT_APP_NIH_CLIENT_ID || env.NIH_CLIENT_ID;
  const NIH_REDIRECT_URL = env.REACT_APP_NIH_REDIRECT_URL || env.NIH_REDIRECT_URL;

  const urlParam = {
    client_id: `${NIH_CLIENT_ID}`,
    redirect_uri: `${NIH_REDIRECT_URL}`,
    response_type: 'code',
    scope: 'openid email profile'
  };

  const params = new URLSearchParams(urlParam).toString();
  const redirectUrl = `${NIH_AUTHORIZE_URL}?${params}`;
  window.location.href = redirectUrl;

  return null;
};

export default loginController;
