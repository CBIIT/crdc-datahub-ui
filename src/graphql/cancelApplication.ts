import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

export const mutation: TypedDocumentNode<Response, Input> = gql`
  mutation cancelApplication($_id: ID!, $reviewComments: String) {
    cancelApplication: deleteApplication(_id: $_id, reviewComments: $reviewComments) {
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
  reviewComments: string;
};

export type Response = {
  cancelApplication: Pick<Application, "_id">;
};
