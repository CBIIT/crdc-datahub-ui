import gql from "graphql-tag";

export const query = gql`
  query listOrganizationNames {
    listOrganizations {
      _id
      name
    }
  }
`;

export type Response = {
  listOrganizations: Array<Pick<Organization, "_id" | "name">>;
};
