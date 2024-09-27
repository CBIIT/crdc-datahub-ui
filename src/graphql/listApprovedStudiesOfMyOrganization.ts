import gql from "graphql-tag";

export const query = gql`
  query listApprovedStudiesOfMyOrganization {
    listApprovedStudiesOfMyOrganization {
      _id
      studyName
      studyAbbreviation
      dbGaPID
      controlledAccess
    }
  }
`;

export type Response = {
  listApprovedStudiesOfMyOrganization: ApprovedStudyOfMyOrganization[];
};
