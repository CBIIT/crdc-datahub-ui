import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

export const query: TypedDocumentNode<Response> = gql`
  query retrieveOMBDetails {
    retrieveOMBDetails {
      ombNumber
      expirationDate
      content
    }
  }
`;

export type Response = {
  retrieveOMBDetails: {
    ombNumber: string;
    expirationDate: string;
    content: string[];
  };
};
