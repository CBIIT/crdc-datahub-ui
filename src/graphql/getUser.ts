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
      # TODO: Request the study fields from the server
      studies
    }
  }
`;

export type Input = {
  userID: string;
};

export type Response = {
  getUser: User;
};
