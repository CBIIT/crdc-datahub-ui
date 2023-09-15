import gql from 'graphql-tag';

export const mutation = gql`
  mutation updateMyUser ($userInfo: UpdateUserInput!) {
    updateMyUser(userInfo: $userInfo) {
      firstName
      lastName
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
  updateMyUser: Pick<User, 'firstName' | 'lastName' | 'userStatus' | 'role' | 'organization'>;
};
