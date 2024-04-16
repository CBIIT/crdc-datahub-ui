import { FC } from "react";
import { render, waitFor } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import { GraphQLError } from "graphql";
import { Context, ContextState, Status as AuthStatus } from "../Contexts/AuthContext";
import { CrossValidationButton } from "./CrossValidationButton";
import { VALIDATE_SUBMISSION, ValidateSubmissionResp } from "../../graphql";

// NOTE: We omit all properties that the component specifically depends on
const baseSubmission: Omit<
  Submission,
  "_id" | "status" | "crossSubmissionStatus" | "otherSubmissions"
> = {
  name: "",
  submitterID: "",
  submitterName: "",
  organization: null,
  dataCommons: "",
  modelVersion: "",
  studyAbbreviation: "",
  dbGaPID: "",
  bucketName: "",
  rootPath: "",
  metadataValidationStatus: "Passed",
  fileValidationStatus: "Passed",
  fileErrors: [],
  history: [],
  conciergeName: "",
  conciergeEmail: "",
  createdAt: "",
  updatedAt: "",
  intention: "New",
};

const baseContext: ContextState = {
  status: AuthStatus.LOADED,
  isLoggedIn: false,
  user: null,
};

const baseUser: Omit<User, "role"> = {
  _id: "",
  firstName: "",
  lastName: "",
  userStatus: "Active",
  IDP: "nih",
  email: "",
  organization: null,
  dataCommons: [],
  createdAt: "",
  updateAt: "",
};

type ParentProps = {
  mocks?: MockedResponse[];
  context?: ContextState;
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({
  context = baseContext,
  mocks = [],
  children,
}: ParentProps) => (
  <Context.Provider value={context}>
    <MockedProvider mocks={mocks} showWarnings>
      {children}
    </MockedProvider>
  </Context.Provider>
);

describe("Accessibility", () => {
  it("should not have accessibility violations", async () => {
    const { container } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}>
        <CrossValidationButton
          submission={{
            ...baseSubmission,
            _id: "example-sub-id",
            status: "Submitted",
            crossSubmissionStatus: "New",
            otherSubmissions: {
              "In-progress": [],
              Submitted: ["submitted-id"],
            },
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it("should not have accessibility violations (disabled)", async () => {
    const { container, getByTestId } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}>
        <CrossValidationButton
          submission={{
            ...baseSubmission,
            _id: "example-sub-id",
            // NOTE: This disables the button
            status: "New",
            crossSubmissionStatus: null,
            otherSubmissions: {
              "In-progress": [],
              Submitted: ["submitted-id"],
            },
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(getByTestId("cross-validate-button")).toBeDisabled();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should render without crashing", () => {
    render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}>
        <CrossValidationButton
          submission={{
            ...baseSubmission,
            _id: "smoke-test-id",
            status: null,
            otherSubmissions: null,
            crossSubmissionStatus: null,
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );
  });

  it("should initiate cross validation when clicked", async () => {
    const submissionID = "base-success-test-onclick-id";
    let called = false;
    const mocks: MockedResponse<ValidateSubmissionResp>[] = [
      {
        request: {
          query: VALIDATE_SUBMISSION,
          variables: {
            _id: submissionID,
            types: ["cross-submission"],
            scope: "All",
          },
        },
        result: () => {
          called = true;

          return {
            data: {
              validateSubmission: {
                success: true,
              },
            },
          };
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks} context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}>
        <CrossValidationButton
          submission={{
            ...baseSubmission,
            _id: submissionID,
            status: "Submitted",
            crossSubmissionStatus: "New",
            otherSubmissions: {
              "In-progress": [],
              Submitted: ["submitted-id"],
            },
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(called).toBe(false);

    await waitFor(() => userEvent.click(getByTestId("cross-validate-button")));

    await waitFor(() => {
      expect(called).toBe(true);
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Validation process is starting; this may take some time. Please wait before initiating another validation.",
        {
          variant: "success",
        }
      );
      expect(getByTestId("cross-validate-button")).toBeDisabled();
    });
  });

  it("should handle API network errors gracefully", async () => {
    const submissionID = "base-network-error-test-id";
    const mocks: MockedResponse<ValidateSubmissionResp>[] = [
      {
        request: {
          query: VALIDATE_SUBMISSION,
        },
        variableMatcher: () => true,
        error: new Error("Mock network error"),
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks} context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}>
        <CrossValidationButton
          submission={{
            ...baseSubmission,
            _id: submissionID,
            status: "Submitted",
            crossSubmissionStatus: "New",
            otherSubmissions: {
              "In-progress": [],
              Submitted: ["submitted-id"],
            },
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    await waitFor(() => userEvent.click(getByTestId("cross-validate-button")));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("Unable to initiate validation process.", {
        variant: "error",
      });
      expect(getByTestId("cross-validate-button")).toBeEnabled();
    });
  });

  it("should handle API GraphQL errors gracefully", async () => {
    const submissionID = "base-GraphQL-error-test-id";
    const mocks: MockedResponse<ValidateSubmissionResp>[] = [
      {
        request: {
          query: VALIDATE_SUBMISSION,
        },
        variableMatcher: () => true,
        result: {
          errors: [new GraphQLError("Mock GraphQL error")],
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks} context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}>
        <CrossValidationButton
          submission={{
            ...baseSubmission,
            _id: submissionID,
            status: "Submitted",
            crossSubmissionStatus: "New",
            otherSubmissions: {
              "In-progress": [],
              Submitted: ["submitted-id"],
            },
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    await waitFor(() => userEvent.click(getByTestId("cross-validate-button")));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("Unable to initiate validation process.", {
        variant: "error",
      });
      expect(getByTestId("cross-validate-button")).toBeEnabled();
    });
  });

  it.each<boolean>([true, false])(
    "should call the onValidate callback when clicked with %s",
    async (result) => {
      const onValidate = jest.fn();
      const submissionID = "base-onValidate-failure-test-id";
      const mocks: MockedResponse<ValidateSubmissionResp>[] = [
        {
          request: {
            query: VALIDATE_SUBMISSION,
          },
          variableMatcher: () => true,
          result: {
            data: {
              validateSubmission: {
                success: result, // Simulated success/failure using the result parameter
              },
            },
          },
        },
      ];

      const { getByTestId } = render(
        <TestParent
          mocks={mocks}
          context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}
        >
          <CrossValidationButton
            submission={{
              ...baseSubmission,
              _id: submissionID,
              status: "Submitted",
              crossSubmissionStatus: "New",
              otherSubmissions: {
                "In-progress": [],
                Submitted: ["submitted-id"],
              },
            }}
            onValidate={onValidate}
          />
        </TestParent>
      );

      await waitFor(() => userEvent.click(getByTestId("cross-validate-button")));

      await waitFor(() => {
        expect(onValidate).toHaveBeenCalledTimes(1);
        expect(onValidate).toHaveBeenCalledWith(result);
      });
    }
  );
});

describe("Implementation Requirements", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should be named 'Validate Cross-Submissions'", () => {
    const { getByText } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}>
        <CrossValidationButton
          submission={{
            ...baseSubmission,
            _id: "example-sub-id",
            status: "Submitted",
            crossSubmissionStatus: "New",
            otherSubmissions: {
              "In-progress": [],
              Submitted: ["submitted-id"],
            },
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(getByText("Validate Cross-Submissions")).toBeInTheDocument();
  });

  it("should render as disabled with text 'Validating...' when the submission is validating", () => {
    const { getByTestId } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}>
        <CrossValidationButton
          submission={{
            ...baseSubmission,
            _id: "validating-test-id",
            status: "Submitted",
            crossSubmissionStatus: "Validating",
            otherSubmissions: {
              "In-progress": ["some-other-id"],
              Submitted: ["submitted-id"],
            },
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(getByTestId("cross-validate-button")).toBeDisabled();
    expect(getByTestId("cross-validate-button")).toHaveTextContent("Validating...");
  });

  it("should update back to the default text when the submission is no longer validating", () => {
    const submission: Submission = {
      ...baseSubmission,
      _id: "validating-test-id",
      status: "Submitted",
      crossSubmissionStatus: "Validating",
      otherSubmissions: {
        "In-progress": [],
        Submitted: ["submitted-id"],
      },
    };

    const { getByTestId, rerender } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}>
        <CrossValidationButton submission={submission} onValidate={jest.fn()} />
      </TestParent>
    );

    expect(getByTestId("cross-validate-button")).toBeDisabled();
    expect(getByTestId("cross-validate-button")).toHaveTextContent("Validating...");

    rerender(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}>
        <CrossValidationButton
          submission={{
            ...submission,
            crossSubmissionStatus: "Passed",
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(getByTestId("cross-validate-button")).toBeEnabled();
    expect(getByTestId("cross-validate-button")).toHaveTextContent("Validate Cross-Submissions");
  });

  it("should be enabled only if there are other related Submitted submissions", () => {
    const { getByTestId } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}>
        <CrossValidationButton
          submission={{
            ...baseSubmission,
            _id: "validating-test-id",
            status: "Submitted",
            crossSubmissionStatus: "New",
            otherSubmissions: {
              "In-progress": [],
              Submitted: ["submitted-id", "another-submitted-id"],
            },
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(getByTestId("cross-validate-button")).toBeInTheDocument();
    expect(getByTestId("cross-validate-button")).toBeEnabled();
  });

  it("should be HIDDEN if there are no other related Submitted submissions", () => {
    const { getByTestId } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}>
        <CrossValidationButton
          submission={{
            ...baseSubmission,
            _id: "validating-test-id",
            status: "Submitted",
            crossSubmissionStatus: "New",
            otherSubmissions: {
              "In-progress": ["in-prog-id", "another-in-prog-id"],
              Submitted: [], // NOTE: This disables the button
            },
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(() => getByTestId("cross-validate-button")).toThrow();
  });

  it.each<CrossSubmissionStatus>(["Passed", "Error"])(
    "should not be disabled based on the crossSubmissionStatus (checking '%s')",
    (status) => {
      const { getByTestId } = render(
        <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}>
          <CrossValidationButton
            submission={{
              ...baseSubmission,
              _id: `not-disabled-assertion-${status}-id`,
              status: "Submitted",
              crossSubmissionStatus: status,
              otherSubmissions: {
                "In-progress": ["submitted-id", "another-submitted-id"],
                Submitted: ["submitted-id", "another-submitted-id"],
              },
            }}
            onValidate={jest.fn()}
          />
        </TestParent>
      );

      expect(getByTestId("cross-validate-button")).toBeInTheDocument();
      expect(getByTestId("cross-validate-button")).toBeEnabled();
    }
  );

  it.each<User["role"]>(["Data Curator", "Admin"])(
    "should always render for the role %s with Other Submissions present",
    (role) => {
      const { getByTestId } = render(
        <TestParent context={{ ...baseContext, user: { ...baseUser, role } }}>
          <CrossValidationButton
            submission={{
              ...baseSubmission,
              status: "Submitted",
              _id: `render-role-test-${role}-id`,
              crossSubmissionStatus: null,
              otherSubmissions: {
                "In-progress": [],
                Submitted: ["submitted-id", "another-submitted-id"],
              },
            }}
            onValidate={jest.fn()}
          />
        </TestParent>
      );

      expect(getByTestId("cross-validate-button")).toBeInTheDocument();
    }
  );

  it.each<User["role"]>([
    "Submitter",
    "Organization Owner",
    "Federal Lead",
    "Data Commons POC",
    "fake role" as User["role"],
  ])("should never render for the role %s", (role) => {
    const { getByTestId } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role } }}>
        <CrossValidationButton
          submission={{
            ...baseSubmission,
            _id: `role-test-${role}-id`,
            status: "Submitted",
            crossSubmissionStatus: null,
            otherSubmissions: {
              "In-progress": [],
              // NOTE: Even with these values, the button should not render
              Submitted: ["submitted-id", "another-submitted-id"],
            },
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(() => getByTestId("cross-validate-button")).toThrow();
  });

  it("should only be enabled for the Submission status of 'Submitted'", () => {
    const { getByTestId } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}>
        <CrossValidationButton
          submission={{
            ...baseSubmission,
            _id: "render-status-test-Submitted-id",
            status: "Submitted",
            crossSubmissionStatus: "New",
            otherSubmissions: {
              "In-progress": [],
              Submitted: ["this-enables-the-button"],
            },
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(getByTestId("cross-validate-button")).toBeInTheDocument();
    expect(getByTestId("cross-validate-button")).toBeEnabled();
  });

  it.each<Submission["status"]>([
    "New",
    "In Progress",
    "Withdrawn",
    "Released",
    "Completed",
    "Archived",
    "Canceled",
    "fake status" as Submission["status"],
  ])("should always be disabled for the Submission status of '%s'", (status) => {
    const { getByTestId } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}>
        <CrossValidationButton
          submission={{
            ...baseSubmission,
            _id: `render-status-test-${status}-id`,
            status,
            crossSubmissionStatus: "New",
            otherSubmissions: {
              "In-progress": [],
              Submitted: ["this-enables-the-button"],
            },
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(getByTestId("cross-validate-button")).toBeInTheDocument();
    expect(getByTestId("cross-validate-button")).toBeDisabled();
  });
});
