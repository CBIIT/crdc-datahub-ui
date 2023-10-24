import gql from 'graphql-tag';

export const mutation = gql`
  mutation saveApplication($application: AppInput!) {
    saveApplication(application : $application) {
      _id
      status
      createdAt
      updatedAt
      submittedDate
      history {
        status
        reviewComment
        dateTime
        userID
      }
      applicant {
        applicantID
        applicantName
      }
      organization {
        _id
        name
      }
    }
  }
`;

export type Response = {
  saveApplication: Omit<Application, "programName" | "studyAbbreviation" | "questionnaireData">;
};
