import { useLocation } from 'react-router-dom';
import env from '../../env';
import usePageTitle from '../../hooks/usePageTitle';

/**
 * Redirects to NIH login to get an authorization code
 *
 * @returns null
 */
const loginController = () => {
  usePageTitle("Login");

  const { state } = useLocation();
  const redirectURLOnLoginSuccess = state && state.redirectURLOnLoginSuccess ? state.redirectURLOnLoginSuccess : null;
  const urlParam = {
    client_id: env.REACT_APP_NIH_CLIENT_ID,
    redirect_uri: env.REACT_APP_NIH_REDIRECT_URL,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'login',
  };

  if (redirectURLOnLoginSuccess !== null) {
    urlParam["state"] = redirectURLOnLoginSuccess;
  }

  const params = new URLSearchParams(urlParam).toString();
  window.location.href = `${env.REACT_APP_NIH_AUTHORIZE_URL}?${params}`;

  return null;
};

export default loginController;
