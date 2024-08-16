import { useQuery } from "@apollo/client";
import { useEffect, useMemo } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import { GET_DASHBOARD_URL, GetDashboardURLResp } from "../../graphql";
import { useAuthContext } from "../../components/Contexts/AuthContext";
import { DashboardRoles } from "../../config/AuthRoles";
import DashboardView from "./DashboardView";

/**
 * Handles the logic for the OperationDashboard component.
 *
 * @returns {JSX.Element} The OperationDashboard component.
 */
const DashboardController = () => {
  const { user } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [searchParams] = useSearchParams({ type: "Submission" });

  const canAccessPage = useMemo<boolean>(
    () => user?.role && DashboardRoles.includes(user.role),
    [user?.role]
  );

  const { data, error, loading, refetch } = useQuery<GetDashboardURLResp>(GET_DASHBOARD_URL, {
    variables: { type: "Submission" },
    skip: !canAccessPage || !searchParams.get("type"),
    onError: (e) =>
      enqueueSnackbar(`Unable to generate the dashboard. Err: ${e}`, { variant: "error" }),
  });

  useEffect(() => {
    refetch();
  }, [searchParams.get("type")]);

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
