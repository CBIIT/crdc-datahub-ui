import gql from "graphql-tag";

export const mutation = gql`
  mutation approveApplication(
    $id: ID!
    $comment: String
    $wholeProgram: Boolean
    $institutions: [String]
    $pendingModelChange: Boolean
  ) {
    approveApplication(
      _id: $id
      wholeProgram: $wholeProgram
      comment: $comment
      institutions: $institutions
      pendingModelChange: $pendingModelChange
    ) {
      _id
    }
  }
`;

export type Input = {
  id: string;
  comment: string;
  wholeProgram: boolean;
  institutions: string[];
  pendingModelChange: boolean;
};

export type Response = {
  approveApplication: Pick<Application, "_id">;
};
