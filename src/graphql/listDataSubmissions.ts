  import gql from 'graphql-tag';

export const query = gql`
  query listDataSubmissions($first: Int, $offset: Int, $orderBy: String, $sortDirection: String, $organization: String, $status: String) {
    listDataSubmissions(first: $first, offset: $offset, orderBy: $orderBy, sortDirection: $sortDirection, organization: $organization, status: $status) {
      total
      submissions {
        displayID
        name
        submitterName
        organization
        dataCommons
        studyAbbreviation
        dbGapID
        status
        concierge
        createdAt
        updatedAt
      }
    }
  }
`;

export type Response = {
  listDataSubmissions: {
    total: number;
    dataSubmissions: Omit<DataSubmission, "rootPath" | "bucketName">[];
  };
};
