import gql from "graphql-tag";

export const mutation = gql`
  mutation deleteAllOrphanedFiles($_id: ID!) {
    deleteAllOrphanedFiles(_id: $_id) {
      success
    }
  }
`;

export type Response = {
  deleteAllOrphanedFiles: AsyncProcessResult;
};
