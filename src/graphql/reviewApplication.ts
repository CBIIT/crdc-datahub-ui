import gql from "graphql-tag";

export const mutation = gql`
  mutation reviewApplication($id: ID!) {
    reviewApplication(_id: $id) {
      _id
      status
      createdAt
      updatedAt
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

export type Response = {
  reviewApplication: Pick<
    Application,
    "_id" | "status" | "createdAt" | "updatedAt" | "history" | "applicant"
  >;
};
