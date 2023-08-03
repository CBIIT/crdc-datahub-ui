import gql from 'graphql-tag';

export const mutation = gql`
  mutation saveApplication($application: AppInput!) {
    saveApplication(application : $application) {
      _id
    }
  }
`;

export type Response = {
  saveApplication: Pick<Application, "_id">;
};
