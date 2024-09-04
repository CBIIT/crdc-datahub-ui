import gql from "graphql-tag";

export const query = gql`
  query getUser($userID: ID!) {
    getUser(userID: $userID) {
      _id
      firstName
      lastName
      userStatus
      role
      IDP
      email
      createdAt
      updateAt
      dataCommons
      studies
      organization {
        orgID
        orgName
        createdAt
        updateAt
      }
    }
  }
`;

export type Input = {
  userID: string;
};

export type Response = {
  getUser: User;
};
