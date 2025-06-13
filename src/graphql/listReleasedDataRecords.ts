import gql from "graphql-tag";

export const LIST_RELEASED_DATA_RECORDS = gql`
  query listReleasedDataRecords(
    $studyId: String!
    $nodeType: String! # TODO: This is a string array ATM
    $first: Int
    $offset: Int
    $orderBy: String
    $sortDirection: String
  ) {
    listReleasedDataRecords(
      studyId: $studyId
      nodeType: $nodeType
      first: $first
      offset: $offset
      orderBy: $orderBy
      sortDirection: $sortDirection
    ) {
      # TODO: Other properties here
      total
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
    total: number;
    nodes: string[]; // TODO: array of stringified json objects
  };
};
