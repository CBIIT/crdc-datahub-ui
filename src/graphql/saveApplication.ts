import gql from "graphql-tag";

export const mutation = gql`
  mutation saveApplication($application: AppInput!) {
    saveApplication(application: $application) {
      _id
      status
      createdAt
      updatedAt
      submittedDate
      ORCID
      openAccess
      controlledAccess
      PI
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
    }
  }
`;

export type Input = {
  /**
   * The Submission Request input
   */
  application: {
    /**
     * The unique ID of the Application
     */
    _id: string;
    /**
     * The Study Name of the Application
     */
    studyName: string;
    /**
     * The Study Abbreviation or Study Name if the abbreviation is null
     */
    studyAbbreviation: string;
    /**
     * Stringified JSON Application Questionnaire Data
     *
     * @see {@link QuestionnaireData}
     */
    questionnaireData: string;
    /**
     * Whether the data submission will contain controlled access data
     */
    controlledAccess: boolean;
    /**
     * Whether the data submission will contain open access data
     */
    openAccess: boolean;
    /**
     * The Open Researcher and Contributor ID
     */
    ORCID?: string;
    /**
     * Principal Investigator's full name "<first name> <last name>"
     */
    PI: string;
    /**
     * The name for the application program
     */
    programName: string;
    /**
     * The abbreviation for the application program
     */
    programAbbreviation: string;
    /**
     * The description for the application program
     */
    programDescription: string;
  };
};

export type Response = {
  saveApplication: Omit<Application, "programName" | "studyAbbreviation" | "questionnaireData">;
};
