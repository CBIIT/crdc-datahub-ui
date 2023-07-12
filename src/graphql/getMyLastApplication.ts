import gql from 'graphql-tag';

export const query = gql`
  query getMyLastApplication {
    getMyLastApplication {
        _id
        pi {
          firstName
          lastName
          position
          email
          institution
          eRAAccount
          address
        }
        program {
          name
          abbreviation
          description
        }
        study {
          name
          abbreviation
          description
        }
    }
  }
`;

export type Response = {
  getMyLastApplication: RecursivePartial<Application>;
};
