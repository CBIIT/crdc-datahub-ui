import { FC } from "react";
import { render, waitFor } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import { Context, ContextState, Status as AuthStatus } from "../Contexts/AuthContext";
import { CrossValidationButton } from "./CrossValidationButton";

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
    const { getByTestId } = render(
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

    // TODO: Mock the API response to simulate a success state
    // this will cause silent GraphQL mock errors if not implemented

    await waitFor(() => userEvent.click(getByTestId("cross-validate-button")));

    await waitFor(() => {
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
    const { getByTestId } = render(
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

    // TODO: Mock the API response to simulate a network error

    await waitFor(() => userEvent.click(getByTestId("cross-validate-button")));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("Unable to initiate validation process.", {
        variant: "error",
      });
      expect(getByTestId("cross-validate-button")).toBeEnabled();
    });
  });

  it("should handle API GraphQL errors gracefully", async () => {
    const { getByTestId } = render(
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

    // TODO: Mock the API response to simulate a GRAPHQL error

    await waitFor(() => userEvent.click(getByTestId("cross-validate-button")));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("Unable to initiate validation process.", {
        variant: "error",
      });
      expect(getByTestId("cross-validate-button")).toBeEnabled();
    });
  });

  it("should call the onValidate callback when clicked (success)", async () => {
    const onValidate = jest.fn();

    const { getByTestId } = render(
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
          onValidate={onValidate}
        />
      </TestParent>
    );

    await waitFor(() => userEvent.click(getByTestId("cross-validate-button")));

    expect(onValidate).toHaveBeenCalledTimes(1);
    expect(onValidate).toHaveBeenCalledWith(true);
  });

  it("should call the onValidate callback when clicked (failure)", async () => {
    const onValidate = jest.fn();

    const { getByTestId } = render(
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
          onValidate={onValidate}
        />
      </TestParent>
    );

    // TODO: Mock the API response to simulate a failure state

    await waitFor(() => userEvent.click(getByTestId("cross-validate-button")));

    expect(onValidate).toHaveBeenCalledTimes(1);
    expect(onValidate).toHaveBeenCalledWith(false);
  });
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

  it("should be disabled if there are no other related Submitted submissions", () => {
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

    expect(getByTestId("cross-validate-button")).toBeInTheDocument();
    expect(getByTestId("cross-validate-button")).toBeDisabled();
  });

  it.each<ValidationStatus>(["Passed", "Warning", "Error"])(
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
    "should always render for the role %s",
    (role) => {
      const { getByTestId } = render(
        <TestParent context={{ ...baseContext, user: { ...baseUser, role } }}>
          <CrossValidationButton
            submission={{
              ...baseSubmission,
              status: "Submitted",
              _id: `render-role-test-${role}-id`,
              crossSubmissionStatus: null,
              otherSubmissions: null,
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
            // NOTE: Visibility logic is NOT tied to these properties
            crossSubmissionStatus: null,
            otherSubmissions: null,
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
