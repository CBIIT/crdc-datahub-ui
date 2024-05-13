import { FC } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import UploaderToolDialog from "./index";

jest.mock("../../env", () => ({
  ...jest.requireActual("../../env"),
  REACT_APP_UPLOADER_CLI: "mocked-cli-download-link",
}));

type ParentProps = {
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({ children }) => (
  <MemoryRouter basename="">{children}</MemoryRouter>
);

describe("Accessibility", () => {
  it("should have no violations", async () => {
    const { container } = render(
      <TestParent>
        <UploaderToolDialog open />
      </TestParent>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("should render without crashing", () => {
    const { getByTestId } = render(
      <TestParent>
        <UploaderToolDialog open />
      </TestParent>
    );

    expect(getByTestId("uploader-cli-dialog")).toBeVisible();
  });

  it("should close the dialog when the 'Close' button is clicked", async () => {
    const mockOnClose = jest.fn();
    const { getByTestId } = render(
      <TestParent>
        <UploaderToolDialog open onClose={mockOnClose} />
      </TestParent>
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    userEvent.click(getByTestId("uploader-cli-close-button"));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should close the dialog when the 'X' icon is clicked", async () => {
    const mockOnClose = jest.fn();
    const { getByTestId } = render(
      <TestParent>
        <UploaderToolDialog open onClose={mockOnClose} />
      </TestParent>
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    userEvent.click(getByTestId("uploader-cli-dialog-close-icon"));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should close the dialog when the backdrop is clicked", async () => {
    const mockOnClose = jest.fn();
    const { getByTestId } = render(
      <TestParent>
        <UploaderToolDialog open onClose={mockOnClose} />
      </TestParent>
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    userEvent.click(getByTestId("uploader-cli-dialog").firstChild as HTMLElement);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should have the CLI download link", async () => {
    const { getByTestId } = render(
      <TestParent>
        <UploaderToolDialog open />
      </TestParent>
    );

    const link = getByTestId("uploader-cli-dialog-download-button");

    expect(link).toBeVisible();
    expect(link).toHaveAttribute("href", expect.stringMatching(/mocked-cli-download-link/g));
    expect(link).toHaveAttribute("download");
    expect(link).toHaveAttribute("target", "_self");
  });
});
