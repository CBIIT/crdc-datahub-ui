import env from '../../utils/env';

function loginController() {
  const NIH_AUTH_URL = env.NIH_AUTHORIZE_URL || "";
  const NIH_CLIENT_ID = env.NIH_CLIENT_ID || "";
  const NIH_REDIRECT_URL = env.NIH_REDIRECT_URL || window.location.origin;
  // should shown global warnning message
  if (NIH_AUTH_URL === "" || NIH_CLIENT_ID === "") return null;

  const urlParam = {
    client_id: `${NIH_CLIENT_ID}`,
    redirect_uri: `${NIH_REDIRECT_URL}`,
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
