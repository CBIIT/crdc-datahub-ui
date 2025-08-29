import gql from "graphql-tag";

export const query = gql`
  query getApprovedStudy($_id: ID!) {
    getApprovedStudy(_id: $_id) {
      _id
      studyName
      studyAbbreviation
      dbGaPID
      controlledAccess
      openAccess
      PI
      ORCID
      createdAt
      primaryContact {
        _id
        firstName
        lastName
      }
      programs {
        _id
        name
        conciergeID
        conciergeName
      }
      useProgramPC
    }
  }
`;

export type Input = {
  _id: string;
};

export type Response = {
  getApprovedStudy: Pick<
    ApprovedStudy,
    | "_id"
    | "studyName"
    | "studyAbbreviation"
    | "dbGaPID"
    | "controlledAccess"
    | "openAccess"
    | "PI"
    | "ORCID"
    | "createdAt"
    | "useProgramPC"
  > & {
    primaryContact: Pick<User, "_id" | "firstName" | "lastName">;
    programs: Pick<Organization, "_id" | "name" | "conciergeID" | "conciergeName">[];
  };
};
