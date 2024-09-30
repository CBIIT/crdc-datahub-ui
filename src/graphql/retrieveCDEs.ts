import gql from "graphql-tag";

export const query = gql`
  query retrieveCDEs($cdeInfo: [CDEInput!]!) {
    retrieveCDEs(CDEInfo: $cdeInfo) {
      _id
      CDEFullName
      CDECode
      CDEVersion
      PermissibleValues
      createdAt
      updatedAt
    }
  }
`;

export type Input = {
  cdeInfo: CDEInfo[];
};

export type Response = {
  retrieveCDEs: {
    _id: string;
    CDEFullName: string;
    CDECode: string;
    CDEVersion: string;
    PermissibleValues: string[];
    createdAt: string;
    updatedAt: string;
  }[];
};
