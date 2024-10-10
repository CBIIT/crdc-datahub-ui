import gql from "graphql-tag";

export const query = gql`
  query listSubmissions(
    $organization: String
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
      organization: $organization
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
        organization {
          _id
          name
        }
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
  organization?: string;
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
    submissions: Omit<Submission, "submitterID" | "bucketName" | "rootPath" | "history">[];
    submitterNames: string[];
    dataCommons: string[];
  };
};
