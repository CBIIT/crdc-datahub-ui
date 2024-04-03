import gql from "graphql-tag";

export const mutation = gql`
  mutation createOrganization(
    $name: String!
    $conciergeID: String
    $studies: [ApprovedStudyInput]
  ) {
    createOrganization(
      name: $name
      conciergeID: $conciergeID
      studies: $studies
    ) {
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
  createOrganization: Organization;
};
