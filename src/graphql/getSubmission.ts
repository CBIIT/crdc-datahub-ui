import gql from "graphql-tag";

export const query = gql`
  query getSubmission($id: ID!) {
    getSubmission(_id: $id) {
      _id
      name
      submitterID
      submitterName
      organization {
        _id
        name
      }
      dataCommons
      modelVersion
      studyAbbreviation
      dbGaPID
      bucketName
      rootPath
      status
      history {
          status
          reviewComment
          dateTime
          userID
      }
      conciergeName
      conciergeEmail
      createdAt
      updatedAt
    }
  }
`;

export type Response = {
  getSubmission: Submission;
};
