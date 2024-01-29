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
        validationType
        batchID
        displayID
        nodeID
        CRDC_ID
        severity
        uploadedDate
        validatedDate
        errors {
          title
          description
        }
        warnings {
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
