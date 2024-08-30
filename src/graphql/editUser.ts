import gql from "graphql-tag";

export const mutation = gql`
  mutation editUser(
    $userID: ID!
    $organization: String
    $status: String
    $role: String
    $studies: [String]
    $dataCommons: [String]
  ) {
    editUser(
      userID: $userID
      organization: $organization
      status: $status
      role: $role
      studies: $studies
      dataCommons: $dataCommons
    ) {
      userStatus
      role
      dataCommons
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

export type Response = {
  editUser: Pick<User, "userStatus" | "role" | "dataCommons" | "organization">;
};
