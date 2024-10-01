import gql from "graphql-tag";

export const mutation = gql`
  mutation createSubmission(
    $studyID: String!
    $dataCommons: String!
    $name: String!
    $dbGaPID: String
    $intention: String!
    $dataType: String!
  ) {
    createSubmission(
      studyID: $studyID
      dataCommons: $dataCommons
      name: $name
      dbGaPID: $dbGaPID
      intention: $intention
      dataType: $dataType
    ) {
      _id
      status
      createdAt
    }
  }
`;

export type Input = {
  studyID: string;
  dataCommons: string;
  name: string;
  dbGaPID: string | null;
  intention: SubmissionIntention;
  dataType: SubmissionDataType;
};

export type Response = {
  createSubmission: Pick<Submission, "_id" | "status" | "createdAt">;
};
