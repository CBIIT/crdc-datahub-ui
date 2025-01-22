import { render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { useMemo } from "react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import {
  Context as AuthContext,
  ContextState as AuthContextState,
  Status as AuthContextStatus,
} from "../Contexts/AuthContext";
import { CANCEL_APP, CancelAppInput, CancelAppResp } from "../../graphql";
import Button from "./index";

const baseAuthCtx: AuthContextState = {
  status: AuthContextStatus.LOADED,
  isLoggedIn: false,
  user: null,
};

const baseUser: User = {
  _id: "",
  firstName: "",
  lastName: "",
  userStatus: "Active",
  role: "Submitter", // NOTE: This role has access to the delete button by default
  IDP: "nih",
  email: "",
  studies: null,
  dataCommons: [],
  createdAt: "",
  updateAt: "",
  permissions: ["data_submission:view", "data_submission:create"],
  notifications: [],
};

type TestParentProps = {
  user?: Partial<User>;
  mocks?: MockedResponse[];
  children: React.ReactNode;
};

const TestParent: React.FC<TestParentProps> = ({ mocks = [], user = {}, children }) => {
  const authCtxValue = useMemo<AuthContextState>(
    () => ({
      ...baseAuthCtx,
      user: { ...baseUser, ...user },
    }),
    [user]
  );

  return (
    <MockedProvider mocks={mocks} showWarnings>
      <AuthContext.Provider value={authCtxValue}>{children}</AuthContext.Provider>
    </MockedProvider>
  );
};

describe("Accessibility", () => {
  it("should have no violations for the component", async () => {
    const { container, getByTestId } = render(
      <Button nodeType="test" selectedItems={["ID_1", "ID_2", "ID_3"]} />,
      { wrapper: TestParent }
    );

    expect(getByTestId("cancel-restore-application-button")).not.toBeDisabled(); // Sanity check to ensure the button is active
    expect(await axe(container)).toHaveNoViolations();
  });

  it("should have no violations for the component when disabled", async () => {
    const { container, getByTestId } = render(<Button nodeType="test" selectedItems={[]} />, {
      wrapper: TestParent,
    });

    expect(getByTestId("cancel-restore-application-button")).toBeDisabled(); // Sanity check to ensure the button is disabled
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
    const mocks: MockedResponse<CancelAppResp, CancelAppInput>[] = [
      {
        request: {
          query: CANCEL_APP,
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
    userEvent.click(getByTestId("cancel-restore-application-button"));

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
    const mocks: MockedResponse<CancelAppResp, CancelAppInput>[] = [
      {
        request: {
          query: CANCEL_APP,
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
    userEvent.click(getByTestId("cancel-restore-application-button"));

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
    const mocks: MockedResponse<CancelAppResp, CancelAppInput>[] = [
      {
        request: {
          query: CANCEL_APP,
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
    userEvent.click(getByTestId("cancel-restore-application-button"));

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

  it("should call the onCancel callback when the cancel/restore operation is successful", async () => {
    const onDelete = jest.fn();
    const mocks: MockedResponse<CancelAppResp, CancelAppInput>[] = [
      {
        request: {
          query: CANCEL_APP,
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
    userEvent.click(getByTestId("cancel-restore-application-button"));

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

  it("should be disabled when a cancel/restore operation is in progress", () => {
    const { getByTestId } = render(<Button nodeType="test" selectedItems={[]} />, {
      wrapper: (props) => <TestParent {...props} submission={{ deletingData: true }} />,
    });

    expect(getByTestId("cancel-restore-application-button")).toBeDisabled();
  });

  it("should restore the Submission Request only when the 'Confirm' button is clicked in the dialog", async () => {
    const mockMatcher = jest.fn().mockImplementation(() => true);
    const mocks: MockedResponse<CancelAppResp, CancelAppInput>[] = [
      {
        request: {
          query: CANCEL_APP,
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

    userEvent.click(getByTestId("cancel-restore-application-button"));

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

  it("should cancel the Submission Request only when the 'Confirm' button is clicked in the dialog", async () => {
    const mockMatcher = jest.fn().mockImplementation(() => true);
    const mocks: MockedResponse<CancelAppResp, CancelAppInput>[] = [
      {
        request: {
          query: CANCEL_APP,
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

    userEvent.click(getByTestId("cancel-restore-application-button"));

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

    userEvent.click(getByTestId("cancel-restore-application-button"));

    const dialog = getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    const button = await within(dialog).findByRole("button", { name: /cancel/i });
    userEvent.click(button);

    await waitFor(() => {
      expect(() => getByRole("dialog")).toThrow();
    });
  });

  it("should be visible and interactive when the user has the required permissions", async () => {
    const { getByTestId } = render(<Button nodeType="test" selectedItems={[]} />, {
      wrapper: (props) => (
        <TestParent
          {...props}
          user={{
            role: "Submitter",
            permissions: ["data_submission:view", "data_submission:create"],
          }}
        />
      ),
    });

    expect(getByTestId("cancel-restore-application-button")).toBeVisible();
  });

  it("should not be rendered when the user is missing the required permissions", async () => {
    const { queryByTestId } = render(<Button nodeType="test" selectedItems={[]} />, {
      wrapper: (props) => <TestParent {...props} user={{ role: "Submitter", permissions: [] }} />,
    });

    expect(queryByTestId("cancel-restore-application-button")).not.toBeInTheDocument();
  });

  it.each<SubmissionStatus>(["New", "In Progress", "Rejected", "Withdrawn"])(
    "should render as the 'Cancel' variant for the Submission Request status '%s'",
    (status) => {
      const { getByTestId } = render(<Button nodeType="test" selectedItems={["item-1"]} />, {
        wrapper: (props) => <TestParent {...props} submission={{ status }} />,
      });

      expect(getByTestId("cancel-restore-application-button")).toBeEnabled();
    }
  );

  it.each<SubmissionStatus>(["Submitted", "Released", "Completed", "Canceled", "Deleted"])(
    "should render as the 'Restore' variant for the Submission Request status '%s'",
    (status) => {
      const { getByTestId } = render(<Button nodeType="test" selectedItems={["item-1"]} />, {
        wrapper: (props) => <TestParent {...props} submission={{ status }} />,
      });

      expect(getByTestId("cancel-restore-application-button")).toBeDisabled();
    }
  );
});
