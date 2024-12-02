import gql from "graphql-tag";

export const mutation = gql`
  mutation requestAccess($role: String!, $studies: String!, $additionalInfo: String) {
    requestAccess(role: $role, studies: $studies, additionalInfo: $additionalInfo) {
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
   * The list of approved study ID's the user is requesting access for.
   */
  studies: string[];
  /**
   * Any additional contextual information the user wants to provide.
   */
  additionalInfo?: string;
};

export type Response = {
  requestAccess: AsyncProcessResult;
};
