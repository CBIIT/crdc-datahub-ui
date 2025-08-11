import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

export type Input = {
  submissionID: string;
};

export const query: TypedDocumentNode<Response, Input> = gql`
  query getApplication($submissionID: ID!) {
    getApplication(_id: $submissionID) {
      _id
      status
      createdAt
      updatedAt
      submittedDate
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
      newInstitutions {
        id
        name
      }
      programName
      studyAbbreviation
      questionnaireData
      conditional
      pendingConditions
    }
  }
`;

export type Response = {
  getApplication: Omit<Application, "questionnaireData"> & {
    questionnaireData: string; // Cast to QuestionnaireData
  };
};
