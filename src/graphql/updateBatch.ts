import gql from "graphql-tag";

/*
 *   NOTE: This is used to update the Batch after upload to signedURLs has been complete.
 *   This is NOT for upload type "update"
 */
export const mutation = gql`
  mutation updateBatch(
    $batchID: ID!
    $files: [UploadResult]
  ) {
    updateBatch(
      batchID: $batchID
      files: $files
    ) {
      _id
      submissionID
      type
      metadataIntention
      fileCount
      files {
        type
        extension
        count
        amount
      }
      status
      createdAt
      updatedAt
    }
  }
`;

export type Response = {
  updateBatch: Batch;
};
