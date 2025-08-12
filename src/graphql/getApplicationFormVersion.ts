import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

export const GET_APPLICATION_FORM_VERSION: TypedDocumentNode<GetApplicationFormVersionResp> = gql`
  query getApplicationFormVersion {
    # TODO: Once the typo is fixed, remove the alias
    getApplicationFormVersion: getApplicationFromVersion {
      _id
      version: new
    }
  }
`;

export type GetApplicationFormVersionResp = {
  getApplicationFormVersion: {
    /**
     * The UUIDv4 of the form version configuration
     */
    _id: string;
    /**
     * The form version for all new forms.
     */
    version: string;
  };
};
