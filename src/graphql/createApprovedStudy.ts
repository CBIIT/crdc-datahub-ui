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
    $useProgramPC: Boolean!
    $pendingModelChange: Boolean
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
      useProgramPC: $useProgramPC
      pendingModelChange: $pendingModelChange
    ) {
      _id
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
  useProgramPC: boolean;
  pendingModelChange: boolean;
};

export type Response = {
  createApprovedStudy: Pick<ApprovedStudy, "_id">;
};
