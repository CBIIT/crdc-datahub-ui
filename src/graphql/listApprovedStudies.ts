import gql from "graphql-tag";

export const query = gql`
  query listApprovedStudies(
    $first: Int
    $offset: Int
    $orderBy: String
    $sortDirection: String
    $dbGaPID: String
    $controlledAccess: String
    $study: String
    $programID: ID
  ) {
    listApprovedStudies(
      first: $first
      offset: $offset
      orderBy: $orderBy
      sortDirection: $sortDirection
      dbGaPID: $dbGaPID
      controlledAccess: $controlledAccess
      study: $study
      programID: $programID
    ) {
      total
      studies {
        _id
        studyName
        studyAbbreviation
        dbGaPID
        controlledAccess
        openAccess
        PI
        ORCID
        primaryContact {
          _id
          firstName
          lastName
        }
        programs {
          _id
          name
          conciergeID
          conciergeName
        }
        useProgramPC
        createdAt
      }
    }
  }
`;

export type Input = {
  first?: number;
  offset?: number;
  orderBy?: string;
  sortDirection?: Order;
  dbGaPID?: string;
  controlledAccess?: AccessType;
  openAccess?: boolean;
  study?: string;
  programID?: string;
};

export type Response = {
  listApprovedStudies: {
    total: number;
    studies: ApprovedStudy[];
  };
};
