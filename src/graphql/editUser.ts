import gql from "graphql-tag";

export const mutation = gql`
  mutation editUser(
    $userID: ID!
    $userStatus: String
    $role: String
    $studies: [String]
    $dataCommons: [String]
  ) {
    editUser(
      userID: $userID
      status: $userStatus
      role: $role
      studies: $studies
      dataCommons: $dataCommons
    ) {
      userStatus
      role
      dataCommons
      studies {
        _id
        studyName
        studyAbbreviation
        dbGaPID
        controlledAccess
      }
    }
  }
`;

export type Input = {
  /**
   * The UUIDv4 identifier of the user account
   */
  userID: User["_id"];
  /**
   * An array of studyIDs to assign to the user
   */
  studies: string[];
} & Pick<User, "userStatus" | "role" | "dataCommons">;

export type Response = {
  editUser: Pick<User, "userStatus" | "role" | "dataCommons"> & {
    studies: Pick<
      ApprovedStudy,
      "_id" | "studyName" | "studyAbbreviation" | "dbGaPID" | "controlledAccess"
    >[];
  };
};
