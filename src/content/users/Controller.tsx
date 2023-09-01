import React, { memo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuthContext } from '../../components/Contexts/AuthContext';
import { OrganizationProvider } from '../../components/Contexts/OrganizationListContext';
import ListView from "./ListView";
import ProfileView from "./ProfileView";

/**
 * A memoized version of OrganizationProvider
 * which caches data between ListView and ProfileView
 *
 * @see OrganizationProvider
 */
const MemorizedProvider = memo(OrganizationProvider);

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

  // Show list of users to Admin or Org Owner
  if (!userId && isAdministrative) {
    return (
      <MemorizedProvider preload>
        <ListView />
      </MemorizedProvider>
    );
  }

  // Viewing own profile or Admin/Org Owner viewing another user's profile
  return (
    <MemorizedProvider preload={isAdministrative}>
      <ProfileView _id={userId} />
    </MemorizedProvider>
  );
};
