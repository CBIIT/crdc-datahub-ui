import gql from "graphql-tag";

export const mutation = gql`
  mutation editOrganization(
    $orgID: ID!
    $name: String
    # $abbreviation: String
    # $description: String
    $conciergeID: String
    $studies: [ApprovedStudyInput]
    $status: String
  ) {
    editOrganization(
      orgID: $orgID
      name: $name
      # abbreviation: $abbreviation
      # description: $description
      conciergeID: $conciergeID
      studies: $studies
      status: $status
    ) {
      _id
      name
      # TODO: Remove this once the server-side code is updated
      abbreviation @client
      description @client
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
  orgID: string;
  name: string;
  abbreviation: string;
  description: string;
  conciergeID: string;
  studies: { studyID: string }[];
  status: Organization["status"];
};

export type Response = {
  editOrganization: Organization;
};
