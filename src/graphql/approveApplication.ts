import gql from "graphql-tag";

export const mutation = gql`
  mutation approveApplication($id: ID!, $comment: String, $wholeProgram: Boolean) {
    approveApplication(_id: $id, wholeProgram: $wholeProgram, comment: $comment) {
      _id
    }
  }
`;

export type Response = {
  approveApplication: Pick<Application, "_id">;
};
