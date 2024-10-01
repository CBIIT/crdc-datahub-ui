import gql from "graphql-tag";

export const mutation = gql`
  mutation createBatch($submissionID: ID!, $type: String, $files: [FileInput]) {
    createBatch(submissionID: $submissionID, type: $type, files: $files) {
      _id
      submissionID
      bucketName
      filePrefix
      type
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
  createBatch: NewBatch;
};
