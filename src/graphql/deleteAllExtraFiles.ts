import gql from "graphql-tag";

export const mutation = gql`
  mutation deleteAllExtraFiles($_id: ID!) {
    deleteAllExtraFiles(_id: $_id) {
      success
    }
  }
`;

export type Response = {
  deleteAllExtraFiles: DataValidationResult;
};
