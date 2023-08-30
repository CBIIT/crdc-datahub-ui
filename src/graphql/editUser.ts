import gql from 'graphql-tag';

export const mutation = gql`
  mutation editUser($userID: String, $organization: String, $status: String, $role: String) {
    editUser(userID: $userID, organization: $organization, status: $status, role: $role) {
      _id
      firstName
      lastName
      userStatus
      role
      organization {
        orgID
        orgName
      }
    }
  }
`;

export type Response = {
  editUser: User;
};
