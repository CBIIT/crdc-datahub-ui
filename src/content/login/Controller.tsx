import env from '../../env';

function loginController() {
  const NIH_AUTH_URL = env.NIH_AUTH_URL || 'https://stsstg.nih.gov/auth/oauth/v2/authorize';
  const NIH_CLIENT_ID = env.NIH_CLIENT_ID || "ThisIsASecret";

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
  // window.location.href = redirectUrl;
  console.log(redirectUrl);
  return null;
}

export default loginController;
