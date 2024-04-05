import { FC } from "react";
import { render } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { axe } from "jest-axe";
import { Context, ContextState, Status as AuthStatus } from "../Contexts/AuthContext";
import { CrossValidationButton } from "./CrossValidationButton";

const baseSubmission: Omit<Submission, "_id" | "crossSubmissionStatus" | "otherSubmissions"> = {
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
  status: "Submitted",
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
            crossSubmissionStatus: "Validating",
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
            otherSubmissions: null,
            crossSubmissionStatus: null,
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );
  });

  // TODO: it("should initiate cross validation when clicked", async () => {});

  // TODO: it("should handle API network errors gracefully", () => {});

  // TODO: it("should handle API GraphQL errors gracefully", () => {});

  // TODO: it("should call the onValidate callback when clicked (success)", async () => {});

  // TODO: it("should call the onValidate callback when clicked (failure)", async () => {});
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
            crossSubmissionStatus: "New",
            otherSubmissions: {
              "In-progress": ["some-other-id"],
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
      crossSubmissionStatus: "Validating",
      otherSubmissions: {
        "In-progress": ["some-other-id"],
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
            crossSubmissionStatus: "New",
            otherSubmissions: {
              "In-progress": ["inprog-id", "another-inprog-id"],
              Submitted: [],
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
    "should not be disabled even if the crossSubmissionStatus is %s",
    (status) => {
      const { getByTestId } = render(
        <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}>
          <CrossValidationButton
            submission={{
              ...baseSubmission,
              _id: `not-disabled-assertion-${status}-id`,
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
            // NOTE: Rendering logic is not tied to these properties
            crossSubmissionStatus: null,
            otherSubmissions: null,
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(() => getByTestId("cross-validate-button")).toThrow();
  });
});
