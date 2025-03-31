import { FC } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, waitFor, within } from "@testing-library/react";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import Dialog from "./index";
import { SearchParamsProvider } from "../Contexts/SearchParamsContext";
import {
  DownloadMetadataFileResp,
  DownloadMetadataFileInput,
  DOWNLOAD_METADATA_FILE,
} from "../../graphql";

const baseBatch: Batch = {
  _id: "mock-batch-id",
  displayID: 0,
  submissionID: "mock-submission-id",
  type: "metadata",
  fileCount: 0,
  files: [],
  status: "Uploading",
  errors: [],
  createdAt: "",
  updatedAt: "",
};

const baseBatchFileInfo: BatchFileInfo = {
  filePrefix: "",
  fileName: "",
  nodeType: "",
  status: "New",
  errors: [],
  createdAt: "",
  updatedAt: "",
};

type ParentProps = {
  mocks?: MockedResponse[];
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({ mocks = [], children }) => (
  <MemoryRouter basename="">
    <MockedProvider mocks={mocks}>
      <SearchParamsProvider>{children}</SearchParamsProvider>
    </MockedProvider>
  </MemoryRouter>
);

describe("Accessibility", () => {
  it("should have no violations (no files)", async () => {
    const { container, getByTestId } = render(
      <TestParent>
        <Dialog open batch={baseBatch} />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("generic-table")).toBeVisible();
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("should have no violations (with files)", async () => {
    const { container, getByTestId } = render(
      <TestParent>
        <Dialog
          open
          batch={{
            ...baseBatch,
            fileCount: 3,
            files: [
              { ...baseBatchFileInfo, fileName: "file1" },
              { ...baseBatchFileInfo, fileName: "file2" },
              { ...baseBatchFileInfo, fileName: "file3" },
            ],
          }}
        />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("generic-table")).toBeVisible();
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("should render without crashing", () => {
    const { getByTestId } = render(
      <TestParent>
        <Dialog open batch={baseBatch} />
      </TestParent>
    );

    expect(getByTestId("file-list-dialog")).toBeVisible();
  });

  it("should close the dialog when the 'Close' button is clicked", async () => {
    const mockOnClose = jest.fn();
    const { getByTestId } = render(
      <TestParent>
        <Dialog open batch={baseBatch} onClose={mockOnClose} />
      </TestParent>
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    userEvent.click(getByTestId("file-list-close-button"));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should close the dialog when the 'X' icon is clicked", async () => {
    const mockOnClose = jest.fn();
    const { getByTestId } = render(
      <TestParent>
        <Dialog open batch={baseBatch} onClose={mockOnClose} />
      </TestParent>
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    userEvent.click(getByTestId("file-list-close-icon"));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should close the dialog when the backdrop is clicked", async () => {
    const mockOnClose = jest.fn();
    const { getByTestId } = render(
      <TestParent>
        <Dialog open batch={baseBatch} onClose={mockOnClose} />
      </TestParent>
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    userEvent.click(getByTestId("file-list-dialog").firstChild as HTMLElement);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should handle the 'onClose' prop being undefined", async () => {
    const { getByTestId } = render(
      <TestParent>
        <Dialog open batch={baseBatch} />
      </TestParent>
    );

    expect(() => userEvent.click(getByTestId("file-list-close-button"))).not.toThrow();
  });

  it("should disable the file download buttons when downloading is in progress", async () => {
    const mock: MockedResponse<DownloadMetadataFileResp, DownloadMetadataFileInput> = {
      request: {
        query: DOWNLOAD_METADATA_FILE,
      },
      variableMatcher: () => true,
      result: {
        data: {
          downloadMetadataFile: null,
        },
      },
      delay: 3000,
    };

    const batch: Batch = {
      ...baseBatch,
      fileCount: 2,
      files: [
        { ...baseBatchFileInfo, fileName: "file1", nodeType: "participant" },
        { ...baseBatchFileInfo, fileName: "file2", nodeType: "sample" },
      ],
    };

    const { getByTestId } = render(<Dialog open batch={batch} />, {
      wrapper: ({ children }) => <TestParent mocks={[mock]}>{children}</TestParent>,
    });

    await waitFor(() => {
      expect(getByTestId("generic-table")).toBeVisible();
    });

    jest.useFakeTimers();

    userEvent.click(getByTestId("download-file2-button"));

    expect(getByTestId("download-file2-button")).toBeDisabled();
    expect(getByTestId("download-file1-button")).toBeDisabled();
    expect(getByTestId("download-all-button")).toBeDisabled();

    jest.advanceTimersByTime(3001); // Simulate the delay for the download to complete

    await waitFor(() => {
      expect(getByTestId("download-file2-button")).toBeEnabled();
    });

    expect(getByTestId("download-file1-button")).toBeEnabled();
    expect(getByTestId("download-all-button")).toBeEnabled();

    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it("should disable the download all button when there are no files to download", async () => {
    const batch: Batch = {
      ...baseBatch,
      fileCount: 0,
      files: [],
    };

    const { getByTestId } = render(<Dialog open batch={batch} />, {
      wrapper: ({ children }) => <TestParent>{children}</TestParent>,
    });

    expect(getByTestId("download-all-button")).toBeDisabled();
  });
});

describe("Implementation Requirements", () => {
  it("should indicate the batch displayID in the dialog title", () => {
    const { getByTestId } = render(
      <TestParent>
        <Dialog open batch={{ ...baseBatch, displayID: 123 }} />
      </TestParent>
    );

    expect(within(getByTestId("file-list-dialog")).getByText(/batch 123 file list/i)).toBeVisible();
  });

  it("should format the batch createdAt date in the dialog subtitle", () => {
    const { getByTestId } = render(
      <TestParent>
        <Dialog open batch={{ ...baseBatch, createdAt: "2024-06-26T18:11:57.484Z" }} />
      </TestParent>
    );

    expect(
      within(getByTestId("file-list-dialog")).getByText(/Uploaded on 6\/26\/2024 at 06:11 PM/)
    ).toBeVisible();
  });

  it("should display the correct number of files in the dialog", () => {
    const { getByTestId } = render(
      <TestParent>
        <Dialog
          open
          batch={{
            ...baseBatch,
            fileCount: 3,
            files: [
              { ...baseBatchFileInfo, fileName: "file1" },
              { ...baseBatchFileInfo, fileName: "file2" },
              { ...baseBatchFileInfo, fileName: "file3" },
            ],
          }}
        />
      </TestParent>
    );

    expect(within(getByTestId("file-list-dialog")).getByText("3 FILES")).toBeVisible();
  });

  it.each<[number, string]>([
    [0, "0 FILES"],
    [1, "1 FILE"],
    [2, "2 FILES"],
  ])("should use the correct pluralization for the file count", (count, expected) => {
    const { getByTestId } = render(
      <TestParent>
        <Dialog
          open
          batch={{
            ...baseBatch,
            fileCount: count,
            files: Array(count).fill(baseBatchFileInfo),
          }}
        />
      </TestParent>
    );

    expect(within(getByTestId("file-list-dialog")).getByText(expected)).toBeVisible();
  });

  it("should render the placeholder text when there are no files", () => {
    const { getByText } = render(
      <TestParent>
        <Dialog open batch={{ ...baseBatch, files: [], fileCount: 0 }} />
      </TestParent>
    );

    expect(getByText(/No files were uploaded./)).toBeInTheDocument();
  });

  it("should show a snackbar when download fails (GraphQL)", async () => {
    const mock: MockedResponse<DownloadMetadataFileResp, DownloadMetadataFileInput> = {
      request: {
        query: DOWNLOAD_METADATA_FILE,
      },
      variableMatcher: () => true,
      result: {
        errors: [new GraphQLError("An error occurred.")],
      },
    };

    const batch: Batch = {
      ...baseBatch,
      fileCount: 1,
      files: [{ ...baseBatchFileInfo, fileName: "file1", nodeType: "participant" }],
    };

    const { getByTestId } = render(<Dialog open batch={batch} />, {
      wrapper: ({ children }) => <TestParent mocks={[mock]}>{children}</TestParent>,
    });

    await waitFor(() => {
      expect(getByTestId("download-all-button")).toBeEnabled();
    });

    userEvent.click(getByTestId("download-all-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Download Failed: There was an issue with the download.",
        {
          variant: "error",
        }
      );
    });
  });

  it("should show a snackbar when download fails (Network)", async () => {
    const mock: MockedResponse<DownloadMetadataFileResp, DownloadMetadataFileInput> = {
      request: {
        query: DOWNLOAD_METADATA_FILE,
      },
      variableMatcher: () => true,
      error: new Error("Network error"),
    };

    const batch: Batch = {
      ...baseBatch,
      fileCount: 1,
      files: [{ ...baseBatchFileInfo, fileName: "file1", nodeType: "participant" }],
    };

    const { getByTestId } = render(<Dialog open batch={batch} />, {
      wrapper: ({ children }) => <TestParent mocks={[mock]}>{children}</TestParent>,
    });

    await waitFor(() => {
      expect(getByTestId("download-all-button")).toBeEnabled();
    });

    userEvent.click(getByTestId("download-all-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Download Failed: There was an issue with the download.",
        {
          variant: "error",
        }
      );
    });
  });

  it("should show a snackbar when download fails (API)", async () => {
    const mock: MockedResponse<DownloadMetadataFileResp, DownloadMetadataFileInput> = {
      request: {
        query: DOWNLOAD_METADATA_FILE,
      },
      variableMatcher: () => true,
      result: {
        data: {
          downloadMetadataFile: null, // Some non-expected response indicating failure
        },
      },
    };

    const batch: Batch = {
      ...baseBatch,
      fileCount: 1,
      files: [{ ...baseBatchFileInfo, fileName: "file1", nodeType: "participant" }],
    };

    const { getByTestId } = render(<Dialog open batch={batch} />, {
      wrapper: ({ children }) => <TestParent mocks={[mock]}>{children}</TestParent>,
    });

    await waitFor(() => {
      expect(getByTestId("download-all-button")).toBeEnabled();
    });

    userEvent.click(getByTestId("download-all-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Download Failed: There was an issue with the download.",
        {
          variant: "error",
        }
      );
    });
  });

  it("should open the presigned URL in a new tab", async () => {
    jest.spyOn(global, "open").mockImplementation(() => null);

    const mock: MockedResponse<DownloadMetadataFileResp, DownloadMetadataFileInput> = {
      request: {
        query: DOWNLOAD_METADATA_FILE,
      },
      variableMatcher: () => true,
      result: {
        data: {
          downloadMetadataFile: "https://example-url-here.com/file.xxz",
        },
      },
    };

    const batch: Batch = {
      ...baseBatch,
      fileCount: 1,
      files: [{ ...baseBatchFileInfo, fileName: "file1", nodeType: "participant" }],
    };

    const { getByTestId } = render(<Dialog open batch={batch} />, {
      wrapper: ({ children }) => <TestParent mocks={[mock]}>{children}</TestParent>,
    });

    await waitFor(() => {
      expect(getByTestId("download-all-button")).toBeEnabled();
    });

    userEvent.click(getByTestId("download-all-button"));

    await waitFor(() => {
      expect(global.open).toHaveBeenCalledWith(
        "https://example-url-here.com/file.xxz",
        "_blank",
        "noopener"
      );
      expect(global.open).toHaveBeenCalledTimes(1);
    });
  });
});
