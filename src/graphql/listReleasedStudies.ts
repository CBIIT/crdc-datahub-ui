import gql from "graphql-tag";

export const query = gql`
  query listReleasedStudies(
    $name: String
    $dbGaPID: String
    $dataCommons: [String]!
    $first: Int = 20
    $offset: Int = 0
    $orderBy: String = "studyAbbreviation"
    $sortDirection: String = "ASC"
  ) {
    listReleasedStudies(
      name: $name
      dbGaPID: $dbGaPID
      dataCommons: $dataCommons
      first: $first
      offset: $offset
      orderBy: $orderBy
      sortDirection: $sortDirection
    ) {
      total
      dataCommons
      studies {
        _id
        studyName
        dbGaPID
        studyAbbreviation
        dataCommons
        dataCommonsDisplayNames
      }
    }
  }
`;

export type Input = {
  name: string;
  dbGaPID: string;
  dataCommons: string[];
  first?: number;
  offset?: number;
  orderBy?: string;
  sortDirection?: Order;
};

export type Response = {
  listReleasedStudies: {
    total: number;
    dataCommons: string[];
    studies: ReleasedStudy[];
  };
};
