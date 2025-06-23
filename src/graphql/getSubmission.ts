import gql from "graphql-tag";

export const query = gql`
  query getSubmission(
    $id: ID!
    $skipSubmission: Boolean = false
    $skipStats: Boolean = false
    $skipAttributes: Boolean = false
  ) {
    getSubmission(_id: $id) @skip(if: $skipSubmission) {
      _id
      name
      submitterID
      submitterName
      organization {
        _id
        name
        abbreviation
      }
      dataCommons
      dataCommonsDisplayName
      modelVersion
      studyID
      studyAbbreviation
      studyName
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
      deletingData
      history {
        status
        reviewComment
        dateTime
        userID
        userName
      }
      conciergeName
      conciergeEmail
      intention
      dataType
      otherSubmissions
      nodeCount
      collaborators {
        collaboratorID
        collaboratorName
        permission
      }
      dataFileSize {
        size
      }
      createdAt
      updatedAt
    }

    submissionStats(_id: $id) @skip(if: $skipStats) {
      stats {
        nodeName
        total
        new
        passed
        warning
        error
      }
    }

    getSubmissionAttributes(submissionID: $id) @skip(if: $skipAttributes) {
      submissionAttributes {
        isBatchUploading
        hasOrphanError
      }
    }
  }
`;

export type Input = {
  /**
   * The submission ID
   */
  id: string;
  /**
   * Indicates whether to skip the getSubmission query
   */
  skipSubmission?: boolean;
  /**
   * Indicates whether to skip the submissionStats query
   */
  skipStats?: boolean;
  /**
   * Indicates whether to skip the getSubmissionAttributes query
   */
  skipAttributes?: boolean;
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
   * The submission attributes and validation status
   */
  getSubmissionAttributes: {
    /**
     * The submission attributes
     */
    submissionAttributes: Pick<SubmissionAttributes, "isBatchUploading" | "hasOrphanError">;
  };
};
