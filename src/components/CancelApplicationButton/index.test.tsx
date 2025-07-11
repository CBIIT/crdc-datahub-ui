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
import {
  Context as FormContext,
  Status as FormStatus,
  ContextState as FormContextState,
} from "../Contexts/FormContext";
import { CANCEL_APP, CancelAppInput, CancelAppResp } from "../../graphql";
import Button from "./index";

const baseAuthCtx: AuthContextState = {
  status: AuthContextStatus.LOADED,
  isLoggedIn: false,
  user: null,
};

const baseUser: User = {
  _id: "base-user-123",
  firstName: "",
  lastName: "",
  userStatus: "Active",
  role: "Submitter",
  IDP: "nih",
  email: "",
  studies: null,
  institution: null,
  dataCommons: [],
  dataCommonsDisplayNames: [],
  createdAt: "",
  updateAt: "",
  permissions: [],
  notifications: [],
};

const baseApp: Application = {
  _id: "",
  status: "New",
  createdAt: "",
  updatedAt: "",
  submittedDate: "",
  history: [],
  ORCID: "",
  applicant: {
    applicantID: "applicant-123",
    applicantName: "",
    applicantEmail: "",
  },
  PI: "",
  controlledAccess: false,
  openAccess: false,
  studyAbbreviation: "",
  conditional: false,
  pendingConditions: [],
  programName: "",
  programAbbreviation: "",
  programDescription: "",
  version: "",
  questionnaireData: null,
};

type TestParentProps = {
  user?: Partial<User>;
  mocks?: MockedResponse[];
  application?: Application;
  children: React.ReactNode;
};

const TestParent: React.FC<TestParentProps> = ({
  mocks = [],
  user = {},
  application = null,
  children,
}) => {
  const authCtxValue = useMemo<AuthContextState>(
    () => ({
      ...baseAuthCtx,
      user: { ...baseUser, ...user },
    }),
    [user]
  );

  const formCtxValue = useMemo<FormContextState>(
    () => ({
      status: FormStatus.LOADED,
      data: application,
    }),
    [application]
  );

  return (
    <MockedProvider mocks={mocks} showWarnings>
      <AuthContext.Provider value={authCtxValue}>
        <FormContext.Provider value={formCtxValue}>{children}</FormContext.Provider>
      </AuthContext.Provider>
    </MockedProvider>
  );
};

describe("Accessibility", () => {
  it("should have no violations for the component (cancel)", async () => {
    const { container, getByTestId } = render(<Button />, {
      wrapper: ({ children }) => (
        <TestParent
          user={{ ...baseUser, _id: "owner", permissions: ["submission_request:cancel"] }}
          application={{
            ...baseApp,
            status: "New",
            applicant: { ...baseApp.applicant, applicantID: "owner" },
          }}
        >
          {children}
        </TestParent>
      ),
    });

    expect(getByTestId("cancel-application-button")).toBeEnabled();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("should have no violations for the component (disabled)", async () => {
    const { container, getByTestId } = render(<Button disabled />, {
      wrapper: ({ children }) => (
        <TestParent
          user={{ ...baseUser, _id: "owner", permissions: ["submission_request:cancel"] }}
          application={{
            ...baseApp,
            status: "New",
            applicant: { ...baseApp.applicant, applicantID: "owner" },
          }}
        >
          {children}
        </TestParent>
      ),
    });

    expect(getByTestId("cancel-application-button")).toBeDisabled(); // Sanity check for disabled
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should render without crashing", async () => {
    const { queryByTestId } = render(<Button />, {
      wrapper: TestParent,
    });

    await waitFor(() => {
      expect(queryByTestId("cancel-application-button")).not.toBeInTheDocument();
    });
  });

  it("should show a snackbar when the cancel operation fails (GraphQL Error)", async () => {
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

    const { getByRole, getByTestId } = render(<Button />, {
      wrapper: ({ children }) => (
        <TestParent
          mocks={mocks}
          user={{ ...baseUser, _id: "owner", permissions: ["submission_request:cancel"] }}
          application={{
            ...baseApp,
            status: "In Progress",
            applicant: { ...baseApp.applicant, applicantID: "owner" },
          }}
        >
          {children}
        </TestParent>
      ),
    });

    // Open confirmation dialog
    userEvent.click(getByTestId("cancel-application-button"));

    // Enter reason for action
    const input = await within(getByRole("dialog")).findByRole("textbox");
    userEvent.type(input, "mock reason");

    // Click dialog confirm button once it is enabled
    const button = await within(getByRole("dialog")).findByRole("button", { name: /confirm/i });

    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    userEvent.click(button);

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Oops! Unable to cancel the Submission Request.",
        {
          variant: "error",
        }
      );
    });
  });

  it("should show a snackbar when the cancel operation fails (Network Error)", async () => {
    const mocks: MockedResponse<CancelAppResp, CancelAppInput>[] = [
      {
        request: {
          query: CANCEL_APP,
        },
        variableMatcher: () => true,
        error: new Error("Simulated network error"),
      },
    ];

    const { getByRole, getByTestId } = render(<Button />, {
      wrapper: ({ children }) => (
        <TestParent
          mocks={mocks}
          user={{ ...baseUser, _id: "owner", permissions: ["submission_request:cancel"] }}
          application={{
            ...baseApp,
            status: "In Progress",
            applicant: { ...baseApp.applicant, applicantID: "owner" },
          }}
        >
          {children}
        </TestParent>
      ),
    });

    // Open confirmation dialog
    userEvent.click(getByTestId("cancel-application-button"));

    // Enter reason for action
    const input = await within(getByRole("dialog")).findByRole("textbox");
    userEvent.type(input, "mock reason");

    // Click dialog confirm button once it is enabled
    const button = await within(getByRole("dialog")).findByRole("button", { name: /confirm/i });

    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    userEvent.click(button);

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Oops! Unable to cancel the Submission Request.",
        {
          variant: "error",
        }
      );
    });
  });

  it("should show a snackbar when the cancel operation fails (API Error)", async () => {
    const mocks: MockedResponse<CancelAppResp, CancelAppInput>[] = [
      {
        request: {
          query: CANCEL_APP,
        },
        variableMatcher: () => true,
        result: {
          data: {
            cancelApplication: {
              _id: undefined,
            },
          },
        },
      },
    ];

    const { getByRole, getByTestId } = render(<Button />, {
      wrapper: ({ children }) => (
        <TestParent
          mocks={mocks}
          user={{ ...baseUser, _id: "owner", permissions: ["submission_request:cancel"] }}
          application={{
            ...baseApp,
            status: "In Progress",
            applicant: { ...baseApp.applicant, applicantID: "owner" },
          }}
        >
          {children}
        </TestParent>
      ),
    });

    // Open confirmation dialog
    userEvent.click(getByTestId("cancel-application-button"));

    // Enter reason for action
    const input = await within(getByRole("dialog")).findByRole("textbox");
    userEvent.type(input, "mock reason");

    // Click dialog confirm button once it is enabled
    const button = await within(getByRole("dialog")).findByRole("button", { name: /confirm/i });

    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    userEvent.click(button);

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Oops! Unable to cancel the Submission Request.",
        {
          variant: "error",
        }
      );
    });
  });

  it("should call the onCancel callback when the cancel operation is successful", async () => {
    const mocks: MockedResponse<CancelAppResp, CancelAppInput>[] = [
      {
        request: {
          query: CANCEL_APP,
        },
        variableMatcher: () => true,
        result: {
          data: {
            cancelApplication: {
              _id: "some id",
            },
          },
        },
      },
    ];

    const onCancelMock = jest.fn();

    const { getByRole, getByTestId } = render(<Button onCancel={onCancelMock} />, {
      wrapper: ({ children }) => (
        <TestParent
          mocks={mocks}
          user={{ ...baseUser, _id: "owner", permissions: ["submission_request:cancel"] }}
          application={{
            ...baseApp,
            status: "In Progress",
            applicant: { ...baseApp.applicant, applicantID: "owner" },
          }}
        >
          {children}
        </TestParent>
      ),
    });

    // Open confirmation dialog
    userEvent.click(getByTestId("cancel-application-button"));

    // Enter reason for action
    const input = await within(getByRole("dialog")).findByRole("textbox");
    userEvent.type(input, "mock reason");

    // Click dialog confirm button once it is enabled
    const button = await within(getByRole("dialog")).findByRole("button", { name: /confirm/i });

    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    userEvent.click(button);

    await waitFor(() => {
      expect(onCancelMock).toHaveBeenCalled();
    });
  });

  it("should not call the onCancel callback when the cancel operation fails", async () => {
    const mockMatcher = jest.fn().mockImplementation(() => true);
    const mocks: MockedResponse<CancelAppResp, CancelAppInput>[] = [
      {
        request: {
          query: CANCEL_APP,
        },
        variableMatcher: mockMatcher,
        result: {
          data: {
            cancelApplication: {
              _id: null,
            },
          },
        },
      },
    ];

    const onCancelMock = jest.fn();

    const { getByRole, getByTestId } = render(<Button onCancel={onCancelMock} />, {
      wrapper: ({ children }) => (
        <TestParent
          mocks={mocks}
          user={{ ...baseUser, _id: "owner", permissions: ["submission_request:cancel"] }}
          application={{
            ...baseApp,
            status: "In Progress",
            applicant: { ...baseApp.applicant, applicantID: "owner" },
          }}
        >
          {children}
        </TestParent>
      ),
    });

    // Open confirmation dialog
    userEvent.click(getByTestId("cancel-application-button"));

    // Enter reason for action
    const input = await within(getByRole("dialog")).findByRole("textbox");
    userEvent.type(input, "mock reason");

    // Click dialog confirm button once it is enabled
    const button = await within(getByRole("dialog")).findByRole("button", { name: /confirm/i });

    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    userEvent.click(button);

    await waitFor(() => {
      expect(mockMatcher).toHaveBeenCalled();
    });

    expect(onCancelMock).not.toHaveBeenCalled();
  });
});

describe("Implementation Requirements", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should be labeled 'Cancel Request' when the application is in a cancellable state", async () => {
    const { getByTestId } = render(<Button />, {
      wrapper: ({ children }) => (
        <TestParent
          user={{ ...baseUser, _id: "owner", permissions: ["submission_request:cancel"] }}
          application={{
            ...baseApp,
            status: "New",
            applicant: { ...baseApp.applicant, applicantID: "owner" },
          }}
        >
          {children}
        </TestParent>
      ),
    });

    expect(getByTestId("cancel-application-button")).toHaveTextContent("Cancel Request");
  });

  it("should have a tooltip present on the Cancel button", async () => {
    const { getByTestId, findByRole } = render(<Button />, {
      wrapper: ({ children }) => (
        <TestParent
          user={{ ...baseUser, _id: "owner", permissions: ["submission_request:cancel"] }}
          application={{
            ...baseApp,
            status: "New",
            applicant: { ...baseApp.applicant, applicantID: "owner" },
          }}
        >
          {children}
        </TestParent>
      ),
    });

    userEvent.hover(getByTestId("cancel-application-button"));

    const tooltip = await findByRole("tooltip");
    expect(tooltip).toBeVisible();
    expect(tooltip).toHaveTextContent(
      "This action will cancel the entire submission request and set its status to 'Canceled'"
    );

    userEvent.unhover(getByTestId("cancel-application-button"));

    await waitFor(() => {
      expect(tooltip).not.toBeInTheDocument();
    });
  });

  it("should dismiss the dialog when the 'Cancel' dialog button is clicked", async () => {
    const { findByRole, getByRole, getByTestId } = render(<Button />, {
      wrapper: ({ children }) => (
        <TestParent
          user={{ ...baseUser, _id: "owner", permissions: ["submission_request:cancel"] }}
          application={{
            ...baseApp,
            status: "In Progress",
            applicant: { ...baseApp.applicant, applicantID: "owner" },
          }}
        >
          {children}
        </TestParent>
      ),
    });

    userEvent.click(getByTestId("cancel-application-button"));

    const dialog = await findByRole("dialog");
    expect(dialog).toBeInTheDocument();

    const button = await within(dialog).findByRole("button", { name: /cancel/i });
    userEvent.click(button);

    await waitFor(() => {
      expect(() => getByRole("dialog")).toThrow();
    });
  });

  // NOTE: They own the application, but the permission is missing
  it("should not be rendered when the user is missing the required permissions", async () => {
    const { queryByTestId } = render(<Button />, {
      wrapper: ({ children }) => (
        <TestParent
          user={{ ...baseUser, _id: "owner", permissions: [] }}
          application={{
            ...baseApp,
            status: "In Progress",
            applicant: { ...baseApp.applicant, applicantID: "owner" },
          }}
        >
          {children}
        </TestParent>
      ),
    });

    await waitFor(() => {
      expect(queryByTestId("cancel-application-button")).not.toBeInTheDocument();
    });
  });

  it("should not be rendered when the user is not the applicant", async () => {
    const { queryByTestId } = render(<Button />, {
      wrapper: ({ children }) => (
        <TestParent
          user={{ ...baseUser, _id: "owner", permissions: ["submission_request:cancel"] }}
          application={{
            ...baseApp,
            status: "In Progress",
            applicant: { ...baseApp.applicant, applicantID: "NOT THE CURRENT USER" },
          }}
        >
          {children}
        </TestParent>
      ),
    });

    await waitFor(() => {
      expect(queryByTestId("cancel-application-button")).not.toBeInTheDocument();
    });
  });

  // NOTE: This is just a sanity check against component logic, and does not
  // cover all of the requirements. See the hasPermission checks for that.
  it.each<ApplicationStatus>(["Canceled", "Deleted"])(
    "should not be rendered for the Submission Request status '%s'",
    async (status) => {
      const { queryByTestId } = render(<Button />, {
        wrapper: ({ children }) => (
          <TestParent
            user={{ ...baseUser, _id: "owner", permissions: ["submission_request:cancel"] }}
            application={{
              ...baseApp,
              status,
              applicant: { ...baseApp.applicant, applicantID: "owner" },
            }}
          >
            {children}
          </TestParent>
        ),
      });

      await waitFor(() => {
        expect(queryByTestId("cancel-application-button")).not.toBeInTheDocument();
      });
    }
  );

  it("should render the Study Abbreviation in the dialog description", async () => {
    const { getByRole, getByTestId } = render(<Button />, {
      wrapper: ({ children }) => (
        <TestParent
          user={{ ...baseUser, _id: "owner", permissions: ["submission_request:cancel"] }}
          application={{
            ...baseApp,
            status: "New",
            studyAbbreviation: "TEST",
            applicant: { ...baseApp.applicant, applicantID: "owner" },
          }}
        >
          {children}
        </TestParent>
      ),
    });

    userEvent.click(getByTestId("cancel-application-button"));

    const dialog = getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    expect(getByTestId("delete-dialog-description")).toHaveTextContent("Study: TEST");
  });

  it("should fallback to 'NA' for the Study Abbreviation in the dialog description", async () => {
    const { getByRole, getByTestId } = render(<Button />, {
      wrapper: ({ children }) => (
        <TestParent
          user={{ ...baseUser, _id: "owner", permissions: ["submission_request:cancel"] }}
          application={{
            ...baseApp,
            status: "New",
            studyAbbreviation: "",
            applicant: { ...baseApp.applicant, applicantID: "owner" },
          }}
        >
          {children}
        </TestParent>
      ),
    });

    userEvent.click(getByTestId("cancel-application-button"));

    const dialog = getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    expect(getByTestId("delete-dialog-description")).toHaveTextContent("Study: NA");
  });

  it("should require a reason for canceling", async () => {
    const mockMatcher = jest.fn().mockImplementation(() => true);
    const mocks: MockedResponse<CancelAppResp, CancelAppInput>[] = [
      {
        request: {
          query: CANCEL_APP,
        },
        variableMatcher: mockMatcher,
        result: {
          data: {
            cancelApplication: {
              _id: "some id",
            },
          },
        },
      },
    ];

    const { getByRole, getByTestId } = render(<Button />, {
      wrapper: ({ children }) => (
        <TestParent
          mocks={mocks}
          user={{ ...baseUser, _id: "owner", permissions: ["submission_request:cancel"] }}
          application={{
            ...baseApp,
            _id: "mock-id-cancel-reason",
            status: "New",
            applicant: { ...baseApp.applicant, applicantID: "owner" },
          }}
        >
          {children}
        </TestParent>
      ),
    });

    // Open confirmation dialog
    userEvent.click(getByTestId("cancel-application-button"));

    const button = await within(getByRole("dialog")).findByRole("button", { name: /confirm/i });

    expect(button).toBeDisabled();

    const input = await within(getByRole("dialog")).findByRole("textbox");
    userEvent.type(input, "this is a mock reason xyz 123");

    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    userEvent.click(button);

    await waitFor(() => {
      expect(mockMatcher).toHaveBeenCalledWith({
        _id: "mock-id-cancel-reason",
        comment: "this is a mock reason xyz 123",
      });
    });
  });

  it.each<{ scenario: string; status: ApplicationStatus }>([{ scenario: "Cancel", status: "New" }])(
    "should limit the reason field to 500 characters ($scenario Action)",
    async ({ status }) => {
      const mockMatcher = jest.fn().mockImplementation(() => true);
      const mocks: MockedResponse[] = [
        {
          request: {
            query: CANCEL_APP,
          },
          variableMatcher: mockMatcher,
          result: {
            data: null,
          },
        },
      ];

      const { getByRole, getByTestId, findByRole } = render(<Button />, {
        wrapper: ({ children }) => (
          <TestParent
            mocks={mocks}
            user={{ ...baseUser, _id: "owner", permissions: ["submission_request:cancel"] }}
            application={{
              ...baseApp,
              status,
              applicant: { ...baseApp.applicant, applicantID: "owner" },
            }}
          >
            {children}
          </TestParent>
        ),
      });

      // Open confirmation dialog
      userEvent.click(getByTestId("cancel-application-button"));

      await findByRole("dialog");

      const button = await within(getByRole("dialog")).findByRole("button", { name: /confirm/i });

      expect(button).toBeDisabled();

      const input = await within(getByRole("dialog")).findByRole("textbox");

      userEvent.type(input, "X".repeat(550));

      // NOTE: the button is still enabled because of the maxLength on the input field
      await waitFor(() => {
        expect(button).toBeEnabled();
      });

      userEvent.click(button);

      expect(mockMatcher).toHaveBeenCalledWith({
        _id: expect.any(String),
        comment: "X".repeat(500),
      });
    }
  );
});
