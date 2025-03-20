import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

export const mutation: TypedDocumentNode<Response, Input> = gql`
  mutation cancelApplication($_id: ID!, $comments: String!) {
    cancelApplication: deleteApplication(_id: $_id, comments: $comments) {
      _id
    }
  }
`;

export type Input = {
  /**
   * ID of the application to cancel
   */
  _id: string;
  /**
   * Justification for canceling the application
   */
  comments: string;
};

export type Response = {
  cancelApplication: Pick<Application, "_id">;
};
