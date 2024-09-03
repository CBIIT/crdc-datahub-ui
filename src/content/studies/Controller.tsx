import React, { FC } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuthContext } from "../../components/Contexts/AuthContext";
import { ApprovedStudiesProvider } from "../../components/Contexts/ApprovedStudiesListContext";
import ListView from "./ListView";
// import OrganizationView from "./OrganizationView";

/**
 * Renders the correct view based on the URL and permissions-tier
 *
 * @param {void} props - React props
 * @returns {FC} - React component
 */
const OrganizationController: FC = () => {
  const { studyId } = useParams<{ studyId?: string }>();
  const { user } = useAuthContext();
  const isAdministrative = user?.role === "Admin";

  if (!isAdministrative) {
    return <Navigate to="/" />;
  }

  if (studyId) {
    return null; // TODO:  <OrganizationView _id={studyId} />;
  }

  return (
    <ApprovedStudiesProvider preload>
      <ListView />
    </ApprovedStudiesProvider>
  );
};

export default OrganizationController;
