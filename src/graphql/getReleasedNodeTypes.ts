import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

export const GET_RELEASED_NODE_TYPES: TypedDocumentNode<
  GetReleasedNodeTypesResp,
  GetReleasedNodeTypesInput
> = gql`
  query getReleasedNodes($studyID: String!) {
    getReleasedNodes(studyID: $studyID) {
      nodes {
        name
        count
      }
    }
  }
`;

export type GetReleasedNodeTypesInput = {
  /**
   * The _ID of the Study to list nodes types for
   */
  studyId: string;
};

export type GetReleasedNodeTypesResp = {
  getReleasedNodes: {
    nodes: Array<{
      /**
       * The name of the node type
       */
      name: string;
      /**
       * The count of nodes of this type currently released
       */
      count: number;
    }>;
  };
};
