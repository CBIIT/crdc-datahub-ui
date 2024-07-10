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
        "An error occurred while deleting the selected rows.",
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
        "An error occurred while deleting the selected rows.",
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
        "An error occurred while deleting the selected rows.",
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

    expect(dialog).toHaveTextContent(/Delete test-node-123/i);
    expect(dialog).toHaveTextContent(/You have selected to delete 1 test-node-123/i);
  });

  it.each<[string, string]>([
    ["not a data file", "Delete Not A Data File Node"],
    ["genomic_info", "Delete Genomic_info Node"],
    ["file", "Delete File Node"],
    ["ALL CAPS", "Delete All Caps Node"],
  ])("should use a title-cased nodeType in the dialog header", (nodeType, expected) => {
    const { getByTestId, getByRole } = render(
      <Button nodeType={nodeType} selectedItems={["node-id-456"]} />,
      {
        wrapper: TestParent,
      }
    );

    userEvent.click(getByTestId("delete-node-data-button"));

    const dialog = getByRole("dialog");

    expect(within(dialog).getByTestId("delete-dialog-header")).toHaveTextContent(expected);
  });

  it.each<[number, string]>([
    [1, "Delete Xyz-node Node"],
    [2, "Delete Xyz-node Nodes"],
    [72, "Delete Xyz-node Nodes"],
  ])(
    "should use the proper pluralization for the delete dialog title",
    async (selectedItems, expected) => {
      const { getByTestId, getByRole } = render(
        <Button nodeType="xyz-node" selectedItems={Array(selectedItems).fill("fake-node-id")} />,
        {
          wrapper: TestParent,
        }
      );

      userEvent.click(getByTestId("delete-node-data-button"));

      const dialog = getByRole("dialog");

      expect(within(dialog).getByTestId("delete-dialog-header")).toHaveTextContent(expected);
    }
  );

  it.each<[number, string]>([
    [1, "You have selected to delete 1 test-node-123 node."],
    [2, "You have selected to delete 2 test-node-123 nodes."],
    [1024, "You have selected to delete 1024 test-node-123 nodes."],
  ])(
    "should use the proper pluralization for the delete dialog content",
    async (selectedItems, expected) => {
      const { getByTestId, getByRole } = render(
        <Button
          nodeType="test-node-123"
          selectedItems={Array(selectedItems).fill("fake-node-id")}
        />,
        {
          wrapper: TestParent,
        }
      );

      userEvent.click(getByTestId("delete-node-data-button"));

      const dialog = getByRole("dialog");
      expect(within(dialog).getByTestId("delete-dialog-description")).toHaveTextContent(expected);
    }
  );

  it.each<[number, string]>([
    [
      1,
      "1 test-node-123 node and their associated child nodes have been deleted from this data submission",
    ],
    [
      2,
      "2 test-node-123 nodes and their associated child nodes have been deleted from this data submission",
    ],
    [
      1024,
      "1024 test-node-123 nodes and their associated child nodes have been deleted from this data submission",
    ],
  ])(
    "should use the proper pluralization for the delete confirmation snackbar message",
    async (selectedItems, expected) => {
      const mock: MockedResponse<DeleteDataRecordsResp, DeleteDataRecordsInput> = {
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
      };

      const { getByTestId, getByRole } = render(
        <Button
          nodeType="test-node-123"
          selectedItems={Array(selectedItems).fill("fake-node-id")}
        />,
        {
          wrapper: (props) => <TestParent {...props} mocks={[mock]} />,
        }
      );

      userEvent.click(getByTestId("delete-node-data-button"));

      const dialog = getByRole("dialog");
      const button = await within(dialog).findByRole("button", { name: /confirm/i });

      userEvent.click(button);

      await waitFor(() => {
        expect(global.mockEnqueue).toHaveBeenCalledWith(expected, {
          variant: "success",
        });
      });
    }
  );

  // NOTE: This is just a broad sanity check for the Data File nodeType
  // which is common across all data models and has special handling
  it.each<{
    selectedItems: number;
    dialogTitle: string;
    dialogBody: string;
    snackbarMessage: string;
  }>([
    {
      selectedItems: 1,
      dialogTitle: "Delete Data File",
      dialogBody: "You have selected to delete 1 data file.",
      snackbarMessage: "1 data file have been deleted from this data submission",
    },
    {
      selectedItems: 35,
      dialogTitle: "Delete Data Files",
      dialogBody: "You have selected to delete 35 data files.",
      snackbarMessage: "35 data files have been deleted from this data submission",
    },
  ])(
    "should have different verbiage when the nodeType is 'data file'",
    async ({ selectedItems, dialogTitle, dialogBody, snackbarMessage }) => {
      const mock: MockedResponse<DeleteDataRecordsResp, DeleteDataRecordsInput> = {
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
      };

      const { getByTestId, getByRole } = render(
        <Button nodeType="data file" selectedItems={Array(selectedItems).fill("fake-data-file")} />,
        {
          wrapper: (props) => <TestParent {...props} mocks={[mock]} />,
        }
      );

      userEvent.click(getByTestId("delete-node-data-button"));

      const dialog = getByRole("dialog");
      expect(within(dialog).getByTestId("delete-dialog-header")).toHaveTextContent(dialogTitle);
      expect(within(dialog).getByTestId("delete-dialog-description")).toHaveTextContent(dialogBody);

      const button = await within(dialog).findByRole("button", { name: /confirm/i });
      userEvent.click(button);

      await waitFor(() => {
        expect(global.mockEnqueue).toHaveBeenCalledWith(snackbarMessage, {
          variant: "success",
        });
      });
    }
  );
});
