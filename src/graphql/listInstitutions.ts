import gql from "graphql-tag";

export const query = gql`
  query listInstitutions {
    listInstitutions
  }
`;

export type Response = {
  listInstitutions: string[];
};
