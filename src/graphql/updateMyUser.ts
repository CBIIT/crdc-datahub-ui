import gql from "graphql-tag";

export const mutation = gql`
  mutation updateMyUser($userInfo: UpdateUserInput!) {
    updateMyUser(userInfo: $userInfo) {
      firstName
      lastName
      userStatus
      role
      # TODO: Uncomment
      # studies
      organization {
        orgID
        orgName
        createdAt
        updateAt
      }
    }
  }
`;

export type Input = {
  userInfo: {
    firstName: string;
    lastName: string;
  };
};

export type Response = {
  updateMyUser: Pick<User, "firstName" | "lastName" | "userStatus" | "role" | "organization">;
};
