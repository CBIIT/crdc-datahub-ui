import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

export const mutation: TypedDocumentNode<Response, Input> = gql`
  mutation restoreApplication($_id: ID!, $comments: String!) {
    restoreApplication(_id: $_id, comments: $comments) {
      _id
    }
  }
`;

export type Input = {
  /**
   * ID of the application to restore
   */
  _id: string;
  /**
   * Justification for restoring the application
   */
  comments: string;
};

export type Response = {
  restoreApplication: Pick<Application, "_id">;
};
