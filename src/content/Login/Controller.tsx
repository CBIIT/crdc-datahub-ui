import { useLocation } from "react-router-dom";
import env from "../../env";
import usePageTitle from "../../hooks/usePageTitle";
import SuspenseLoader from "../../components/SuspenseLoader";

/**
 * Handles the NIH SSO redirect to the login page.
 *
 * @returns The LoginController component
 */
const LoginController = () => {
  usePageTitle("Login");

  const { state } = useLocation();

  const params = new URLSearchParams({
    client_id: env.REACT_APP_NIH_CLIENT_ID,
    redirect_uri: env.REACT_APP_NIH_REDIRECT_URL,
    response_type: "code",
    scope: "openid email profile",
    prompt: "login",
  });

  if (typeof state?.redirectState === "string" && !!state.redirectState) {
    params.append("state", state.redirectState);
  }

  window.location.href = `${env.REACT_APP_NIH_AUTHORIZE_URL}?${params?.toString()}`;

  return <SuspenseLoader data-testid="login-flow-loader" fullscreen />;
};

export default LoginController;
