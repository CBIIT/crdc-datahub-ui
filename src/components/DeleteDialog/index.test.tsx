import { FC } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import Dialog from "./index";

type ParentProps = {
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({ children }) => (
  <MemoryRouter basename="">{children}</MemoryRouter>
);

describe("Accessibility", () => {
  it("should have no violations (no errors)", async () => {
    const { container } = render(
      <TestParent>
        <Dialog open onConfirm={jest.fn} onClose={jest.fn} />
      </TestParent>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("should render without crashing", () => {
    const { getByTestId } = render(
      <TestParent>
        <Dialog open onConfirm={jest.fn} onClose={jest.fn} />
      </TestParent>
    );

    expect(getByTestId("delete-dialog")).toBeVisible();
  });

  it("should call the 'onClose' callback when the close button is clicked", async () => {
    const mockOnClose = jest.fn();
    const { getByTestId } = render(
      <TestParent>
        <Dialog open onConfirm={jest.fn} onClose={mockOnClose} />
      </TestParent>
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    userEvent.click(getByTestId("delete-dialog-cancel-button"));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should call the 'onClose' when the close icon is clicked", async () => {
    const mockOnClose = jest.fn();
    const { getByTestId } = render(
      <TestParent>
        <Dialog open onConfirm={jest.fn} onClose={mockOnClose} />
      </TestParent>
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    userEvent.click(getByTestId("delete-dialog-close-icon-button"));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should close the dialog when the backdrop is clicked", async () => {
    const mockOnClose = jest.fn();
    const { getByTestId } = render(
      <TestParent>
        <Dialog open onConfirm={jest.fn} onClose={mockOnClose} />
      </TestParent>
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    userEvent.click(getByTestId("delete-dialog").firstChild as HTMLElement);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should call the 'onConfirm' callback when the confirm button is clicked", async () => {
    const mockOnConfirm = jest.fn();
    const { getByTestId } = render(
      <TestParent>
        <Dialog open onConfirm={mockOnConfirm} onClose={jest.fn} />
      </TestParent>
    );

    expect(mockOnConfirm).not.toHaveBeenCalled();

    userEvent.click(getByTestId("delete-dialog-confirm-button"));

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });
  });

  it("should forward button props to the close button", () => {
    const { getByTestId } = render(
      <TestParent>
        <Dialog open onConfirm={jest.fn} onClose={jest.fn} closeButtonProps={{ disabled: true }} />
      </TestParent>
    );

    expect(getByTestId("delete-dialog-cancel-button")).toBeDisabled();
  });

  it("should forward button props to the confirm button", () => {
    const { getByTestId } = render(
      <TestParent>
        <Dialog
          open
          onConfirm={jest.fn}
          onClose={jest.fn}
          confirmButtonProps={{ disabled: true }}
        />
      </TestParent>
    );

    expect(getByTestId("delete-dialog-confirm-button")).toBeDisabled();
  });
});

describe("Implementation Requirements", () => {
  it("should render the dialog with the correct header", () => {
    const { getByTestId } = render(
      <TestParent>
        <Dialog open onConfirm={jest.fn} onClose={jest.fn} header="custom header" />
      </TestParent>
    );

    expect(getByTestId("delete-dialog-header")).toHaveTextContent(/custom header/i);
  });

  it("should render the dialog with the correct description", () => {
    const { getByTestId } = render(
      <TestParent>
        <Dialog open onConfirm={jest.fn} onClose={jest.fn} description="custom description" />
      </TestParent>
    );

    expect(getByTestId("delete-dialog-description")).toHaveTextContent(/custom description/i);
  });

  it("should render the dialog with the correct close button text", () => {
    const { getByTestId } = render(
      <TestParent>
        <Dialog open onConfirm={jest.fn} onClose={jest.fn} closeText="custom dismiss" />
      </TestParent>
    );

    expect(getByTestId("delete-dialog-cancel-button")).toHaveTextContent("custom dismiss");
  });

  it("should render the dialog with the correct confirm button text", () => {
    const { getByTestId } = render(
      <TestParent>
        <Dialog open onConfirm={jest.fn} onClose={jest.fn} confirmText="custom confirm" />
      </TestParent>
    );

    expect(getByTestId("delete-dialog-confirm-button")).toHaveTextContent("custom confirm");
  });
});
