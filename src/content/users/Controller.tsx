import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuthContext } from '../../components/Contexts/AuthContext';
import ProfileView from "./ProfileView";

/**
 * Renders the correct view based on the URL and permissions-tier
 *
 * @param {void} props - React props
 * @returns {FC} - React component
 */
export default () => {
  const { userId } = useParams();
  const { user: { _id, role } } = useAuthContext();
  const isAdministrative = role === "Admin" || role === "ORG_OWNER";

  // Non-admin users can only view their own profile, redirect to it
  if (userId !== _id && !isAdministrative) {
    return <Navigate to={`/users/${_id}`} />;
  }

  // Viewing own profile or Admin/Org Owner viewing another user's profile
  return <ProfileView _id={userId} />;
};
