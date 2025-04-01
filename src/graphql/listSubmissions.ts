import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

export const query: TypedDocumentNode<Response, Input> = gql`
  query listSubmissions(
    $organization: String
    $status: [String]
    $dataCommons: String
    $name: String
    $dbGaPID: String
    $submitterName: String
    $first: Int
    $offset: Int
    $orderBy: String
    $sortDirection: String
  ) {
    listSubmissions(
      organization: $organization
      status: $status
      dataCommons: $dataCommons
      name: $name
      dbGaPID: $dbGaPID
      submitterName: $submitterName
      first: $first
      offset: $offset
      orderBy: $orderBy
      sortDirection: $sortDirection
    ) {
      total
      submissions {
        _id
        name
        submitterName
        dataCommons
        organization {
          name
        }
        studyAbbreviation
        dbGaPID
        modelVersion
        status
        archived
        conciergeName
        nodeCount
        createdAt
        updatedAt
        intention
      }
      organizations {
        _id
        name
      }
      submitterNames
      dataCommons
    }
  }
`;

export type Input = {
  organization?: string;
  status?: SubmissionStatus[];
  dataCommons?: string;
  name?: string;
  dbGaPID?: string;
  submitterName?: string;
  first: number;
  offset: number;
  orderBy: string;
  sortDirection: Order;
};

export type Response = {
  listSubmissions: {
    total: number;
    submissions: Pick<
      Submission,
      | "_id"
      | "name"
      | "submitterName"
      | "dataCommons"
      | "organization"
      | "studyAbbreviation"
      | "dbGaPID"
      | "modelVersion"
      | "status"
      | "archived"
      | "conciergeName"
      | "nodeCount"
      | "createdAt"
      | "updatedAt"
      | "intention"
    >[];
    organizations: Pick<Organization, "_id" | "name">[];
    submitterNames: string[];
    dataCommons: string[];
  };
};
