import gql from 'graphql-tag';

export const query = gql`
  mutation updateMyUser ($userInfo: UpdateUserInput!) {
    updateMyUser (userInfo: $userInfo) {
      _id
      firstName
      lastName
    }
  }
`;

export type Response = {
  updateMyUser: User;
};
