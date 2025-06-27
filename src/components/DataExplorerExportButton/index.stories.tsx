import { MockedResponse } from "@apollo/client/testing";
import type { Meta, StoryObj } from "@storybook/react";
import { userEvent, within } from "@storybook/test";
import { GraphQLError } from "graphql";

import {
  ListReleasedDataRecordsResponse,
  ListReleasedDataRecordsInput,
  LIST_RELEASED_DATA_RECORDS,
} from "../../graphql";

import Button, { DataExplorerExportButtonProps } from "./index";

const mockSuccessResponse: MockedResponse<
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
        total: 1,
        properties: ["parent.id", "data_file_type", "file_size", "file_name"],
        nodes: [
          {
            "parent.id": "mock-parent-id",
            data_file_type: "mock-file-type",
            file_size: 12345,
            file_name: "mock-file-name.txt",
          },
        ],
      },
    },
  },
};

const mockErrorResponse: MockedResponse<
  ListReleasedDataRecordsResponse,
  ListReleasedDataRecordsInput
> = {
  request: {
    query: LIST_RELEASED_DATA_RECORDS,
  },
  variableMatcher: () => true,
  result: {
    errors: [new GraphQLError("Mock error")],
  },
};

type CustomStoryProps = DataExplorerExportButtonProps;

const meta: Meta<CustomStoryProps> = {
  title: "Data Explorer / Export Metadata Button",
  component: Button,
  args: {
    studyId: "mock-study-id",
    studyDisplayName: "Mock Study",
    nodeType: "participant",
    dataCommonsDisplayName: "MOCK-DC",
    columns: [],
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
      mocks: [mockSuccessResponse],
    },
  },
};

export const Hovered: Story = {
  args: {
    ...meta.args,
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
