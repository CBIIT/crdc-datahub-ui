import gql from 'graphql-tag';

export const query = gql`
  query getApplication($id: ID!) {
    getApplication(_id : $id) {
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
        address
      }
      piAsPrimaryContact
      primaryContact {
        firstName
        lastName
        email
        phone
        position
        institution
      }
      additionalContacts {
        firstName
        lastName
        email
        phone
        position
        institution
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
        isDbGapRegistered
        dbGaPPPHSNumber
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
      applicant {
        applicantID
        applicantName
      }
    }
  }
`;

export type Response = {
  getApplication: Application;
};
