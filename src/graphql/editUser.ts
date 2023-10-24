import gql from 'graphql-tag';

export const mutation = gql`
  mutation editUser($userID: String, $organization: String, $status: String, $role: String) {
    editUser(userID: $userID, organization: $organization, status: $status, role: $role) {
      userStatus
      role
      organization {
        orgID
        orgName
        createdAt
        updateAt
      }
    }
  }
`;

export type Response = {
  editUser: Pick<User, 'userStatus' | 'role' | 'organization'>;
};
