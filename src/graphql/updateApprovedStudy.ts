import gql from "graphql-tag";

export const mutation = gql`
  mutation updateApprovedStudy(
    $studyID: ID!
    $name: String!
    $acronym: String
    $controlledAccess: Boolean!
    $openAccess: Boolean
    $dbGaPID: String
    $ORCID: String
    $PI: String
  ) {
    updateApprovedStudy(
      studyID: $studyID
      name: $name
      acronym: $acronym
      controlledAccess: $controlledAccess
      openAccess: $openAccess
      dbGaPID: $dbGaPID
      ORCID: $ORCID
      PI: $PI
    ) {
      _id
      studyName
      studyAbbreviation
      dbGaPID
      controlledAccess
      openAccess
      PI
      ORCID
      createdAt
    }
  }
`;

export type Input = {
  studyID: string;
  name: string;
  acronym: string;
  controlledAccess: boolean;
  openAccess: boolean;
  dbGaPID: string;
  ORCID: string;
  PI: string;
};

export type Response = {
  updateApprovedStudy: ApprovedStudy;
};
