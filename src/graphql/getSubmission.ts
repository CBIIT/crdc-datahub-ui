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
      studyID
      studyAbbreviation
      dbGaPID
      bucketName
      rootPath
      status
      metadataValidationStatus
      fileValidationStatus
      crossSubmissionStatus
      validationStarted
      validationEnded
      validationScope
      validationType
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
      dataType
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

    listBatches(submissionID: $id, first: -1) {
      batches {
        status
      }
    }
  }
`;

export type Input = {
  /**
   * The submission ID
   */
  id: string;
};

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
   * The full list of batches for the submission
   */
  listBatches: {
    batches: Pick<Batch, "status">[];
  };
};
