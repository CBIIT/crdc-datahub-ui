import gql from "graphql-tag";

export const mutation = gql`
  mutation editOrganization(
    $orgID: ID!
    $name: String
    $conciergeID: String
    $studies: [ID]
    $status: String
  ) {
    editOrganization(
      orgID: $orgID
      name: $name
      conciergeID: $conciergeID
      studies: $studies
      status: $status
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
      createdAt
      updateAt
    }
  }
`;

export type Input = {
  orgID: string;
  name: string;
  conciergeID: string;
  studies: ApprovedStudy["_id"][];
  status: Organization["status"];
};

export type Response = {
  editOrganization: Organization;
};
