import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

// TODO: THIS IS JUST A PLACEHOLDER. NO API SCHEMA DEFINITION YET.

export const GET_MAINTENANCE_MODE: TypedDocumentNode<Response, null> = gql`
  query maintenanceMode {
    maintenanceMode
  }
`;

export type GetMaintenanceModeResponse = {
  /**
   * Whether the application is currently in maintenance mode.
   */
  maintenanceMode: boolean;
};
