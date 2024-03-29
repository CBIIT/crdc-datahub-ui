import gql from "graphql-tag";

export const mutation = gql`
  mutation createSubmission(
    $studyAbbreviation: String!
    $dataCommons: String!
    $name: String!
    $dbGaPID: String
    $intention: String!
  ) {
    createSubmission(
      studyAbbreviation: $studyAbbreviation
      dataCommons: $dataCommons
      name: $name
      dbGaPID: $dbGaPID
      intention: $intention
    ) {
      _id
      status
      createdAt
    }
  }
`;

export type Response = {
  createSubmission: Pick<Submission, "_id" | "status" | "createdAt">;
};
