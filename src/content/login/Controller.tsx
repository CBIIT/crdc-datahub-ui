function loginController() {
  const originDomain = window.location.origin;
  const urlParam = {
    client_id: process.env.REACT_APP_NIH_CLIENT_ID,
    redirect_uri: `${originDomain}`,
    response_type: 'code',
    scope: 'openid email profile',
    // state: JSON.stringify(state || {}),
  };

  const params = new URLSearchParams(urlParam).toString();
  const redirectUrl = `${process.env.REACT_APP_NIH_AUTH_URL}?${params}`;
  window.location.href = redirectUrl;

  return null;
}

export default loginController;
