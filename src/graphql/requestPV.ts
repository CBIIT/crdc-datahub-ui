import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

export const REQUEST_PV: TypedDocumentNode<RequestPVResponse, RequestPVInput> = gql`
  mutation requestPV(
    $submissionID: String!
    $value: String!
    $nodeName: String!
    $property: String!
    $comment: String
    $CDEId: String
  ) {
    requestPV(
      submissionID: $submissionID
      value: $value
      nodeName: $nodeName
      property: $property
      comment: $comment
      CDEId: $CDEId
    ) {
      success
      message
    }
  }
`;

export type RequestPVInput = {
  /**
   * The ID of the submission to request a new permissible value for.
   */
  submissionID: string;
  /**
   * The value of the permissible value being requested.
   */
  value: string;
  /**
   * The name of the node for which the PV is being requested.
   */
  nodeName: string;
  /**
   * The property of the node to which the PV applies.
   */
  property: string;
  /**
   * An optional comment explaining the request.
   */
  comment?: string;
  /**
   * An optional CDE ID associated with the request.
   *
   * @note Unknown what this is for.
   */
  CDEId?: string;
};

export type RequestPVResponse = {
  requestPV: AsyncProcessResult;
};
