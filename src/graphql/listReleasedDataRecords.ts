import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

export const LIST_RELEASED_DATA_RECORDS: TypedDocumentNode<
  ListReleasedDataRecordsResponse,
  ListReleasedDataRecordsInput
> = gql`
  query listReleasedDataRecords(
    $studyId: String!
    $nodeType: String!
    $first: Int
    $offset: Int
    $orderBy: String
    $sortDirection: String
  ) {
    listReleasedDataRecords(
      studyID: $studyId
      nodeType: $nodeType
      first: $first
      offset: $offset
      orderBy: $orderBy
      sortDirection: $sortDirection
    ) {
      total
      properties
      nodes
    }
  }
`;

export type ListReleasedDataRecordsInput = {
  /**
   * The _ID of the Study to list nodes for
   */
  studyId: string;
  /**
   * The type of node to query data for
   */
  nodeType: string;
} & BasePaginationParams;

export type ListReleasedDataRecordsResponse = {
  listReleasedDataRecords: {
    /**
     * The total number of records returned
     */
    total: number;
    /**
     * The list of properties available for the node type
     */
    properties: string[];
    /**
     * An array of JSON objects representing the nodes
     */
    nodes: Record<string, unknown>[];
  };
};
