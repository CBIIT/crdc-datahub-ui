import React from 'react';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../../components/Contexts/AuthContext';
import UserProfileView from './UserProfileView';

/**
 * Render the correct view based on the URL
 *
 * @param {void}
 * @returns {FC} - React component
 */
export default () => {
  const { appId, section } = useParams();
  const authData = useAuthContext();
  const isLoggedIn = authData?.isLoggedIn;
  const user = authData?.user;

  // No user info to show if there's no user
  if (!isLoggedIn) {
    return (
      <UserProfileView user={user} />
    );
  }

  return (
    <>
    </>
  );
};
