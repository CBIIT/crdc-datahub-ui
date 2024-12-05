import gql from "graphql-tag";

export const mutation = gql`
  mutation createOrganization(
    $name: String!
    $abbreviation: String
    $description: String
    $conciergeID: String
    $studies: [ApprovedStudyInput]
  ) {
    createOrganization(
      name: $name
      abbreviation: $abbreviation
      description: $description
      conciergeID: $conciergeID
      studies: $studies
    ) {
      _id
      name
      abbreviation
      description
      status
      conciergeID
      conciergeName
      studies {
        _id
        studyName
        studyAbbreviation
      }
      createdAt
      updateAt
    }
  }
`;

export type Input = {
  name: string;
  abbreviation: string;
  description: string;
  conciergeID: string;
  studies: { studyID: string }[];
};

export type Response = {
  createOrganization: Organization;
};
