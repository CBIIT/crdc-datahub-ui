import { MockedResponse } from "@apollo/client/testing";
import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/test";
import { GraphQLError } from "graphql";

import {
  GET_RELEASED_NODE_TYPES,
  GetReleasedNodeTypesInput,
  GetReleasedNodeTypesResp,
  LIST_RELEASED_DATA_RECORDS,
  ListReleasedDataRecordsInput,
  ListReleasedDataRecordsResponse,
  RETRIEVE_PROPS_FOR_NODE_TYPE,
  RetrievePropsForNodeTypeInput,
  RetrievePropsForNodeTypeResp,
} from "../../graphql";

import Button, { DataExplorerExportAllButtonProps } from "./index";

const mockNodeTypesResponse: MockedResponse<GetReleasedNodeTypesResp, GetReleasedNodeTypesInput> = {
  request: {
    query: GET_RELEASED_NODE_TYPES,
  },
  variableMatcher: () => true,
  result: {
    data: {
      getReleaseNodeTypes: {
        nodes: [
          { name: "participant", IDPropName: "participant_id", count: 100 },
          { name: "sample", IDPropName: "sample_id", count: 150 },
          { name: "file", IDPropName: "file_id", count: 300 },
        ],
      },
    },
  },
};

const mockNodePropsResponse: MockedResponse<
  RetrievePropsForNodeTypeResp,
  RetrievePropsForNodeTypeInput
> = {
  request: {
    query: RETRIEVE_PROPS_FOR_NODE_TYPE,
  },
  variableMatcher: () => true,
  result: {
    data: {
      retrievePropsForNodeType: [
        { name: "id", required: true, group: "model_defined" },
        { name: "age", required: false, group: "model_defined" },
        { name: "gender", required: false, group: "model_defined" },
        { name: "diagnosis", required: false, group: "model_defined" },
      ],
    },
  },
};

const mockDataResponse: MockedResponse<
  ListReleasedDataRecordsResponse,
  ListReleasedDataRecordsInput
> = {
  request: {
    query: LIST_RELEASED_DATA_RECORDS,
  },
  variableMatcher: () => true,
  result: {
    data: {
      listReleasedDataRecords: {
        total: 3,
        nodes: [
          {
            id: "P001",
            age: 45,
            gender: "Female",
            diagnosis: "Breast Cancer",
          },
          {
            id: "P002",
            age: 52,
            gender: "Male",
            diagnosis: "Lung Cancer",
          },
          {
            id: "P003",
            age: 38,
            gender: "Female",
            diagnosis: "Ovarian Cancer",
          },
        ],
      },
    },
  },
};

const mockErrorResponse: MockedResponse<GetReleasedNodeTypesResp, GetReleasedNodeTypesInput> = {
  request: {
    query: GET_RELEASED_NODE_TYPES,
  },
  variableMatcher: () => true,
  result: {
    errors: [new GraphQLError("Failed to fetch node types")],
  },
};

type CustomStoryProps = DataExplorerExportAllButtonProps;

const meta: Meta<CustomStoryProps> = {
  title: "Data Explorer / Export All Metadata Button",
  component: Button,
  args: {
    studyId: "mock-study-id",
    studyAbbreviation: "CMB",
    dataCommonsDisplayName: "MOCK-DC",
  },
  tags: ["autodocs"],
} satisfies Meta<CustomStoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ...meta.args,
  },
  parameters: {
    apolloClient: {
      mocks: [mockNodeTypesResponse, mockNodePropsResponse, mockDataResponse],
    },
  },
};

export const Hovered: Story = {
  args: {
    ...meta.args,
  },
  parameters: {
    apolloClient: {
      mocks: [mockNodeTypesResponse, mockNodePropsResponse, mockDataResponse],
    },
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button");

    userEvent.hover(button);
  },
};

export const Disabled: Story = {
  args: {
    ...meta.args,
    disabled: true,
  },
  parameters: {
    apolloClient: {
      mocks: [mockNodeTypesResponse, mockNodePropsResponse, mockDataResponse],
    },
  },
};

export const ExportError: Story = {
  args: {
    ...meta.args,
  },
  parameters: {
    apolloClient: {
      mocks: [mockErrorResponse],
    },
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button");

    userEvent.click(button);
  },
};

export const SuccessfulExport: Story = {
  args: {
    ...meta.args,
  },
  parameters: {
    apolloClient: {
      mocks: [mockNodeTypesResponse, mockNodePropsResponse, mockDataResponse],
    },
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button");

    userEvent.click(button);
  },
};
