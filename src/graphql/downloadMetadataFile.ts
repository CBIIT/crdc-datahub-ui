import { TypedDocumentNode } from "@apollo/client";
import gql from "graphql-tag";

export const mutation: TypedDocumentNode<Response, Input> = gql`
  mutation downloadMetadataFile($batchID: string!, $fileName: String) {
    downloadMetadataFile(batchID: $batchID, fileName: $fileName) {
      downloadMetadataFile
    }
  }
`;

export type Input = {
  /**
   * The ID of the Data Submission Batch to download the metadata file from
   */
  batchID: string;
  /**
   * The name of the metadata file to download. If null, entire batch will be downloaded.
   */
  fileName: string | null;
};

export type Response = {
  /**
   * The presigned URL for the requested individual metadata file or zip.
   */
  downloadMetadataFile: string;
};
