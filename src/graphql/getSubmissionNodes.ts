import gql from "graphql-tag";

export const query = gql`
  query getSubmissionNodes(
    $_id: String!
    $nodeType: String!
    $first: Int
    $offset: Int
    $orderBy: String
    $sortDirection: String
  ) {
    getSubmissionNodes(
      submissionID: $_id
      nodeType: $nodeType
      first: $first
      offset: $offset
      orderBy: $orderBy
      sortDirection: $sortDirection
    ) {
      total
      IDPropName
      properties
      nodes {
        nodeType
        nodeID
        status
        props
      }
    }
  }
`;

export type Input = {
  _id: string;
  nodeType: string;
  first?: number;
  offset?: number;
  orderBy?: string;
  sortDirection?: string;
};

export type Response = {
  getSubmissionNodes: {
    /**
     * Total number of nodes in the submission.
     */
    total: number;
    /**
     * The ID/Key property of current node.
     *
     */
    IDPropName: string;
    /**
     * The list of all node properties including parents
     */
    properties: string[];
    /**
     * An array of nodes matching the queried node type
     *
     * @note Unused values are omitted from the query. See the type definition for additional fields.
     */
    nodes: Pick<SubmissionNode, "nodeType" | "nodeID" | "props" | "status">[];
  };
};
