import gql from "graphql-tag";

export const query = gql`
  query listApprovedStudies(
    $first: Int
    $offset: Int
    $orderBy: String
    $sortDirection: String
    $controlledAccess: String
    $study: String
  ) {
    listApprovedStudies(
      first: $first
      offset: $offset
      orderBy: $orderBy
      sortDirection: $sortDirection
      controlledAccess: $controlledAccess
      study: $study
    ) {
      _id
      studyName
      studyAbbreviation
      dbGaPID
    }
  }
`;

export type Input = {
  first?: number;
  offset?: number;
  orderBy?: string;
  sortDirection?: Order;
  controlledAccess?: ControlledAccess;
  study?: string;
};

export type Response = {
  listApprovedStudies: {
    total: number;
    studies: ApprovedStudy[];
  };
};
