import type { Meta, StoryObj } from "@storybook/react";
import { MockedResponse } from "@apollo/client/testing";
import { userEvent, within } from "@storybook/testing-library";
import { fn } from "@storybook/test";
import Dialog from "./index";
import { SearchParamsProvider } from "../Contexts/SearchParamsContext";
import {
  DOWNLOAD_METADATA_FILE,
  DownloadMetadataFileInput,
  DownloadMetadataFileResp,
} from "../../graphql";

const mockBatch: Batch = {
  _id: "mock-batch-0001",
  displayID: 0,
  submissionID: "mock-submission-0001",
  type: "metadata",
  fileCount: 0,
  files: [],
  status: "Uploaded",
  errors: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockFile: BatchFileInfo = {
  filePrefix: "",
  fileName: "",
  nodeType: "",
  status: "Uploaded",
  errors: [],
  createdAt: "",
  updatedAt: "",
};

type CustomStoryProps = React.ComponentProps<typeof Dialog>;

const meta: Meta<CustomStoryProps> = {
  title: "Data Submissions / Batch File List",
  component: Dialog,
  args: {
    open: true,
  },
  decorators: [
    (Story) => (
      <SearchParamsProvider>
        <Story />
      </SearchParamsProvider>
    ),
  ],
  beforeEach: () => {
    window.open = fn(window.open).mockImplementation(
      (_) =>
        ({
          close: () => {},
        }) as Window
    );
  },
} satisfies Meta<CustomStoryProps>;

type Story = StoryObj<CustomStoryProps>;

const successDownloadMock: MockedResponse<DownloadMetadataFileResp, DownloadMetadataFileInput> = {
  request: {
    query: DOWNLOAD_METADATA_FILE,
  },
  variableMatcher: () => true,
  result: {
    data: {
      downloadMetadataFile: "https://example.com",
    },
  },
  maxUsageCount: Infinity,
};

/**
 * Default story for the FileListDialog component populated with data
 */
export const Populated: Story = {
  args: {
    ...meta.args,
    batch: {
      ...mockBatch,
      displayID: 3,
      fileCount: 5,
      files: [
        {
          ...mockFile,
          nodeType: "participant",
          fileName: "participant.tsv",
        },
        {
          ...mockFile,
          nodeType: "sample",
          fileName: "sample.tsv",
        },
        {
          ...mockFile,
          nodeType: "file",
          fileName: "file.tsv",
        },
        {
          ...mockFile,
          nodeType: "genomic_info",
          fileName: "genomic_info.tsv",
        },
        {
          ...mockFile,
          nodeType: "metadata",
          fileName: "metadata.tsv",
        },
      ],
    },
  },
  parameters: {
    apolloClient: {
      mocks: [successDownloadMock],
    },
  },
};

const failedDownloadMock: MockedResponse<DownloadMetadataFileResp, DownloadMetadataFileInput> = {
  request: {
    query: DOWNLOAD_METADATA_FILE,
  },
  variableMatcher: () => true,
  error: new Error("Mock Error"),
  delay: 1000,
  maxUsageCount: Infinity,
};

/**
 * Simulates a state where the Download buttons are enabled but a API issue occurs
 */
export const DownloadFailure: Story = {
  args: {
    ...Populated.args,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentElement);

    await userEvent.click(canvas.getByTestId("download-all-button"));
  },
  parameters: {
    apolloClient: {
      mocks: [failedDownloadMock],
    },
  },
};

/**
 * Simulates a state where the Download buttons should be hidden
 *
 * e.g. a Data File batch
 */
export const HiddenDownload: Story = {
  name: "Hidden Download (Data File)",
  args: {
    ...Populated.args,
    batch: {
      ...Populated.args.batch,
      type: "data file",
    },
  },
};

/**
 * Simulates a state where the Download buttons are disabled due to the batch status
 */
export const DisabledDownloadAll: Story = {
  name: "Disabled Download (All)",
  args: {
    ...Populated.args,
    batch: {
      ...Populated.args.batch,
      status: "Failed",
    },
  },
};

/**
 * Simulates a state where the a individual download is disabled due to the upload status
 */
export const DisabledDownloadIndividual: Story = {
  name: "Disabled Download (Individual)",
  args: {
    ...Populated.args,
    batch: {
      ...Populated.args.batch,
      files: [
        {
          ...mockFile,
          status: "Failed",
          nodeType: "genomic_info",
          fileName: "genomic_info.tsv",
        },
        {
          ...mockFile,
          nodeType: "metadata",
          fileName: "metadata.tsv",
        },
      ],
    },
  },
};

/**
 * Simulates a state where the batch has no files
 */
export const NoFiles: Story = {
  args: {
    ...meta.args,
    batch: {
      ...mockBatch,
      displayID: 11,
    },
  },
};

export default meta;
