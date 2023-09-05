  import gql from 'graphql-tag';

export const query = gql`
  query listDataSubmissions($first: Int, $offset: Int, $orderBy: String, $sortDirection: String) {
    listDataSubmissions(first: $first, offset: $offset, orderBy: $orderBy, sortDirection: $sortDirection) {
      total
      applications {
        _id
        programName
        studyAbbreviation
        status
        createdAt
        updatedAt
        submittedDate
        applicant {
          applicantName
          applicantID
        }
        organization {
          name
        }
      }
    }
  }
`;

export type Response = {
  listApplications: {
    total: number;
    applications: Omit<Application, "questionnaireData">[];
  };
};
