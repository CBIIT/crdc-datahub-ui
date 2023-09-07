import gql from 'graphql-tag';

export const query = gql`
  query listOrganizations {
    listOrganizations {
      orgID
      orgName
      createdAt
      updateAt
    }
  }
`;

export type Response = {
  listOrganizations: OrgInfo[];
};
