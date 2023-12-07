import gql from 'graphql-tag';

export const mutation = gql`
  mutation validateSubmission($_id: ID!, $types: [String], $scope: String) {
    validateSubmission(_id: $_id, types: $types, scope: $scope)
  }
`;

export type Response = {
  /**
   * The boolean result of the validation
   *
   * If the validation is successful, the result will be "true"
   * If the validation is unsuccessful, the result will be "false"
   */
  validateSubmission: string;
};
