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
    }

    listSubmitters: listSubmissions(
      organization: $organization
      status: $status
      dataCommons: $dataCommons
      name: $name
      dbGaPID: $dbGaPID
      first: -1
      offset: 0
      orderBy: "submitterName"
      sortDirection: "asc"
    ) {
      submissions {
        submitterName
      }
    }
  }
`;

export type Input = {
  organization: string;
  status: Submission["status"] | "All";
  dataCommons: DataCommon;
  name: string;
  dbGaPID: string;
  submitterName: string;
};

export type Response = {
  listSubmissions: {
    total: number;
    submissions: Omit<Submission, "submitterID" | "bucketName" | "rootPath" | "history">[];
  };
  listSubmitters: {
    submissions: {
      submitterName: string;
    };
  };
};
