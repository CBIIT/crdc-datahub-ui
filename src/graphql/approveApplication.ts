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
        __typename
      }
      pi {
        firstName
        lastName
        position
        email
        institution
        eRAAccount
        address
        __typename
      }
      piAsPrimaryContact
      primaryContact {
        institution
        position
        firstName
        lastName
        email
        phone
        __typename
      }
      additionalContacts {
        institution
        position
        firstName
        lastName
        email
        phone
        __typename
      }
      program {
        name
        abbreviation
        description
        __typename
      }
      study {
        name
        abbreviation
        description
        publications {
          title
          pubmedID
          DOI
          __typename
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
        __typename
      }
      targetedSubmissionDate
      targetedReleaseDate
      timeConstraints {
        description
        effectiveDate
        __typename
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
        __typename
      }
      files {
        type
        count
        amount
        __typename
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
        __typename
      }
      applicantID
      applicantName
      organization
      __typename
    }
  }
`;

export type Response = {
  approveApplication: {
    _id: string;
  };
};
