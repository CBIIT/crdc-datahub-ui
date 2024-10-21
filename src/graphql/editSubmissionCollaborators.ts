import gql from "graphql-tag";

export const mutation = gql`
  mutation editSubmissionCollaborators($submissionID: ID!, $collaborators: [CollaboratorInput]) {
    editSubmissionCollaborators(submissionID: $submissionID, collaborators: $collaborators) {
      _id
      collaborators {
        collaboratorID
        collaboratorName
        permission
        Organization {
          orgID
          orgName
        }
      }
    }
  }
`;

export type Input = {
  submissionID: string;
  collaborators: CollaboratorInput[];
};

export type Response = {
  editSubmissionCollaborators: Submission;
};
