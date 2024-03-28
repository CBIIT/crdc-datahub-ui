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
      intention
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

    totalQCResults: submissionQCResults(_id: $id, first: 1) {
      total
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
  /**
   * The total number of QC results for the submission
   */
  totalQCResults: {
    total: number;
  };
};
