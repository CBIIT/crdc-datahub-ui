import gql from "graphql-tag";

export const query = gql`
  query listLogs($submissionID: ID!) {
    listLogs(submissionID: $submissionID) {
      logFiles {
        fileName
        uploadType
        downloadUrl
        fileSize
      }
    }
  }
`;

export type Response = {
  listLogs: ListLogFiles;
};
