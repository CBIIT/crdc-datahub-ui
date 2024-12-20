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
    }
  }
`;

export type Input = {
  _id: string;
};

export type Response = {
  getApprovedStudy: ApprovedStudy;
};
