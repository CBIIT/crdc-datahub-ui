import gql from 'graphql-tag';

export const query = gql`
  query getUser($userID: ID!) {
    getUser(userID : $userID) {
      _id
      firstName
      lastName
      userStatus
      role
      IDP
      email
      createdAt
      updateAt
      organization {
        orgID
        orgName
      }
    }
  }
`;

export type Response = {
  getUser: User;
};
