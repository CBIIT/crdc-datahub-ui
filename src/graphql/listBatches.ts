import gql from 'graphql-tag';

export const query = gql`
  query listBatches(
    $submissionID: ID!
    $first: Int
    $offset: Int
    $orderBy: String
    $sortDirection: String
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
        _id
        displayID
        submissionID
        type
        metadataIntention
        fileCount
        files {
          nodeType
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
        createdAt
        updatedAt
      }
    }
    fullStatusList: listBatches(submissionID: $submissionID, first: -1) {
      batches {
        status
      }
    }
  }
`;

export type Response = {
  listBatches: ListBatches;
  fullStatusList: {
    batches: Pick<Batch, 'status'>[];
  };
};
