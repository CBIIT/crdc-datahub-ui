import gql from "graphql-tag";

export const mutation = gql`
  mutation editUser(
    $userID: ID!
    $organization: String
    $userStatus: String
    $role: String
    $studies: [String]
    $dataCommons: [String]
  ) {
    editUser(
      userID: $userID
      organization: $organization
      status: $userStatus
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

export type Input = {
  userID: User["_id"];
  organization: string;
} & Pick<User, "userStatus" | "role" | "dataCommons" | "studies">;

export type Response = {
  editUser: Pick<User, "userStatus" | "role" | "dataCommons" | "organization">;
};
