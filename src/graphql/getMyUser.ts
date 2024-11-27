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
      # TODO: Request the study fields from the server
      studies
      createdAt
      updateAt
    }
  }
`;

export type Response = {
  getMyUser: User;
};
