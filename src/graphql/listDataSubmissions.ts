import gql from 'graphql-tag';

export const query = gql`
  query listDataSubmissions($first: Int, $offset: Int, $orderBy: String, $sortDirection: String, $organization: String, $status: String) {
    listDataSubmissions(first: $first, offset: $offset, orderBy: $orderBy, sortDirection: $sortDirection, organization: $organization, status: $status) {
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
    submissions: Omit<DataSubmission, "submitterID"
    | "modelVersion" | "bucketName" | "rootPath" | "history">[];
  };
};

// type Submission {
//   _id: ID # aka. submissionID
//   displayID: ID # minimum 6 digit integer with leading zeros, can have more digits
//   name: String
//   submitterID: ID
//   submitterName: String # <first name> <last name>
//   organization: String
//   dataCommons: String
//   modelVersion: String # for future use
//   studyAbbreviation: String
//   dbGapID: String # aka. phs number
//   bucketName: String # populated from organization
//   rootPath: String # append "/<submission ID>" to organization's rootPath
//   status: String # [New, In Progress, Submitted, Released, Canceled, Transferred, Completed, Archived]
//   history: [Event]
//   concierge: String # Concierge name
//   createdAt: Date # ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
//   updatedAt: Date # ISO 8601 date time format with UTC or offset e.g., 2023-05-01T09:23:30Z
// }
