import gql from 'graphql-tag';

export const mutation = gql`
  mutation exportSubmission($_id: ID!) {
    exportSubmission(_id: $_id) {
      success
    }
  }
`;

export type Response = {
  exportSubmission: Pick<AsyncProcessResult, "success">;
};
