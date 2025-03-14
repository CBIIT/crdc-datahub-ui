import { render, waitFor, within } from "@testing-library/react";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import FormDialog from "./FormDialog";

const mockListAvailableModelVersions = jest.fn();
jest.mock("../../utils", () => ({
  ...jest.requireActual("../../utils"),
  listAvailableModelVersions: async (...args) => mockListAvailableModelVersions(...args),
}));

describe("Accessibility", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    sessionStorage.clear();
  });

  it("should have no violations", async () => {
    mockListAvailableModelVersions.mockImplementationOnce(() => ["1.0.0", "2.0.0"]);

    const { container } = render(
      <FormDialog
        open
        dataCommons=""
        modelVersion=""
        onSubmitForm={jest.fn()}
        onClose={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(mockListAvailableModelVersions).toHaveBeenCalledTimes(1);
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    sessionStorage.clear();
  });

  it("should close the dialog when the 'Cancel' button is clicked", async () => {
    const mockOnClose = jest.fn();

    const { getByTestId } = render(
      <FormDialog
        open
        dataCommons=""
        modelVersion=""
        onSubmitForm={jest.fn()}
        onClose={mockOnClose}
      />
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    userEvent.click(getByTestId("model-version-dialog-cancel-button"));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should close the dialog when the 'X' icon is clicked", async () => {
    const mockOnClose = jest.fn();

    const { getByTestId } = render(
      <FormDialog
        open
        dataCommons=""
        modelVersion=""
        onSubmitForm={jest.fn()}
        onClose={mockOnClose}
      />
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    userEvent.click(getByTestId("model-version-dialog-close-icon"));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should close the dialog when the backdrop is clicked", async () => {
    const mockOnClose = jest.fn();

    const { getByTestId } = render(
      <FormDialog
        open
        dataCommons=""
        modelVersion=""
        onSubmitForm={jest.fn()}
        onClose={mockOnClose}
      />
    );

    expect(mockOnClose).not.toHaveBeenCalled();

    userEvent.click(getByTestId("model-version-dialog").firstChild as HTMLElement);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should fetch available model versions when the dialog opens", async () => {
    expect(mockListAvailableModelVersions).not.toHaveBeenCalled();

    const { rerender } = render(
      <FormDialog
        open={false}
        dataCommons="MOCK-DC-TEST"
        modelVersion="1.0.0"
        onSubmitForm={jest.fn()}
        onClose={jest.fn()}
      />
    );

    expect(mockListAvailableModelVersions).not.toHaveBeenCalled();

    rerender(
      <FormDialog
        open
        dataCommons="MOCK-DC-TEST"
        modelVersion="1.0.0"
        onSubmitForm={jest.fn()}
        onClose={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(mockListAvailableModelVersions).toHaveBeenCalledTimes(1);
    });

    expect(mockListAvailableModelVersions).toHaveBeenCalledWith("MOCK-DC-TEST");
  });

  it("should call the onSubmitForm function with the selected model version", async () => {
    const mockOnSubmitForm = jest.fn().mockResolvedValueOnce(undefined);
    mockListAvailableModelVersions.mockImplementationOnce(() => ["1.0.0", "2.0.0"]);

    const { getByTestId } = render(
      <FormDialog
        open
        dataCommons="MOCK-DC-TEST"
        modelVersion="1.0.0"
        onSubmitForm={mockOnSubmitForm}
        onClose={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(mockListAvailableModelVersions).toHaveBeenCalledTimes(1);
    });

    userEvent.click(getByTestId("model-version-dialog-submit-button"));

    await waitFor(() => {
      expect(mockOnSubmitForm).toHaveBeenCalledTimes(1);
    });
  });
});

describe("Implementation Requirements", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    sessionStorage.clear();
  });

  it("should pre-select the current model version", async () => {
    mockListAvailableModelVersions.mockImplementationOnce(() => ["3.1.0", "1.0.0", "2.0.0"]);

    const { getByTestId } = render(
      <FormDialog
        open
        dataCommons="MOCK-DC-TEST"
        modelVersion="1.0.0"
        onSubmitForm={jest.fn()}
        onClose={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(mockListAvailableModelVersions).toHaveBeenCalledTimes(1);
    });

    expect(getByTestId("model-version-version-field")).toHaveTextContent("1.0.0");
  });

  it("should populate with all available model versions", async () => {
    mockListAvailableModelVersions.mockImplementationOnce(() => [
      "MODEL-VERSION-ABC",
      "MODEL-VERSION-123",
      "MODEL-VERSION-XXZ",
    ]);

    const { getByTestId, getByText, getAllByText } = render(
      <FormDialog
        open
        dataCommons="MOCK-DC-TEST"
        modelVersion="MODEL-VERSION-ABC"
        onSubmitForm={jest.fn()}
        onClose={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(mockListAvailableModelVersions).toHaveBeenCalledTimes(1);
    });

    userEvent.click(within(getByTestId("model-version-version-field")).getByRole("button"));

    expect(getAllByText("MODEL-VERSION-ABC")).toHaveLength(2); // Input field and dropdown
    expect(getByText("MODEL-VERSION-123")).toBeInTheDocument();
    expect(getByText("MODEL-VERSION-XXZ")).toBeInTheDocument();
  });

  it("should still populate with the current model version if no versions are available", async () => {
    mockListAvailableModelVersions.mockImplementationOnce(() => []);

    const { getByTestId } = render(
      <FormDialog
        open
        dataCommons="MOCK-DC-TEST"
        modelVersion="MODEL-VERSION-1.2.3"
        onSubmitForm={jest.fn()}
        onClose={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(mockListAvailableModelVersions).toHaveBeenCalledTimes(1);
    });

    expect(getByTestId("model-version-version-field")).toHaveTextContent("MODEL-VERSION-1.2.3");
  });

  it("should have the correct title, description, and button text", async () => {
    const { getByTestId } = render(
      <FormDialog
        open
        dataCommons="MOCK-DC-TEST"
        modelVersion="XYZ"
        onSubmitForm={jest.fn()}
        onClose={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(mockListAvailableModelVersions).toHaveBeenCalledTimes(1);
    });

    expect(getByTestId("model-version-dialog-header")).toHaveTextContent(
      "Change Data Model Version"
    );
    expect(getByTestId("model-version-dialog-body")).toHaveTextContent(
      "Changing the model version for an in-progress submission may require rerunning validation to ensure alignment with the selected version."
    );
    expect(getByTestId("model-version-dialog-submit-button")).toHaveTextContent("Save");
    expect(getByTestId("model-version-dialog-cancel-button")).toHaveTextContent("Cancel");
  });
});
