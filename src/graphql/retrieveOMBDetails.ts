import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

export const RETRIEVE_OMB_DETAILS: TypedDocumentNode<RetrieveOMBDetailsResp> = gql`
  query retrieveOMBDetails {
    retrieveOMBDetails {
      ombNumber
      expirationDate
      content
    }
  }
`;

export type RetrieveOMBDetailsResp = {
  retrieveOMBDetails: {
    ombNumber: string;
    expirationDate: string;
    content: string[];
  };
};
