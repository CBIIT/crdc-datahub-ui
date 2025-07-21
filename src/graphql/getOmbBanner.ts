import { gql } from "@apollo/client";

export const query = gql`
  query getOmbBanner {
    getOmbBanner {
      ombNumber
      expirationDate
      content
    }
  }
`;

export type Response = {
  getOmbBanner: {
    ombNumber: string;
    expirationDate: string;
    content: string;
  };
};
