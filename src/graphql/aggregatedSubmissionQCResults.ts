import gql from "graphql-tag";

// The base Issue model used for all aggregatedSubmissionQCResults queries
const BaseIssueFragment = gql`
  fragment BaseIssueFragment on aggregatedQCResult {
    code
    title
  }
`;

// The extended Issue model which includes all fields
const FullIssueFragment = gql`
  fragment IssueFragment on aggregatedQCResult {
    severity
    count
  }
`;

export const query = gql`
  query aggregatedSubmissionQCResults(
    $submissionID: ID!
    $severity: String
    $first: Int
    $offset: Int
    $orderBy: String
    $sortDirection: String
    $partial: Boolean = false
  ) {
    aggregatedSubmissionQCResults(
      submissionID: $submissionID
      severity: $severity
      first: $first
      offset: $offset
      orderBy: $orderBy
      sortDirection: $sortDirection
    ) {
      total
      results {
        ...BaseIssueFragment
        ...IssueFragment @skip(if: $partial)
      }
    }
  }
  ${FullIssueFragment}
  ${BaseIssueFragment}
`;

export type Input = {
  submissionID: string;
  severity?: string;
  first?: number;
  offset?: number;
  orderBy?: string;
  sortDirection?: string;
  partial?: boolean;
};

export type Response = {
  aggregatedSubmissionQCResults: ValidationResult<Issue>;
};
