import gql from 'graphql-tag';

export const query = gql`
  query getMyUser {
    getMyUser {
      _id
      firstName
      lastName
      userStatus
      role
      IDP
      email
      organization {
        orgID
        orgName
        createdAt
        updateAt
      }
      createdAt
      updateAt
    }
  }
`;

export type Response = {
  getMyUser: User;
};
