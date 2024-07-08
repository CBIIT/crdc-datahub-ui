import { render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { useMemo } from "react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import {
  SubmissionContext,
  SubmissionCtxState,
  SubmissionCtxStatus,
} from "../Contexts/SubmissionContext";
import Button from "./DeleteNodeDataButton";
import { DELETE_DATA_RECORDS, DeleteDataRecordsInput, DeleteDataRecordsResp } from "../../graphql";

const BaseSubmission: Submission = {
  _id: "",
  name: "",
  submitterID: "",
  submitterName: "",
  organization: undefined,
  dataCommons: "",
  modelVersion: "",
  studyAbbreviation: "",
  dbGaPID: "",
  bucketName: "",
  rootPath: "",
  status: "New",
  metadataValidationStatus: "New",
  fileValidationStatus: "New",
  crossSubmissionStatus: "New",
  fileErrors: [],
  history: [],
  conciergeName: "",
  conciergeEmail: "",
  intention: "New/Update",
  dataType: "Metadata Only",
  otherSubmissions: "",
  createdAt: "",
  updatedAt: "",
  studyID: "",
  validationStarted: "",
  validationEnded: "",
  validationScope: "New",
  validationType: [],
};

type TestParentProps = {
  submission?: Partial<Submission>;
  mocks?: MockedResponse[];
  children: React.ReactNode;
};

const TestParent: React.FC<TestParentProps> = ({ mocks = [], submission = {}, children }) => {
  const value = useMemo<SubmissionCtxState>(
    () => ({
      status: SubmissionCtxStatus.LOADED,
      error: null,
      isPolling: false,
      data: {
        getSubmission: { ...BaseSubmission, ...submission },
        submissionStats: {
          stats: [],
        },
        listBatches: null,
      },
    }),
    [submission]
  );

  return (
    <MockedProvider mocks={mocks} showWarnings>
      <SubmissionContext.Provider value={value}>{children}</SubmissionContext.Provider>
    </MockedProvider>
  );
};

describe("Accessibility", () => {
  it("should have no violations for DeleteNodeDataButton component", async () => {
    const { container, getByTestId } = render(
      <Button nodeType="test" selectedItems={["ID_1", "ID_2", "ID_3"]} />,
      { wrapper: TestParent }
    );

    expect(getByTestId("delete-node-data-button")).not.toBeDisabled(); // Sanity check to ensure the button is active
    expect(await axe(container)).toHaveNoViolations();
  });

  it("should have no violations for DeleteNodeDataButton component when disabled", async () => {
    const { container, getByTestId } = render(<Button nodeType="test" selectedItems={[]} />, {
      wrapper: TestParent,
    });

    expect(getByTestId("delete-node-data-button")).toBeDisabled(); // Sanity check to ensure the button is disabled
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should render without crashing", () => {
    expect(() =>
      render(<Button nodeType="" selectedItems={[]} />, { wrapper: TestParent })
    ).not.toThrow();
  });

  it("should show a snackbar when the delete operation fails (GraphQL Error)", async () => {
    const mocks: MockedResponse<DeleteDataRecordsResp, DeleteDataRecordsInput>[] = [
      {
        request: {
          query: DELETE_DATA_RECORDS,
        },
        variableMatcher: () => true,
        result: {
          errors: [new GraphQLError("Simulated GraphQL error")],
        },
      },
    ];

    const { getByTestId, getByRole } = render(
      <Button nodeType="test" selectedItems={["1 item ID"]} />,
      { wrapper: (props) => <TestParent {...props} mocks={mocks} /> }
    );

    // Open confirmation dialog
    userEvent.click(getByTestId("delete-node-data-button"));

    // Click dialog confirm button
    const button = await within(getByRole("dialog")).findByRole("button", { name: /confirm/i });
    userEvent.click(button);

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "An error occurred while deleting the selected nodes.",
        {
          variant: "error",
        }
      );
    });
  });

  it("should show a snackbar when the delete operation fails (Network Error)", async () => {
    const mocks: MockedResponse<DeleteDataRecordsResp, DeleteDataRecordsInput>[] = [
      {
        request: {
          query: DELETE_DATA_RECORDS,
        },
        variableMatcher: () => true,
        error: new Error("Simulated network error"),
      },
    ];

    const { getByTestId, getByRole } = render(
      <Button nodeType="test" selectedItems={["1 item ID"]} />,
      { wrapper: (props) => <TestParent {...props} mocks={mocks} /> }
    );

    // Open confirmation dialog
    userEvent.click(getByTestId("delete-node-data-button"));

    // Click dialog confirm button
    const button = await within(getByRole("dialog")).findByRole("button", { name: /confirm/i });
    userEvent.click(button);

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "An error occurred while deleting the selected nodes.",
        {
          variant: "error",
        }
      );
    });
  });

  it("should show a snackbar when the delete operation fails (API Error)", async () => {
    const mocks: MockedResponse<DeleteDataRecordsResp, DeleteDataRecordsInput>[] = [
      {
        request: {
          query: DELETE_DATA_RECORDS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            deleteDataRecords: {
              success: false,
              message: "Simulated API rejection message",
            },
          },
        },
      },
    ];

    const { getByTestId, getByRole } = render(
      <Button nodeType="test" selectedItems={["1 item ID"]} />,
      { wrapper: (props) => <TestParent {...props} mocks={mocks} /> }
    );

    // Open confirmation dialog
    userEvent.click(getByTestId("delete-node-data-button"));

    // Click dialog confirm button
    const button = await within(getByRole("dialog")).findByRole("button", { name: /confirm/i });
    userEvent.click(button);

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "An error occurred while deleting the selected nodes.",
        {
          variant: "error",
        }
      );
    });
  });

  it("should be disabled when there are no selected items", () => {
    const { getByTestId } = render(<Button nodeType="fake-node" selectedItems={[]} />, {
      wrapper: TestParent,
    });

    expect(getByTestId("delete-node-data-button")).toBeDisabled();
  });

  it("should call the onDelete callback when the delete operation is successful", async () => {
    const onDelete = jest.fn();
    const mocks: MockedResponse<DeleteDataRecordsResp, DeleteDataRecordsInput>[] = [
      {
        request: {
          query: DELETE_DATA_RECORDS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            deleteDataRecords: {
              success: true,
              message: "",
            },
          },
        },
      },
    ];

    const { getByTestId, getByRole } = render(
      <Button nodeType="test" selectedItems={["1 item ID"]} onDelete={onDelete} />,
      { wrapper: (props) => <TestParent {...props} mocks={mocks} /> }
    );

    // Open confirmation dialog
    userEvent.click(getByTestId("delete-node-data-button"));

    // Click dialog confirm button
    const button = await within(getByRole("dialog")).findByRole("button", { name: /confirm/i });
    userEvent.click(button);

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalled();
    });
  });
});

describe("Implementation Requirements", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should have a tooltip on the delete button", async () => {
    const { getByTestId, findByRole } = render(
      <Button nodeType="test" selectedItems={["1 item ID"]} />,
      {
        wrapper: TestParent,
      }
    );

    userEvent.hover(getByTestId("delete-node-data-button"));

    const tooltip = await findByRole("tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent("Delete all selected nodes from this data submission");
  });

  // NOTE: This test is not applicable to the current implementation,
  // the selection count is not used for determining the pluralization
  // it.todo("should use the proper pluralization for the delete dialog content button");

  it("should show a confirmation dialog when the 'Delete' icon is clicked", async () => {
    const { getByTestId, getByRole } = render(
      <Button nodeType="test" selectedItems={["1 item ID"]} />,
      {
        wrapper: TestParent,
      }
    );

    expect(() => getByRole("dialog")).toThrow();

    userEvent.click(getByTestId("delete-node-data-button"));

    expect(getByRole("dialog")).toBeInTheDocument();
  });

  it("should delete the selected nodes only when the 'Delete' button is clicked in the dialog", async () => {
    const mockMatcher = jest.fn().mockImplementation(() => true);
    const mocks: MockedResponse<DeleteDataRecordsResp, DeleteDataRecordsInput>[] = [
      {
        request: {
          query: DELETE_DATA_RECORDS,
        },
        variableMatcher: mockMatcher,
        result: {
          data: {
            deleteDataRecords: {
              success: false,
              message: "Simulated API rejection message",
            },
          },
        },
      },
    ];

    const { getByTestId, getByRole } = render(
      <Button nodeType="test-node-type" selectedItems={["ID_1", "ID_2", "ID_3"]} />,
      {
        wrapper: (props) => (
          <TestParent {...props} mocks={mocks} submission={{ _id: "mock-submission-id" }} />
        ),
      }
    );

    expect(mockMatcher).not.toHaveBeenCalled();

    userEvent.click(getByTestId("delete-node-data-button"));

    const button = await within(getByRole("dialog")).findByRole("button", { name: /confirm/i });
    userEvent.click(button);

    await waitFor(() => {
      expect(mockMatcher).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: "mock-submission-id",
          nodeType: "test-node-type",
          nodeIds: ["ID_1", "ID_2", "ID_3"],
        })
      );
    });
  });

  it("should dismiss the dialog when the 'Cancel' button is clicked", async () => {
    const { getByTestId, getByRole } = render(
      <Button nodeType="test" selectedItems={["1 item ID"]} />,
      {
        wrapper: TestParent,
      }
    );

    userEvent.click(getByTestId("delete-node-data-button"));

    const dialog = getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    const button = await within(dialog).findByRole("button", { name: /cancel/i });
    userEvent.click(button);

    await waitFor(() => {
      expect(() => getByRole("dialog")).toThrow();
    });
  });

  // NOTE: The dialog functionality is tested elsewhere, this is just a sanity check
  // against the current requirements
  it("should contain the nodeType and selection count in the delete dialog content", async () => {
    const { getByTestId, getByRole } = render(
      <Button nodeType="test-node-123" selectedItems={["node-id-456"]} />,
      {
        wrapper: TestParent,
      }
    );

    userEvent.click(getByTestId("delete-node-data-button"));

    const dialog = getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    expect(dialog).toHaveTextContent(/Remove test-node-123 Data/i);
    expect(dialog).toHaveTextContent(/You have selected to delete 1 test-node-123\(s\)/i);
  });
});
