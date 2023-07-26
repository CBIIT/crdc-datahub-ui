import gql from "graphql-tag";

export const mutation = gql`
  mutation approveApplication(
    $id: ID!
    $comment: String
    $wholeProgram: Boolean
  ) {
    approveApplication(
      _id: $id
      wholeProgram: $wholeProgram
      comment: $comment
    ) {
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
      imagingDataDeIdentified
      dataDeIdentified
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
  approveApplication: {
    _id: string;
  };
};
