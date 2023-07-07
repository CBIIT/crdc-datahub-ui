import { gql } from '@apollo/client';

const GET_USER = gql`
  query getMyUser {
    user {
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

export default GET_USER;
