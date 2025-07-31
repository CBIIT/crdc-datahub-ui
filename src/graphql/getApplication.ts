import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

export const query: TypedDocumentNode<Response> = gql`
  query getApplication($id: ID!) {
    getApplication(_id: $id) {
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
