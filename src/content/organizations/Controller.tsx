import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuthContext } from "../../components/Contexts/AuthContext";
import { OrganizationProvider } from "../../components/Contexts/OrganizationListContext";
import ListView from "./ListView";
import OrganizationView from "./OrganizationView";

/**
 * Renders the correct view based on the URL and permissions-tier
 *
 * @param {void} props - React props
 * @returns {FC} - React component
 */
export default () => {
  const { orgId } = useParams<{ orgId?: string }>();
  const { user } = useAuthContext();
  const isAdministrative = user?.role === "Admin";

  if (!isAdministrative) {
    return <Navigate to="/" />;
  }

  if (orgId) {
    return <OrganizationView _id={orgId} />;
  }

  return (
    <OrganizationProvider preload>
      <ListView />
    </OrganizationProvider>
  );
};
