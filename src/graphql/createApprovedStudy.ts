import gql from "graphql-tag";

export const mutation = gql`
  mutation createApprovedStudy(
    $name: String!
    $acronym: String
    $controlledAccess: Boolean!
    $openAccess: Boolean
    $dbGaPID: String
    $ORCID: String
    $PI: String
    $primaryContactID: String
  ) {
    createApprovedStudy(
      name: $name
      acronym: $acronym
      controlledAccess: $controlledAccess
      openAccess: $openAccess
      dbGaPID: $dbGaPID
      ORCID: $ORCID
      PI: $PI
      primaryContactID: $primaryContactID
    ) {
      _id
      studyName
      studyAbbreviation
      dbGaPID
      controlledAccess
      openAccess
      PI
      ORCID
      programs {
        _id
      }
      createdAt
    }
  }
`;

export type Input = {
  name: string;
  acronym: string;
  controlledAccess: boolean;
  openAccess: boolean;
  dbGaPID: string;
  ORCID: string;
  PI: string;
  primaryContactID: string;
};

export type Response = {
  createApprovedStudy: ApprovedStudy;
};
