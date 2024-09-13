import gql from "graphql-tag";

export const query = gql`
  query listActiveCurators {
    listActiveCurators {
      userID
      firstName
      lastName
      createdAt
      updateAt
    }
  }
`;

export type Response = {
  listActiveCurators: (Pick<User, "firstName" | "lastName" | "createdAt" | "updateAt"> & {
    userID: User["_id"];
  })[];
};
