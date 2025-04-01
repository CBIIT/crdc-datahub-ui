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
 * @returns The StudiesController component
 */
const StudiesController: FC = () => {
  const { studyId } = useParams<{ studyId?: string }>();
  const { user, status: authStatus } = useAuthContext();

  if (authStatus === Status.LOADING) {
    return <SuspenseLoader data-testid="studies-suspense-loader" />;
  }

  if (!hasPermission(user, "study", "manage")) {
    return <Navigate to="/" />;
  }

  return studyId ? <StudyView _id={studyId} /> : <ListView />;
};

export default StudiesController;
