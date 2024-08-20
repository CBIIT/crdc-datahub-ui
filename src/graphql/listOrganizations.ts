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
  listOrganizations: Array<
    Pick<Organization, "_id" | "name" | "status" | "conciergeName" | "createdAt" | "updateAt"> & {
      studies: Pick<Organization["studies"][number], "studyName" | "studyAbbreviation">[];
    }
  >;
};
