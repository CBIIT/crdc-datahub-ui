import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

export const query: TypedDocumentNode<Response, Input> = gql`
  query getOrganizationData($orgID: ID!, $organization: String) {
    getOrganization(orgID: $orgID) {
      _id
      name
      abbreviation
      description
      status
      conciergeID
      conciergeName
      studies {
        _id
        studyName
        studyAbbreviation
      }
      readOnly
      createdAt
      updateAt
    }
    listSubmissions(
      first: -1
      offset: 0
      orderBy: "updatedAt"
      sortDirection: "ASC"
      organization: $organization
      status: "All"
    ) {
      submissions {
        _id
        studyAbbreviation
        status
      }
    }
  }
`;

export type Input = {
  orgID: string;
  organization: string;
};

export type Response = {
  /**
   * The organization that was requested
   */
  getOrganization: Organization;
  /**
   * Data Submissions for the organization
   */
  listSubmissions: {
    submissions: Pick<Submission, "_id" | "status" | "studyAbbreviation">[];
  };
};
