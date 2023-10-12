import gql from "graphql-tag";

export const query = gql`
  query getDataSubmissionBatchFiles(
    $id: ID!
    $first: Int
    $offset: Int
    $orderBy: String
    $sortDirection: String
  ) {
    getDataSubmissionBatchFiles(
      _id: $id
      first: $first
      offset: $offset
      orderBy: $orderBy
      sortDirection: $sortDirection
    ) {
      total
      batchFiles {
        _id
        uploadType
        fileCount
        status
        submittedDate
        errorCount
        __typename
      }
      __typename
    }
  }
`;

export type Response = {
  getDataSubmissionBatchFiles: {
    total: number;
    batchFiles: BatchFile[];
  };
};
