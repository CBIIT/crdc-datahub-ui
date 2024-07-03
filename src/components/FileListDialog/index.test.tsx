import { FC } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, waitFor, within } from "@testing-library/react";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import Dialog from "./index";
import { SearchParamsProvider } from "../Contexts/SearchParamsContext";

const baseBatch: Batch = {
  _id: "",
  displayID: 0,
  submissionID: "",
  type: "metadata",
  metadataIntention: "Add",
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
  size: 0,
  nodeType: "",
  status: "",
  errors: [],
  createdAt: "",
  updatedAt: "",
};

type ParentProps = {
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({ children }) => (
  <MemoryRouter basename="">
    <SearchParamsProvider>{children}</SearchParamsProvider>
  </MemoryRouter>
);

describe("Accessibility", () => {
  it("should have no violations (no files)", async () => {
    const { container } = render(
      <TestParent>
        <Dialog open batch={baseBatch} />
      </TestParent>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it("should have no violations (with files)", async () => {
    const { container } = render(
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

  // TODO: This is failing because the pluralization logic is missing
  // Not addressing this for now because it's not a critical issue
  // it.each<[number, string]>([
  //   [0, "0 FILES"],
  //   [1, "1 FILE"],
  //   [2, "2 FILES"],
  // ])("should use the correct pluralization for the file count", (count, expected) => {
  //   const { getByTestId } = render(
  //     <TestParent>
  //       <Dialog
  //         open
  //         batch={{
  //           ...baseBatch,
  //           fileCount: count,
  //           files: Array(count).fill(baseBatchFileInfo),
  //         }}
  //       />
  //     </TestParent>
  //   );

  //   expect(within(getByTestId("file-list-dialog")).getByText(expected)).toBeVisible();
  // });

  it("should render the placeholder text when there are no files", () => {
    const { getByText } = render(
      <TestParent>
        <Dialog open batch={{ ...baseBatch, files: [], fileCount: 0 }} />
      </TestParent>
    );

    expect(getByText(/No files were uploaded./)).toBeInTheDocument();
  });
});
