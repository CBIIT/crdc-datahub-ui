import gql from "graphql-tag";

// The base Issue model used for all submissionAggQCResults queries
const BaseIssueFragment = gql`
  fragment BaseIssueFragment on Issue {
    code
    title
  }
`;

// The extended Issue model which includes all fields
const FullIssueFragment = gql`
  fragment IssueFragment on Batch {
    severity
    description
    count
  }
`;

export const query = gql`
  query submissionAggQCResults(
    $submissionID: ID!
    $first: Int
    $offset: Int
    $orderBy: String
    $sortDirection: String
    $partial: Boolean = false
  ) {
    submissionAggQCResults(
      submissionID: $submissionID
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
  first?: number;
  offset?: number;
  orderBy?: string;
  sortDirection?: string;
  partial?: boolean;
};

export type Response = {
  submissionAggQCResults: ValidationResult<Issue>;
};
