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
    $primaryContactID: String
    $useProgramPC: Boolean!
    $pendingModelChange: Boolean
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
      primaryContactID: $primaryContactID
      useProgramPC: $useProgramPC
      pendingModelChange: $pendingModelChange
    ) {
      _id
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
  primaryContactID: string;
  useProgramPC: boolean;
  pendingModelChange: boolean;
};

export type Response = {
  updateApprovedStudy: Pick<ApprovedStudy, "_id">;
};
