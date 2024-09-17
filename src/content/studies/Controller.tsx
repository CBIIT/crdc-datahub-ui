import React, { FC } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuthContext } from "../../components/Contexts/AuthContext";
import ListView from "./ListView";
import StudyView from "./StudyView";

/**
 * Renders the correct view based on the URL and permissions-tier
 *
 * @param {void} props - React props
 * @returns {FC} - React component
 */
const StudiesController: FC = () => {
  const { studyId } = useParams<{ studyId?: string }>();
  const { user } = useAuthContext();
  const isAdministrative = user?.role === "Admin";

  if (!isAdministrative) {
    return <Navigate to="/" />;
  }

  if (studyId) {
    return <StudyView _id={studyId} />;
  }

  return <ListView />;
};

export default StudiesController;
