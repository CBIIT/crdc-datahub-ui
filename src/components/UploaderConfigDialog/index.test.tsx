import { FC } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, waitFor, within } from "@testing-library/react";
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

  it("should call the onDownload function when the 'Download' button is clicked", async () => {
    const { getByTestId } = render(
      <TestParent>
        <UploaderConfigDialog open onDownload={mockDownload} onClose={mockOnClose} />
      </TestParent>
    );

    expect(mockDownload).not.toHaveBeenCalled();

    userEvent.click(getByTestId("uploader-config-dialog-download-button"));

    await waitFor(() => {
      expect(mockDownload).toHaveBeenCalledTimes(1);
    });
  });

  // TODO: getting an act warning here
  it("should clear the form when reopening the dialog", async () => {
    const { rerender, getByTestId } = render(
      <TestParent>
        <UploaderConfigDialog open onDownload={mockDownload} onClose={mockOnClose} />
      </TestParent>
    );

    const dataFolderInput = within(
      getByTestId("uploader-config-dialog-input-data-folder")
    ).getByRole("textbox");
    const manifestInput = within(getByTestId("uploader-config-dialog-input-manifest")).getByRole(
      "textbox"
    );

    userEvent.type(dataFolderInput, "test-folder");
    userEvent.type(manifestInput, "test-manifest");

    await waitFor(() => {
      expect(dataFolderInput).toHaveValue("test-folder");
      expect(manifestInput).toHaveValue("test-manifest");
    });

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
