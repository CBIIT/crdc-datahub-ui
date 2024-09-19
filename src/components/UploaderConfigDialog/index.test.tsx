import { FC } from "react";
import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, waitFor, within } from "@testing-library/react";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import UploaderConfigDialog from "./index";

type ParentProps = {
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({ children }) => (
  <MemoryRouter basename="">{children}</MemoryRouter>
);

describe("Accessibility", () => {
  const mockDownload = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should have no violations", async () => {
    const { container } = render(
      <TestParent>
        <UploaderConfigDialog open onDownload={mockDownload} onClose={mockOnClose} />
      </TestParent>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  const mockDownload = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should render without crashing", () => {
    const { getByTestId } = render(
      <TestParent>
        <UploaderConfigDialog open onDownload={mockDownload} onClose={mockOnClose} />
      </TestParent>
    );

    expect(getByTestId("uploader-config-dialog")).toBeVisible();
  });

  it("should close the dialog when the 'Close' button is clicked", async () => {
    const { getByTestId } = render(
      <TestParent>
        <UploaderConfigDialog open onDownload={mockDownload} onClose={mockOnClose} />
      </TestParent>
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    userEvent.click(getByTestId("uploader-config-dialog-close-button"));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should close the dialog when the 'X' icon is clicked", async () => {
    const { getByTestId } = render(
      <TestParent>
        <UploaderConfigDialog open onDownload={mockDownload} onClose={mockOnClose} />
      </TestParent>
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    userEvent.click(getByTestId("uploader-config-dialog-close-icon"));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should close the dialog when the backdrop is clicked", async () => {
    const { getByTestId } = render(
      <TestParent>
        <UploaderConfigDialog open onDownload={mockDownload} onClose={mockOnClose} />
      </TestParent>
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    userEvent.click(getByTestId("uploader-config-dialog").firstChild as HTMLElement);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should call the onDownload function when the 'Download' button is clicked with a valid form", async () => {
    const { getByTestId } = render(
      <TestParent>
        <UploaderConfigDialog open onDownload={mockDownload} onClose={mockOnClose} />
      </TestParent>
    );

    expect(mockDownload).not.toHaveBeenCalled();

    userEvent.type(getByTestId("uploader-config-dialog-input-data-folder"), "test-folder");
    userEvent.type(getByTestId("uploader-config-dialog-input-manifest"), "test-manifest");

    userEvent.click(getByTestId("uploader-config-dialog-download-button"));

    await waitFor(() => {
      expect(mockDownload).toHaveBeenCalledTimes(1);
    });
  });

  it("should clear the form when reopening the dialog", async () => {
    const { rerender, getByTestId } = render(
      <TestParent>
        <UploaderConfigDialog open onDownload={mockDownload} onClose={mockOnClose} />
      </TestParent>
    );

    const dataFolderInput = within(
      getByTestId("uploader-config-dialog-input-data-folder")
    ).getByRole("textbox");

    fireEvent.input(dataFolderInput, { target: { value: "test-folder" } });
    await waitFor(() => expect(dataFolderInput).toHaveValue("test-folder"));

    const manifestInput = within(getByTestId("uploader-config-dialog-input-manifest")).getByRole(
      "textbox"
    );

    fireEvent.input(manifestInput, { target: { value: "test-manifest" } });
    await waitFor(() => expect(manifestInput).toHaveValue("test-manifest"));

    // Simulate closing dialog
    rerender(
      <TestParent>
        <UploaderConfigDialog open={false} onDownload={mockDownload} onClose={mockOnClose} />
      </TestParent>
    );

    // Simulate reopening dialog
    rerender(
      <TestParent>
        <UploaderConfigDialog open onDownload={mockDownload} onClose={mockOnClose} />
      </TestParent>
    );

    await waitFor(() => {
      expect(dataFolderInput).toHaveValue("");
      expect(manifestInput).toHaveValue("");
    });
  });
});

describe("Implementation Requirements", () => {
  const mockDownload = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should not submit the form if any of the inputs are invalid", async () => {
    const { getByTestId, queryAllByText } = render(
      <TestParent>
        <UploaderConfigDialog open onDownload={mockDownload} onClose={mockOnClose} />
      </TestParent>
    );

    userEvent.click(getByTestId("uploader-config-dialog-download-button"));

    await waitFor(() => {
      expect(queryAllByText(/This field is required/)).toHaveLength(2);
    });

    expect(mockDownload).not.toHaveBeenCalled();
  });

  it("should have a tooltip on the Data Files Folder input", async () => {
    const { getByTestId, findByRole } = render(
      <TestParent>
        <UploaderConfigDialog open onDownload={mockDownload} onClose={mockOnClose} />
      </TestParent>
    );

    userEvent.hover(getByTestId("data-folder-input-tooltip"));

    const tooltip = await findByRole("tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent(
      "Enter the full path for the Data Files folder on your local machine or S3 bucket"
    );

    userEvent.unhover(getByTestId("data-folder-input-tooltip"));

    await waitFor(() => {
      expect(tooltip).not.toBeVisible();
    });
  });

  it("should have a tooltip on the Manifest File input", async () => {
    const { getByTestId, findByRole } = render(
      <TestParent>
        <UploaderConfigDialog open onDownload={mockDownload} onClose={mockOnClose} />
      </TestParent>
    );

    userEvent.hover(getByTestId("manifest-input-tooltip"));

    const tooltip = await findByRole("tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent(
      "Enter the full path for the File Manifest on your local machine or S3 bucket"
    );

    userEvent.unhover(getByTestId("manifest-input-tooltip"));

    await waitFor(() => {
      expect(tooltip).not.toBeVisible();
    });
  });
});
