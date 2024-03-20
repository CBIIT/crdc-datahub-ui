import gql from "graphql-tag";

export const query = gql`
  query getSubmissionNodes($_id: String!, $nodeType: String!, $first: Int, $offset: Int, $orderBy: String, $sortDirection: String) {
    getSubmissionNodes(_id: $_id, nodeType: $nodeType, first: $first, offset: $offset, orderBy: $orderBy, sortDirection: $sortDirection) {
      total
      properties
      nodes {
        _id
        nodeType
        name
        description
        status
        createdAt
        updatedAt
        createdBy
        updatedBy
        parentID
        parentType
        properties
      }
    }
  }
`;

export type Response = {
  getSubmissionNodes: {
    /**
     * Total number of nodes in the submission.
     */
    total: number;
    /**
     * The list of all node properties including parents
     */
    properties: string[];
    /**
     * An array of nodes matching the queried node type
     */
    nodes: SubmissionNode[];
  };
};
