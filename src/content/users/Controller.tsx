import React, { memo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useAuthContext } from "../../components/Contexts/AuthContext";
import { OrganizationProvider } from "../../components/Contexts/OrganizationListContext";
import ListView from "./ListView";
import ProfileView from "./ProfileView";
import { CanManageUsers } from "../../config/AuthRoles";

type Props = {
  type: "users" | "profile";
};

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
 * Implementation details:
 *
 * There are two types `ProfileView` "views": `users` and `profile`,
 * and based on the view type, the authenticated user will see slightly different content.
 *
 *   - `users` aka Edit User view:
 *     - allows editing `Role`, `Status`, and `Organization` for Admins,
 *       but allows Org Owners to only see that profile.
 *   - `profile` aka User Profile view:
 *     - is only shown to the authenticated user, and allows editing
 *       of `First Name` and `Last Name` only
 *
 * Most of the underlying logic is the same, hence the combination of
 * these two views into a single component. There's also a `ListView`
 * which is shown to Admins and Org Owners, and allows them to see
 * the list of users.
 *
 * @param {Props} props - React props
 * @returns {FC} - React component
 */
const UserController = ({ type }: Props) => {
  const { userId } = useParams();
  const { user } = useAuthContext();
  const { _id, role } = user || {};
  const isAdministrative = role && CanManageUsers.includes(role);

  // Accounts can only view their own "profile", redirect to it
  if ((type === "profile" && userId !== _id) || (type === "users" && !isAdministrative)) {
    return <Navigate to={`/profile/${_id}`} />;
  }

  // Show list of users to Admin or Org Owner
  if (!userId && isAdministrative) {
    return (
      <MemorizedProvider preload>
        <ListView />
      </MemorizedProvider>
    );
  }

  // Admin or Org Owner viewing a user's "Edit User" page or their own "Edit User" page
  return (
    <MemorizedProvider preload={isAdministrative && type === "users"}>
      <ProfileView _id={userId} viewType={type} />
    </MemorizedProvider>
  );
};

export default UserController;
