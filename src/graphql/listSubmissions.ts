import gql from "graphql-tag";

export const query = gql`
  query listSubmissions(
    $status: String
    $dataCommons: String
    $name: String
    $dbGaPID: String
    $submitterName: String
    $first: Int
    $offset: Int
    $orderBy: String
    $sortDirection: String
  ) {
    listSubmissions(
      status: $status
      dataCommons: $dataCommons
      name: $name
      dbGaPID: $dbGaPID
      submitterName: $submitterName
      first: $first
      offset: $offset
      orderBy: $orderBy
      sortDirection: $sortDirection
    ) {
      total
      submissions {
        _id
        name
        submitterName
        dataCommons
        studyAbbreviation
        dbGaPID
        modelVersion
        status
        archived
        conciergeName
        nodeCount
        createdAt
        updatedAt
        intention
      }
      submitterNames
      dataCommons
    }
  }
`;

export type Input = {
  status?: SubmissionStatus | "All";
  dataCommons?: string;
  name?: string;
  dbGaPID?: string;
  submitterName?: string;
  first: number;
  offset: number;
  orderBy: string;
  sortDirection: Order;
};

export type Response = {
  listSubmissions: {
    total: number;
    submissions: Omit<
      Submission,
      "submitterID" | "bucketName" | "rootPath" | "history" | "organization"
    >[];
    submitterNames: string[];
    dataCommons: string[];
  };
};
