import gql from "graphql-tag";

export const query = gql`
  query submissionQCResults(
    $id: ID!
    $first: Int
    $offset: Int
    $orderBy: String
    $sortDirection: String
  ) {
    submissionQCResults(
      _id: $id
      first: $first
      offset: $offset
      orderBy: $orderBy
      sortDirection: $sortDirection
    ) {
      total
      results {
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
  }
`;

export type Response = {
  submissionQCResults: QCResults;
};
