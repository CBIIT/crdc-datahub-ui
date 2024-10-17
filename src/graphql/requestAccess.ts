import gql from "graphql-tag";

export const mutation = gql`
  mutation requestAccess($role: String!, $organization: String!, $additionalInfo: String) {
    requestAccess(role: $role, organization: $organization, additionalInfo: $additionalInfo) {
      success
      message
    }
  }
`;

export type Input = {
  /**
   * The role the user is requesting access for.
   */
  role: UserRole;
  /**
   * The organization (free text) the user is requesting access for.
   */
  organization: string;
  /**
   * Any additional contextual information the user wants to provide.
   */
  additionalInfo?: string;
};

export type Response = {
  requestAccess: AsyncProcessResult;
};
