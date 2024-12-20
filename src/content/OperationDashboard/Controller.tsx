import { useQuery } from "@apollo/client";
import { useMemo } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { GET_DASHBOARD_URL, GetDashboardURLInput, GetDashboardURLResp } from "../../graphql";
import usePageTitle from "../../hooks/usePageTitle";
import { Status, useAuthContext } from "../../components/Contexts/AuthContext";
import SuspenseLoader from "../../components/SuspenseLoader";
import DashboardView from "./DashboardView";
import { hasPermission } from "../../config/AuthPermissions";

/**
 * Handles the logic for the OperationDashboard component.
 *
 * @returns {JSX.Element} The OperationDashboard component.
 */
const DashboardController = () => {
  usePageTitle("Operation Dashboard");

  const { user, status: authStatus } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams] = useSearchParams({ type: "Submission" });

  const canAccessPage = useMemo<boolean>(
    () => authStatus === Status.LOADED && hasPermission(user, "dashboard", "view"),
    [authStatus, user]
  );

  const { data, error, loading } = useQuery<GetDashboardURLResp, GetDashboardURLInput>(
    GET_DASHBOARD_URL,
    {
      variables: { type: searchParams.get("type") },
      skip: !canAccessPage || !searchParams.get("type"),
      onError: (e) =>
        enqueueSnackbar(e?.message, {
          variant: "error",
        }),
      fetchPolicy: "no-cache",
    }
  );

  if (authStatus === Status.LOADING) {
    return <SuspenseLoader />;
  }

  if (!canAccessPage) {
    return <Navigate to="/" />;
  }

  return (
    <DashboardView
      loading={loading}
      url={!error && data?.getDashboardURL ? data?.getDashboardURL?.url : null}
      currentType={searchParams.get("type")}
    />
  );
};

export default DashboardController;
