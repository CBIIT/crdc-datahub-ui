import gql from "graphql-tag";

export const query = gql`
  query listApplications(
    $programName: String
    $studyName: String
    $statues: [String]
    $submitterName: String
    $first: Int
    $offset: Int
    $orderBy: String
    $sortDirection: String
  ) {
    listApplications(
      programName: $programName
      studyName: $studyName
      statues: $statues
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
    }
  }
`;

export type Input = {
  programName: string;
  studyName: string;
  statues: string[]; // TODO: Fix typo
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
    status: string[];
    submitterNames: string[];
  };
};
