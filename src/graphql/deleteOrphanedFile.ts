import gql from "graphql-tag";

export const mutation = gql`
  mutation deleteOrphanedFile($_id: ID!, $fileName: String!) {
    deleteOrphanedFile(_id: $_id, fileName: $fileName) {
      success
    }
  }
`;

export type Response = {
  deleteOrphanedFile: AsyncProcessResult;
};
