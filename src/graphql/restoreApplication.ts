import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

export const mutation: TypedDocumentNode<Response, Input> = gql`
  mutation restoreApplication($_id: ID!) {
    restoreApplication(_id: $_id) {
      _id
    }
  }
`;

export type Input = {
  /**
   * ID of the application to restore
   */
  _id: string;
};

export type Response = {
  restoreApplication: Pick<Application, "_id">;
};
