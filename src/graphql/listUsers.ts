import gql from "graphql-tag";

export const query = gql`
  query listUsers {
    listUsers {
      _id
      firstName
      lastName
      IDP
      email
      organization {
        orgID
        orgName
      }
      userStatus
      role
    }
  }
`;

export type Response = {
  listUsers: User[];
};
