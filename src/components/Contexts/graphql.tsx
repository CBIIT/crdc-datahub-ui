import gql from 'graphql-tag';

export const CREATE_APP = gql`
  mutation createApplication {
  createApplication{
      _id
  }
}
`;

export const GET_APP = gql`
query  getApplication($id: ID!){
    getApplication(_id:$id ) { 
    _id 
    sections { 
      name 
      status 
    } 
    pi { 
      firstName 
      lastName 
      position 
      email 
      institution 
      eRAAccount 
      address 
    } 
    primaryContact { 
      firstName 
      lastName 
      email 
      phone 
    } 
    additionalContacts { 
      role 
      firstName 
      lastName 
      email 
      phone 
    } 

    program { 
      title 
      abbreviation 
      description 
    } 

    study { 
      title 
      abbreviation 
      description 
      repositories { 
        name 
        studyID 
      } 
    } 

    funding { 
      agencies { 
        name 
        grantNumbers 
      } 
      nciProgramOfficer 
      nciGPA 
    } 

    accessPolicy 
    targetedReleaseDate 
    embargoInfo 
    cancerTypes 
    preCancerTypes 
    numberOfParticipants 
    species 
    dataTypes 
    clinicalData { 
      dataTypes 
      futureDataTypes 
    } 
    files { 
      type 
      count 
      amount 
    } 
    publications { 
      title 
      pubmedID 
      DOI 
    } 
    timeConstraints 
    submitterComment 
    status 
    programLevelApproval 
    reviewComment 
    createdAt 
    updatedAt 
    history { 
      status 
      reviewComment 
      dateTime 
      userID 
    } 
  } 
}
`;

export const SAVE_APP = gql`
mutation saveApplication($application: AppInput !) {
  saveApplication(application : $application) {
      _id
  }
}
`;

export const SUBMIT_APP = gql`
mutation submitApplication($id: ID!) {
  submitApplication(_id: $id) {
      _id
  }
}
`;
