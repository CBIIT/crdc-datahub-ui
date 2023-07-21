import gql from 'graphql-tag';

export const query = gql`
  query getApplication($id: ID!) {
    getApplication(_id : $id) {
      _id
      status
      programLevelApproval
      reviewComment
      createdAt
      updatedAt
      submittedDate
      history {
        status
        reviewComment
        dateTime
        userID
      }
      applicantID
      applicantName
      applicantEmail

      questionnaire
    }
  }
`;

export type Response = {
  getApplication: Omit<ApplicationResponse, "questionnaire"> & {
    questionnaire: string
  };
};
