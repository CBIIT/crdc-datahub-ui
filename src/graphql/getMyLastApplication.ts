import gql from 'graphql-tag';

export const query = gql`
  query getMyLastApplication {
    getMyLastApplication {
      _id
      questionnaire
    }
  }
`;

export type Response = {
  getMyLastApplication: Omit<ApplicationResponse, "questionnaire"> & {
    questionnaire: string
  };
};
