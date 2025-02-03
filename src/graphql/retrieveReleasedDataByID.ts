import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

export const query: TypedDocumentNode<Response, Input> = gql`
  query retrieveReleasedDataByID(
    $submissionId: String!
    $nodeType: String!
    $nodeId: String!
    $status: String! = "Released"
  ) {
    retrieveReleasedDataByID(
      submissionID: $submissionId
      nodeType: $nodeType
      nodeID: $nodeId
      status: $status
    ) {
      _id
      CRDC_ID
      submissionID
      status
      dataCommons
      studyID
      nodeType
      nodeID
      props
      entityType
      createdAt
      updatedAt
    }
  }
`;

export type Input = {
  submissionId: string;
  nodeType: string;
  nodeId: string;
  status?: string;
};

export type Response = {
  // TODO: abstract data type
  retrieveReleasedDataByID: {
    _id: string;
    CRDC_ID: string;
    submissionID: string;
    status: string;
    dataCommons: string;
    studyID: string;
    nodeType: string;
    nodeID: string;
    props: string;
    entityType: string;
    createdAt: string;
    updatedAt: string;
  };
};
