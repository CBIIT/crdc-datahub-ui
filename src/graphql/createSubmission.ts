import gql from 'graphql-tag';

export const mutation = gql`
    mutation createSubmission ($studyAbbreviation: String!, $dataCommons: String!, $name: String!, $dbGaPID: String){
        createSubmission(studyAbbreviation : $studyAbbreviation, dataCommons : $dataCommons, name : $name, dbGaPID: $dbGaPID) {
            _id
            status
            createdAt
        }
    }
`;

export type Response = {
  createSubmission: Pick<Submission, "_id" | "status" | "createdAt">;
};
