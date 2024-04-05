import gql from "graphql-tag";

export const mutation = gql`
  mutation editUser(
    $userID: ID!
    $organization: String
    $status: String
    $role: String
    $dataCommons: [String]
  ) {
    editUser(
      userID: $userID
      organization: $organization
      status: $status
      role: $role
      dataCommons: $dataCommons
    ) {
      userStatus
      role
      dataCommons
      organization {
        orgID
        orgName
        createdAt
        updateAt
      }
    }
  }
`;

export type Response = {
  editUser: Pick<User, "userStatus" | "role" | "dataCommons" | "organization">;
};
