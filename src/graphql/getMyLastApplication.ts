import gql from 'graphql-tag';

export const query = gql`
  query getMyLastApplication {
    getMyLastApplication {
      _id
      questionnaireData
    }
  }
`;

export type Response = {
  getMyLastApplication: {
    _id: Application["_id"];
    questionnaireData: string; // Cast to QuestionnaireData
  };
};
