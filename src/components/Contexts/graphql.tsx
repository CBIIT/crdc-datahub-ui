import gql from 'graphql-tag';

export const CREATE_APP = gql`
  mutation createApplication {
  createApplication{
      _id
  }
}
`;

export const SAVE_APP = gql`
mutation saveApplication($application: AppInput !) {
  saveApplication(application : $application) {
      _id
  }
}
`;

export const SUBMIT_APP = gql`
mutation submitApplication($id: ID!) {
  submitApplication(_id: $id) {
      _id
  }
}
`;
