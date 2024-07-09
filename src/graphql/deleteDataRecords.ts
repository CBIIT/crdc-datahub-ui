import gql from "graphql-tag";

export const mutation = gql`
  mutation deleteDataRecords($_id: String!, $nodeType: String!, $nodeIds: [String!]) {
    deleteDataRecords(submissionID: $_id, nodeType: $nodeType, nodeIDs: $nodeIds) {
      success
      message
    }
  }
`;

export type Input = {
  /**
   * The ID of the data submission to delete the records from
   */
  _id: string;
  /**
   * The type of node to delete
   */
  nodeType: string;
  /**
   * An array of the IDs of the nodes to delete
   */
  nodeIds: string[];
};

export type Response = {
  deleteDataRecords: DataValidationResult;
};
