import gql from 'graphql-tag';

export const mutation = gql`
  mutation updateMyUser ($userInfo: UpdateUserInput!) {
    updateMyUser(userInfo: $userInfo) {
      _id
    }
  }
`;

export type Response = {
  updateMyUser: User["_id"];
};
