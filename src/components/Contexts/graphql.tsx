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
    piAsPrimaryContact
    primaryContact {
      role
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
      name
      abbreviation
      description
    }
    study {
      name
      abbreviation
      description
      publications {
        title
        pubmedID
        DOI
      }
      plannedPublications {
        title
        expectedDate
      }
      repositories {
        name
        studyID
        submittedDate
      }
      funding {
        agencies
        grantNumbers
        nciProgramOfficer
        nciGPA
      }
    }
    accessTypes
    targetedSubmissionDate
    targetedReleaseDate
    timeConstraints {
      description
      effectiveDate
    }
    cancerTypes
    otherCancerTypes
    preCancerTypes
    otherPreCancerTypes
    numberOfParticipants
    species
    cellLines
    modelSystems
    dataTypes
    otherDataTypes
    clinicalData {
      dataTypes
      otherDataTypes
      futureDataTypes
    }
    files {
      type
      count
      amount
    }
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
    applicantID
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
