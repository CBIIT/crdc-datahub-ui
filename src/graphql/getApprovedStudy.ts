import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

const BaseApprovedStudyFragment = gql`
  fragment ApprovedStudy on ApprovedStudy {
    _id
    studyName
    studyAbbreviation
    dbGaPID
    controlledAccess
    openAccess
    createdAt
  }
`;

// TODO: Add programID
const ExtendedApprovedStudyFragment = gql`
  fragment ExtendedApprovedStudy on ApprovedStudy {
    PI
    ORCID
    primaryContact {
      _id
      firstName
      lastName
    }
    programs {
      _id
      name
      conciergeID
      conciergeName
    }
    useProgramPC
    pendingModelChange
    GPAName
    isPendingGPA
  }
`;

export const query: TypedDocumentNode<Response<unknown>, Input> = gql`
  query getApprovedStudy($_id: ID!, $partial: Boolean = false) {
    getApprovedStudy(_id: $_id) {
      ...ApprovedStudy
      ...ExtendedApprovedStudy @skip(if: $partial)
    }
  }
  ${BaseApprovedStudyFragment}
  ${ExtendedApprovedStudyFragment}
`;

export type Input = {
  /**
   * The ID of the approved study to retrieve
   */
  _id: string;
  /**
   * If true, the query will return only top-level fields
   *
   * @default false
   */
  partial?: boolean;
};

export type Response<PartialResponse = false> = {
  getApprovedStudy: PartialResponse extends true
    ? Pick<
        ApprovedStudy,
        | "_id"
        | "studyName"
        | "studyAbbreviation"
        | "dbGaPID"
        | "controlledAccess"
        | "openAccess"
        | "createdAt"
      >
    : Pick<
        ApprovedStudy,
        | "_id"
        | "studyName"
        | "studyAbbreviation"
        | "dbGaPID"
        | "controlledAccess"
        | "openAccess"
        | "PI"
        | "ORCID"
        | "programID"
        | "createdAt"
        | "useProgramPC"
        | "pendingModelChange"
        | "GPAName"
      > & {
        primaryContact: Pick<User, "_id" | "firstName" | "lastName">;
        programs: Pick<Organization, "_id" | "name" | "conciergeID" | "conciergeName">[];
      };
};
