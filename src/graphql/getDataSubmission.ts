import gql from "graphql-tag";

export const query = gql`
  query getDataSubmission($id: ID!) {
    getDataSubmission(_id: $id) {
      _id
      name
      submitterID
      submitterName
      organization
      dataCommons
      modelVersion
      studyAbbreviation
      dbGapID
      bucketName
      rootPath
      status
      history {
          status
          reviewComment
          dateTime
          userID
          __typename
      }
      concierge
      conciergeEmail
      createdAt
      updatedAt
      __typename
    }
  }
`;

export type Response = {
  getDataSubmission: Submission;
};
