import React, { FC } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Status, useAuthContext } from "../../components/Contexts/AuthContext";
import ListView from "./ListView";
import StudyView from "./StudyView";
import SuspenseLoader from "../../components/SuspenseLoader";
import { hasPermission } from "../../config/AuthPermissions";

/**
 * Renders the correct view based on the URL and permissions-tier
 *
 * @param {void} props - React props
 * @returns {FC} - React component
 */
const StudiesController: FC = () => {
  const { studyId } = useParams<{ studyId?: string }>();
  const { user, status: authStatus } = useAuthContext();
  const isAdministrative = hasPermission(user, "study", "manage");

  if (authStatus === Status.LOADING) {
    return <SuspenseLoader data-testid="studies-suspense-loader" />;
  }

  if (!isAdministrative) {
    return <Navigate to="/" />;
  }

  if (studyId) {
    return <StudyView _id={studyId} />;
  }

  return <ListView />;
};

export default StudiesController;
