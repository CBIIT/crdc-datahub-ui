import gql from "graphql-tag";

export const query = gql`
  query getRelatedNodes(
    $submissionID: String!
    $nodeType: String!
    $nodeID: String!
    $relationship: String!
    $relatedNodeType: String!
    $first: Int
    $offset: Int
    $orderBy: String
    $sortDirection: String
  ) {
    getRelatedNodes(
      submissionID: $submissionID
      nodeType: $nodeType
      nodeID: $nodeID
      relationship: $relationship
      relatedNodeType: $relatedNodeType
      first: $first
      offset: $offset
      orderBy: $orderBy
      sortDirection: $sortDirection
    ) {
      total
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
  submissionID: string;
  nodeType: string;
  nodeID: string;
  relationship: NodeRelationship;
  relatedNodeType: string;
  first?: number;
  offset?: number;
  orderBy?: string;
  sortDirection?: string;
};

export type PropetiesInput = {
  submissionID: string;
  nodeType: string;
  nodeID: string;
  relationship: NodeRelationship;
  relatedNodeType: string;
};

export type Response = {
  getRelatedNodes: {
    /**
     * Total number of nodes in the submission.
     */
    total: number;
    /**
     * An array of nodes matching the queried node type
     *
     * @note Unused values are omitted from the query. See the type definition for additional fields.
     */
    nodes: Pick<SubmissionNode, "nodeType" | "nodeID" | "props" | "status">[];
  };
};
