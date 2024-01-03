import gql from 'graphql-tag';

// The base Batch model used for all listBatches queries
const BaseBatchFragment = gql`
  fragment BaseBatchFragment on Batch {
    _id
    # TODO: Need to add numeric ID here too
    createdAt
    updatedAt
  }
`;

// The extended batch model which includes all fields
const FullBatchFragment = gql`
  fragment BatchFragment on Batch {
    submissionID
    type
    metadataIntention
    fileCount
    files {
      filePrefix
      fileName
      size
      status
      errors
      createdAt
      updatedAt
    }
    status
    errors
  }
`;

export const query = gql`
  query listBatches(
    $submissionID: ID!
    $first: Int
    $offset: Int
    $orderBy: String
    $sortDirection: String
    $partial: Boolean = false
  ) {
    listBatches(
      submissionID: $submissionID
      first: $first
      offset: $offset
      orderBy: $orderBy
      sortDirection: $sortDirection
    ) {
      total
      batches {
        ...BaseBatchFragment
        ...BatchFragment @skip(if: $partial)
      }
    }
  }
  ${FullBatchFragment}
  ${BaseBatchFragment}
`;

export type Response = {
  listBatches: ListBatches;
};
