import { useQuery } from "@apollo/client";
import { useMemo } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { GET_DASHBOARD_URL, GetDashboardURLInput, GetDashboardURLResp } from "../../graphql";
import { Status, useAuthContext } from "../../components/Contexts/AuthContext";
import SuspenseLoader from "../../components/SuspenseLoader";
import { DashboardRoles } from "../../config/AuthRoles";
import DashboardView from "./DashboardView";

/**
 * Handles the logic for the OperationDashboard component.
 *
 * @returns {JSX.Element} The OperationDashboard component.
 */
const DashboardController = () => {
  const { user, status: authStatus } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams] = useSearchParams({ type: "Submission" });

  const canAccessPage = useMemo<boolean>(
    () => authStatus === Status.LOADED && user?.role && DashboardRoles.includes(user.role),
    [authStatus, user?.role]
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
      fetchPolicy: "cache-and-network",
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
