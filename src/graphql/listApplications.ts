import gql from "graphql-tag";

export const query = gql`
  query listApplications($first: Int, $offset: Int, $orderBy: String, $sortDirection: String) {
    listApplications(
      first: $first
      offset: $offset
      orderBy: $orderBy
      sortDirection: $sortDirection
    ) {
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

export type Input = {
  first: number;
  offset: number;
  orderBy: string;
  sortDirection: Order;
};

export type Response = {
  listApplications: {
    total: number;
    applications: Omit<Application, "questionnaireData">[];
  };
};
