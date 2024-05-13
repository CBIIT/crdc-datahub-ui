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
      crossSubmissionStatus
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
      intention
      otherSubmissions
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
  /**
   * The submission object
   */
  getSubmission: Submission;
  /**
   * The node statistics for the submission
   */
  submissionStats: {
    stats: SubmissionStatistic[];
  };
};
