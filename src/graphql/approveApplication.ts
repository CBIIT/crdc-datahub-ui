import gql from "graphql-tag";

export const mutation = gql`
  mutation approveApplication(
    $id: ID!
    $comment: String
    $wholeProgram: Boolean
    $institutions: [String]
  ) {
    approveApplication(
      _id: $id
      wholeProgram: $wholeProgram
      comment: $comment
      institutions: $institutions
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
};

export type Response = {
  approveApplication: Pick<Application, "_id">;
};
