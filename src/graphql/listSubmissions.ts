import gql from 'graphql-tag';

export const query = gql`
  query listSubmissions($first: Int, $offset: Int, $orderBy: String, $sortDirection: String, $organization: String, $status: String) {
    listSubmissions(first: $first, offset: $offset, orderBy: $orderBy, sortDirection: $sortDirection, organization: $organization, status: $status) {
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
        status
        conciergeName
        createdAt
        updatedAt
      }
    }
  }
`;

export type Response = {
  listSubmissions: {
    total: number;
    submissions: Omit<Submission, "submitterID"
    | "modelVersion" | "bucketName" | "rootPath" | "history">[];
  };
};
