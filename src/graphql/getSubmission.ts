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
      metadataValidationStatus
      fileValidationStatus
      fileErrors {
        submissionID
        type
        validationType
        batchID
        displayID
        submittedID
        severity
        uploadedDate
        validatedDate
        errors {
          title
          description
        }
        warnings {
          title
          description
        }
      }
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

    submissionStats(_id: $id) {
      stats {
        nodeName
        total
        new
        passed
        warning
        error
      }
    }
  }
`;

export type Response = {
  getSubmission: Submission;
  submissionStats: {
    stats: SubmissionStatistic[];
  };
};
