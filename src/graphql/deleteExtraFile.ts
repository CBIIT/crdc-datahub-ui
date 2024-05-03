import gql from "graphql-tag";

export const mutation = gql`
  mutation deleteExtraFile($_id: ID!) {
    deleteExtraFile(_id: $_id) {
      success
    }
  }
`;

export type Response = {
  deleteExtraFile: DataValidationResult;
};
