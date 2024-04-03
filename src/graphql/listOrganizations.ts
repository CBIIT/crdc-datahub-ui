import gql from "graphql-tag";

export const query = gql`
  query listOrganizations {
    listOrganizations {
      _id
      name
      status
      conciergeName
      studies {
        studyName
        studyAbbreviation
      }
      createdAt
      updateAt
    }
  }
`;

export type Response = {
  listOrganizations: Pick<
    Organization,
    | "_id"
    | "name"
    | "status"
    | "conciergeName"
    | "studies"
    | "createdAt"
    | "updateAt"
  >[];
};
