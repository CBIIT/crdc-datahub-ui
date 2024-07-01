import gql from "graphql-tag";

export const query = gql`
  query listApprovedStudiesOfMyOrganization {
    listApprovedStudiesOfMyOrganization {
      _id
      originalOrg
      studyName
      studyAbbreviation
      dbGaPID
      controlledAccess
    }
  }
`;

export type Response = {
  listApprovedStudiesOfMyOrganization: ApprovedStudy[];
};
