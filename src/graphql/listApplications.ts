import gql from "graphql-tag";

export const query = gql`
  query listApplications(
    $programName: String
    $studyName: String
    $statuses: [String]
    $submitterName: String
    $first: Int
    $offset: Int
    $orderBy: String
    $sortDirection: String
  ) {
    listApplications(
      programName: $programName
      studyName: $studyName
      statuses: $statuses
      submitterName: $submitterName
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
        conditional
        pendingConditions
      }
      programs
      studies
    }
  }
`;

export type Input = {
  programName: string;
  studyName: string;
  statuses: string[];
  submitterName: string;
  first: number;
  offset: number;
  orderBy: string;
  sortDirection: Order;
};

export type Response = {
  listApplications: {
    total: number;
    applications: Omit<Application, "questionnaireData">[];
    programs: string[];
    studies: string[];
  };
};
