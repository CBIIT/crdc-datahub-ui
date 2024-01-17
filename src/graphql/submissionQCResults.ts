import gql from "graphql-tag";

export const query = gql`
  query submissionQCResults(
    $id: ID!
    $nodeTypes: [String]
    $batchIDs: [ID]
    $severities: String
    $first: Int
    $offset: Int
    $orderBy: String
    $sortDirection: String
  ) {
    submissionQCResults(
      _id: $id
      nodeTypes: $nodeTypes
      batchIDs: $batchIDs
      severities: $severities
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
        displayID
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
