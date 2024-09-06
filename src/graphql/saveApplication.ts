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
  application: {
    _id: string;
    programName: string;
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
     * Principal Investigator's name
     */
    PI: string;
  };
};

export type Response = {
  saveApplication: Omit<Application, "programName" | "studyAbbreviation" | "questionnaireData">;
};
