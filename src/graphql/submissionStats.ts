import gql from "graphql-tag";

export const query = gql`
  query submissionStats($id: ID!) {
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
   * The node statistics for the submission
   */
  submissionStats: {
    stats: SubmissionStatistic[];
  };
};
