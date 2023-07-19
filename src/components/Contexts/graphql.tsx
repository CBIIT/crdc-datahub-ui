import gql from 'graphql-tag';

export const GET_USER = gql`
  query getMyUser {
    getMyUser {
      _id
      firstName
      lastName
      userStatus
      role
      IDP
      email
      createdAt
      updateAt
    }
  }
`;

export type GET_USER_Resp = {
  getMyUser: User;
};
