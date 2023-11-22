import gql from "graphql-tag";

export const query = gql`
  query submissionQCResults($id: ID!) {
    submissionQCResults(_id: $id) {
      submissionID
      nodeType
      batchID
      nodeID
      CRDC_ID
      severity
      uploadedDate
      description {
        title
        description
      }
    }
  }
`;

export type Response = {
  submissionQCResults: QCResults[];
};
