import { FC } from "react";
import { getByLabelText, render } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { axe } from "jest-axe";
import { Context, ContextState, Status as AuthStatus } from "../Contexts/AuthContext";
import ValidationControls from "./ValidationControls";

// NOTE: We omit all properties that the component specifically depends on
const baseSubmission: Omit<
  Submission,
  "_id" | "status" | "metadataValidationStatus" | "fileValidationStatus"
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
  crossSubmissionStatus: null,
  fileErrors: [],
  history: [],
  otherSubmissions: null,
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
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Submitter" } }}>
        <ValidationControls
          dataSubmission={{
            ...baseSubmission,
            _id: "example-sub-id",
            status: "In Progress",
            metadataValidationStatus: "New",
            fileValidationStatus: "New",
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it("should not have accessibility violations (disabled)", async () => {
    const { container } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Submitter" } }}>
        <ValidationControls
          dataSubmission={{
            ...baseSubmission,
            _id: "example-sub-id-disabled",
            status: "Submitted", // NOTE: This disables the entire component
            metadataValidationStatus: "Passed",
            fileValidationStatus: "Passed",
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should render without crashing", () => {
    render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Submitter" } }}>
        <ValidationControls dataSubmission={null} onValidate={null} />
      </TestParent>
    );
  });

  it.todo("should show a success snackbar when validation is successful");

  it.todo("should initiate Metadata validation when 'Validate Metadata' is selected");

  it.todo("should initiate Data Files validation when 'Validate Data Files' is selected");

  it.todo("should initiate Metadata and Data Files validation when 'Both' is selected");

  it.todo("should initiate against 'New' files when 'New Uploaded Data' is selected");

  it.todo("should initiate against 'All' files when 'All Uploaded Data' is selected");

  it.todo("should handle API network errors gracefully");

  it.todo("should handle API GraphQL errors gracefully");

  // NOTE: this becomes it.each
  it.todo("should call the onValidate callback when clicked with %s");
});

describe("Implementation Requirements", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should render as disabled with text 'Validating...' when metadata is validating", () => {
    const { getByTestId } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Submitter" } }}>
        <ValidationControls
          dataSubmission={{
            ...baseSubmission,
            _id: "example-sub-id-disabled",
            status: "In Progress",
            metadataValidationStatus: "Validating",
            fileValidationStatus: null,
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(getByTestId("validate-controls-validate-button")).toBeDisabled();
    expect(getByTestId("validate-controls-validate-button")).toHaveTextContent("Validating...");
  });

  it("should render as disabled with text 'Validating...' when data files are validating", () => {
    const { getByTestId } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Submitter" } }}>
        <ValidationControls
          dataSubmission={{
            ...baseSubmission,
            _id: "example-sub-id-disabled",
            status: "In Progress",
            metadataValidationStatus: null,
            fileValidationStatus: "Validating",
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(getByTestId("validate-controls-validate-button")).toBeDisabled();
    expect(getByTestId("validate-controls-validate-button")).toHaveTextContent("Validating...");
  });

  it.todo("should reset the validation type and upload type after validation");

  it("should select 'Validate Metadata' Validation Type by default", () => {
    const { getByTestId } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Submitter" } }}>
        <ValidationControls
          dataSubmission={{
            ...baseSubmission,
            _id: "example-sub-id-disabled",
            status: "In Progress",
            metadataValidationStatus: null,
            fileValidationStatus: null,
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    const radio = getByTestId("validate-controls-validation-type") as HTMLInputElement;

    expect(getByLabelText(radio, "Validate Metadata")).toBeChecked();
    expect(getByLabelText(radio, "Validate Metadata")).toBeDisabled();
    expect(getByLabelText(radio, "Validate Data Files")).toBeDisabled();
    expect(getByLabelText(radio, "Both")).toBeDisabled();
  });

  it("should select 'Validate Data Files' validation type when only Data Files are uploaded", () => {
    const { getByTestId } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Submitter" } }}>
        <ValidationControls
          dataSubmission={{
            ...baseSubmission,
            _id: "example-sub-id-disabled",
            status: "In Progress",
            metadataValidationStatus: null,
            fileValidationStatus: "New",
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    const radio = getByTestId("validate-controls-validation-type") as HTMLInputElement;

    expect(getByLabelText(radio, "Validate Metadata")).toBeDisabled();
    expect(getByLabelText(radio, "Validate Data Files")).toBeChecked();
    expect(getByLabelText(radio, "Both")).toBeDisabled();
  });

  it("should enable all options when both Metadata and Data Files are uploaded", () => {
    const { getByTestId } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Submitter" } }}>
        <ValidationControls
          dataSubmission={{
            ...baseSubmission,
            _id: "example-sub-id-disabled",
            status: "In Progress",
            metadataValidationStatus: "New",
            fileValidationStatus: "New",
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    const radio = getByTestId("validate-controls-validation-type") as HTMLInputElement;

    expect(getByLabelText(radio, "Validate Metadata")).toBeEnabled();
    expect(getByLabelText(radio, "Validate Data Files")).toBeEnabled();
    expect(getByLabelText(radio, "Both")).toBeEnabled();
  });

  it("should disable 'Validate Data Files' and 'Both' for the submission intent of 'Delete'", () => {
    const { getByTestId } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Submitter" } }}>
        <ValidationControls
          dataSubmission={{
            ...baseSubmission,
            _id: "example-sub-id-disabled",
            status: "In Progress",
            metadataValidationStatus: "New",
            fileValidationStatus: "New",
            intention: "Delete",
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    const radio = getByTestId("validate-controls-validation-type") as HTMLInputElement;

    expect(getByLabelText(radio, "Validate Metadata")).toBeEnabled();
    expect(getByLabelText(radio, "Validate Data Files")).toBeDisabled();
    expect(getByLabelText(radio, "Both")).toBeDisabled();
  });

  it.each<SubmissionStatus>([
    "New",
    "Submitted",
    "Released",
    "Completed",
    "Archived",
    "Canceled",
    "fake status" as SubmissionStatus,
  ])("should be disabled when the Submission status is '%s'", (status) => {
    const { getByTestId } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Submitter" } }}>
        <ValidationControls
          dataSubmission={{
            ...baseSubmission,
            _id: "example-sub-id-disabled",
            status,
            metadataValidationStatus: "Passed",
            fileValidationStatus: "Passed",
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    const radio = getByTestId("validate-controls-validation-type") as HTMLInputElement;

    expect(getByTestId("validate-controls-validate-button")).toBeDisabled();
    expect(getByLabelText(radio, "Validate Metadata")).toBeDisabled();
    expect(getByLabelText(radio, "Validate Data Files")).toBeDisabled();
    expect(getByLabelText(radio, "Both")).toBeDisabled();
  });

  it.each<User["role"]>([
    "Federal Lead",
    "Data Commons POC",
    "User",
    "fake user role" as User["role"],
  ])("should be disabled for the role %s", (role) => {
    const { getByTestId } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role } }}>
        <ValidationControls
          dataSubmission={{
            ...baseSubmission,
            _id: "example-sub-id-disabled",
            status: "In Progress",
            metadataValidationStatus: "Passed",
            fileValidationStatus: "Passed",
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    const radio = getByTestId("validate-controls-validation-type") as HTMLInputElement;

    expect(getByTestId("validate-controls-validate-button")).toBeDisabled();
    expect(getByLabelText(radio, "Validate Metadata")).toBeDisabled();
    expect(getByLabelText(radio, "Validate Data Files")).toBeDisabled();
    expect(getByLabelText(radio, "Both")).toBeDisabled();
  });

  it("should update back to the default text when the submission is no longer validating", () => {
    const submission: Submission = {
      ...baseSubmission,
      _id: "validating-test-id",
      status: "In Progress",
      metadataValidationStatus: "Validating",
      fileValidationStatus: "Validating",
    };

    const { getByTestId, rerender } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Submitter" } }}>
        <ValidationControls dataSubmission={submission} onValidate={jest.fn()} />
      </TestParent>
    );

    expect(getByTestId("validate-controls-validate-button")).toBeDisabled();
    expect(getByTestId("validate-controls-validate-button")).toHaveTextContent("Validating...");

    rerender(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Submitter" } }}>
        <ValidationControls
          dataSubmission={{
            ...submission,
            metadataValidationStatus: "Passed",
            fileValidationStatus: "Passed",
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(getByTestId("validate-controls-validate-button")).toBeEnabled();
    expect(getByTestId("validate-controls-validate-button")).toHaveTextContent(/validate/i);
  });
});
