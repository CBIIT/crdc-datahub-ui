import gql from "graphql-tag";

export const mutation = gql`
  mutation saveApplication($application: AppInput!, $controlledAccess: Boolean!) {
    saveApplication(application: $application, controlledAccess: $controlledAccess) {
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

export type Input = {
  /**
   * The Submission Request input
   */
  application: ApplicationInput;
  /**
   * Whether the study is controlled access
   */
  controlledAccess: boolean;
};

export type Response = {
  saveApplication: Omit<Application, "programName" | "studyAbbreviation" | "questionnaireData">;
};
