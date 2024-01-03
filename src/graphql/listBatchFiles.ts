import gql from "graphql-tag";

export const query = gql`
  query listBatchFiles(
    $submissionID: ID!
    $batchID: ID!
    $first: Int
    $offset: Int
    $orderBy: String
    $sortDirection: String
  ) {
    listBatchFiles(
      submissionID: $submissionID
      batchID: $batchID
      first: $first
      offset: $offset
      orderBy: $orderBy
      sortDirection: $sortDirection
    ) {
      total
      batchFiles {
        nodeType
        batchID
        fileName
      }
    }
  }
`;

export type Response = {
  listBatchFiles: ListBatchFiles;
};
