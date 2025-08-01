import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

// TODO: This is just a placeholder for the actual implementation
export const RETRIEVE_FORM_VERSION: TypedDocumentNode<RetrieveFormVersionResp> = gql`
  # TODO: Rename query and filename to match the actual GraphQL query
  query getFormVersion {
    getFormVersion: getOMB {
      formVersion: OMBNumber
    }
  }
`;

export type RetrieveFormVersionResp = {
  getFormVersion: {
    formVersion: string;
  };
};
