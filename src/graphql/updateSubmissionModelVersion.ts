import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

export const mutation: TypedDocumentNode<Response, Input> = gql`
  mutation updateSubmissionModelVersion($_id: String!, $version: String!) {
    updateSubmissionModelVersion(_id: $_id, version: $version) {
      _id
      modelVersion
    }
  }
`;

export type Input = {
  /**
   * ID of the submission to change the model version for
   */
  _id: string;
  /**
   * New model version to set
   */
  version: string;
};

export type Response = {
  updateSubmissionModelVersion: Pick<Submission, "_id" | "modelVersion">;
};
