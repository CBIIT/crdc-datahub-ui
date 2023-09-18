import gql from 'graphql-tag';

export const mutation = gql`
    mutation createDataSubmission ($studyAbbreviation: String, $dataCommons: String, $name: String, $dbGapID: String){
        createDataSubmission(studyAbbreviation : $studyAbbreviation, dataCommons : $dataCommons, name : $name, dbGapID: $dbGapID) {
            _id
            status
            createdAt
        }
    }
`;

export type Response = {
  createDataSubmission: Pick<DataSubmission, "_id" | "status" | "createdAt">;
};
