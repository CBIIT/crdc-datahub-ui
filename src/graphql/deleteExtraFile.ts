import gql from "graphql-tag";

export const mutation = gql`
  mutation deleteExtraFile($_id: ID!, $fileName: String!) {
    deleteExtraFile(_id: $_id, fileName: $fileName) {
      success
    }
  }
`;

export type Response = {
  deleteExtraFile: DataValidationResult;
};
