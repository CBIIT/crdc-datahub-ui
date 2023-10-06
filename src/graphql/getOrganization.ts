import gql from 'graphql-tag';

export const query = gql`
  query getOrganization($orgID: ID!) {
    getOrganization(orgID: $orgID) {
      _id
      name
      status
      conciergeID
      conciergeName
      studies {
        studyName
        studyAbbreviation
      }
    }
  }
`;

export type Response = {
  getOrganization: Organization;
};
