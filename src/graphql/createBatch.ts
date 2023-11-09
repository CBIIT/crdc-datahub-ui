import gql from "graphql-tag";

export const mutation = gql`
  mutation createBatch ($submissionID: ID!, $type: String, $metadataIntention: String, $files: [FileInput]) {
    createBatch(
      submissionID: $submissionID,
      type: $type,
      metadataIntention: $metadataIntention,
      files: $files
      ) {
      _id
      submissionID
      bucketName
      filePrefix
      type
      metadataIntention
      fileCount
      files {
        fileName
        signedURL
      }
      status
      createdAt
      updatedAt
    }
  }
`;

export type Response = {
  createBatch: NewBatch
};
