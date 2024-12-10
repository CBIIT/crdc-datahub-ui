import gql from "graphql-tag";

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
      dataCommons
      organization {
        orgID
        orgName
        status
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
