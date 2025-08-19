import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

export const mutation: TypedDocumentNode<Response, Input> = gql`
  mutation updateSubmissionName($_id: String!, $name: String!) {
    updateSubmissionName(_id: $_id, name: $name) {
      _id
      name
    }
  }
`;

export type Input = {
  _id: string;
  name: string;
};

export type Response = {
  updateSubmissionName: Pick<Submission, "_id" | "name">;
};
