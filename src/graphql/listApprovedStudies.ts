import gql from 'graphql-tag';

export const query = gql`
  query listApprovedStudies {
    listApprovedStudies {
        _id
        originalOrg
        studyName
        studyAbbreviation
        dbGaPID
    }
  }
`;

export type Response = {
  listApprovedStudies: ApprovedStudy[];
};
