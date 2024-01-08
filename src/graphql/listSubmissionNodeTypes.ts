import gql from "graphql-tag";

export const query = gql`
  query listSubmissionNodeTypes($id: ID!) {
    submissionStats(submissionID: $id) {
      # TODO: fill in
      listNodeTypes
    }
  }
`;

export type Response = {
  listSubmissionNodeTypes: {
    listNodeTypes: string[];
  };
};
