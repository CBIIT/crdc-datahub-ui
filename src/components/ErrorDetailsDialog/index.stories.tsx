import type { Meta, StoryObj } from "@storybook/react";
import { MockedResponse } from "@apollo/client/testing";
import Dialog from "./index";
import {
  RETRIEVE_RELEASED_DATA,
  RetrieveReleasedDataInput,
  RetrieveReleasedDataResp,
} from "../../graphql";

const meta = {
  title: "Dialogs / Error Details",
  component: Dialog,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    header: "Dialog Pre-Title",
    title: "Error Details",
    errors: ["Lorem ipsum dolor", "sit ame, consectetur."],
    closeText: "Close",
  },
};

const mockReleasedDataQuery: MockedResponse<RetrieveReleasedDataResp, RetrieveReleasedDataInput> = {
  request: {
    query: RETRIEVE_RELEASED_DATA,
  },
  variableMatcher: () => true,
  result: {
    data: {
      retrieveReleasedDataByID: [
        {
          nodeType: "mock-node-type",
          nodeID: "mock_node_id",
          props: JSON.stringify({
            mock_node_data_name: "foo",
            baz: 1,
            bool_value: true,
            more_cols: "Yes that is true",
          }),
        },
        {
          nodeType: "mock-node-type",
          nodeID: "mock_node_id",
          props: JSON.stringify({
            mock_node_data_name: "bar",
            baz: 2,
            bool_value: false,
            more_cols: "No that is false",
          }),
        },
      ],
    },
  },
};

export const WithComparisonData: Story = {
  args: {
    open: true,
    header: "Dialog Pre-Title",
    title: "Error Details",
    errors: ["Lorem ipsum dolor", "sit ame, consectetur."],
    closeText: "Close",
    comparisonData: {
      submissionID: "mock-submission-id",
      nodeType: "mock-node-type",
      submittedID: "mock-node-id",
    },
  },
  parameters: {
    apolloClient: {
      mocks: [mockReleasedDataQuery],
    },
  },
};

const mockReleasedDataFailure: MockedResponse<RetrieveReleasedDataResp, RetrieveReleasedDataInput> =
  {
    request: {
      query: RETRIEVE_RELEASED_DATA,
    },
    variableMatcher: () => true,
    error: new Error("GraphQL error"),
  };

export const WithComparisonDataError: Story = {
  name: "With Comparison Data (Error)",
  args: {
    open: true,
    header: "Dialog Pre-Title",
    title: "Error Details",
    errors: ["Lorem ipsum dolor", "sit ame, consectetur adipiscing elit."],
    closeText: "Close",
    comparisonData: {
      submissionID: "mock-submission-id",
      nodeType: "mock-node-type",
      submittedID: "mock-node-id",
    },
  },
  parameters: {
    apolloClient: {
      mocks: [mockReleasedDataFailure],
    },
  },
};
