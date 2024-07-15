import gql from "graphql-tag";

export const query = gql`
  query getRelatedNodeProperties(
    $submissionID: String!
    $nodeType: String!
    $nodeID: String!
    $relationship: String!
    $relatedNodeType: String!
  ) {
    getRelatedNodes(
      submissionID: $submissionID
      nodeType: $nodeType
      nodeID: $nodeID
      relationship: $relationship
      relatedNodeType: $relatedNodeType
    ) {
      properties
      IDPropName
    }
  }
`;

export type Input = {
  submissionID: string;
  nodeType: string;
  nodeID: string;
  relationship: NodeRelationship;
  relatedNodeType: string;
};

export type Response = {
  getRelatedNodes: {
    /**
     * The list of all node properties including parents
     */
    properties: string[];
    /**
     * The ID/Key property of current node.
     * ex. "study_participant_id" for participant node
     */
    IDPropName: string;
  };
};
