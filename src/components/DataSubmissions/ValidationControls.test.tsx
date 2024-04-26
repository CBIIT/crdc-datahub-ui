import { FC } from "react";
import { act, getByLabelText, render, waitFor } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import { GraphQLError } from "graphql";
import { Context, ContextState, Status as AuthStatus } from "../Contexts/AuthContext";
import ValidationControls from "./ValidationControls";
import { VALIDATE_SUBMISSION, ValidateSubmissionResp } from "../../graphql";

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

  it("should show a success snackbar when validation is successful", async () => {
    const submissionID = "base-success-test-onclick-id";
    let called = false;
    const mocks: MockedResponse<ValidateSubmissionResp>[] = [
      {
        request: {
          query: VALIDATE_SUBMISSION,
        },
        variableMatcher: () => true,
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
        <ValidationControls
          dataSubmission={{
            ...baseSubmission,
            _id: submissionID,
            status: "In Progress",
            metadataValidationStatus: "New",
            fileValidationStatus: "New",
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(called).toBe(false);

    userEvent.click(getByTestId("validate-controls-validate-button"));

    await waitFor(() => {
      expect(called).toBe(true);
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Validation process is starting; this may take some time. Please wait before initiating another validation.",
        {
          variant: "success",
        }
      );
      expect(getByTestId("validate-controls-validate-button")).toBeDisabled();
    });
  });

  it("should initiate Metadata validation when 'Validate Metadata' is selected", async () => {
    const submissionID = "base-onclick-metadata-id";
    let called = false;
    const mocks: MockedResponse<ValidateSubmissionResp>[] = [
      {
        request: {
          query: VALIDATE_SUBMISSION,
          variables: {
            _id: submissionID,
            types: ["metadata"],
            scope: "New",
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
        <ValidationControls
          dataSubmission={{
            ...baseSubmission,
            _id: submissionID,
            status: "In Progress",
            metadataValidationStatus: "New",
            fileValidationStatus: null,
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(called).toBe(false);

    const radio = getByTestId("validate-controls-validation-type") as HTMLInputElement;

    await act(async () => userEvent.click(getByLabelText(radio, "Validate Metadata")));

    userEvent.click(getByTestId("validate-controls-validate-button"));

    await waitFor(() => {
      expect(called).toBe(true);
    });
  });

  it("should initiate Data Files validation when 'Validate Data Files' is selected", async () => {
    const submissionID = "data-files-validation-id";
    let called = false;
    const mocks: MockedResponse<ValidateSubmissionResp>[] = [
      {
        request: {
          query: VALIDATE_SUBMISSION,
          variables: {
            _id: submissionID,
            types: ["file"],
            scope: "New",
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
        <ValidationControls
          dataSubmission={{
            ...baseSubmission,
            _id: submissionID,
            status: "In Progress",
            metadataValidationStatus: null,
            fileValidationStatus: "New",
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(called).toBe(false);

    const radio = getByTestId("validate-controls-validation-type") as HTMLInputElement;
    await act(async () => userEvent.click(getByLabelText(radio, "Validate Data Files")));

    userEvent.click(getByTestId("validate-controls-validate-button"));

    await waitFor(() => {
      expect(called).toBe(true);
    });
  });

  it("should initiate Metadata and Data Files validation when 'Both' is selected", async () => {
    const submissionID = "metadata-and-files-validation-id";
    let called = false;
    const mocks: MockedResponse<ValidateSubmissionResp>[] = [
      {
        request: {
          query: VALIDATE_SUBMISSION,
          variables: {
            _id: submissionID,
            types: ["metadata", "file"],
            scope: "New",
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
        <ValidationControls
          dataSubmission={{
            ...baseSubmission,
            _id: submissionID,
            status: "In Progress",
            metadataValidationStatus: "New",
            fileValidationStatus: "New",
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(called).toBe(false);

    const radio = getByTestId("validate-controls-validation-type") as HTMLInputElement;
    await act(async () => userEvent.click(getByLabelText(radio, "Both")));

    userEvent.click(getByTestId("validate-controls-validate-button"));

    await waitFor(() => {
      expect(called).toBe(true);
    });
  });

  it("should initiate against 'New' files when 'New Uploaded Data' is selected", async () => {
    const submissionID = "new-uploads-validation-id";
    let called = false;
    const mocks: MockedResponse<ValidateSubmissionResp>[] = [
      {
        request: {
          query: VALIDATE_SUBMISSION,
          variables: {
            _id: submissionID,
            types: ["metadata"], // NOTE: this is just the default type
            scope: "New",
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
        <ValidationControls
          dataSubmission={{
            ...baseSubmission,
            _id: submissionID,
            status: "In Progress",
            metadataValidationStatus: "New",
            fileValidationStatus: null,
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    expect(called).toBe(false);

    const radio = getByTestId("validate-controls-validation-target") as HTMLInputElement;
    await act(async () => userEvent.click(getByLabelText(radio, "New Uploaded Data")));

    userEvent.click(getByTestId("validate-controls-validate-button"));

    await waitFor(() => {
      expect(called).toBe(true);
    });
  });

  it.each<ValidationTarget>(["New", "All"])(
    "should initiate against '%s Uploaded Data' when the option is selected",
    async (target) => {
      const submissionID = `${target}-uploads-validation-id`;
      let called = false;
      const mocks: MockedResponse<ValidateSubmissionResp>[] = [
        {
          request: {
            query: VALIDATE_SUBMISSION,
            variables: {
              _id: submissionID,
              types: ["metadata"], // NOTE: this is just the default type
              scope: target,
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
        <TestParent
          mocks={mocks}
          context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}
        >
          <ValidationControls
            dataSubmission={{
              ...baseSubmission,
              _id: submissionID,
              status: "In Progress",
              metadataValidationStatus: "New",
              fileValidationStatus: null,
            }}
            onValidate={jest.fn()}
          />
        </TestParent>
      );

      expect(called).toBe(false);

      const radio = getByTestId("validate-controls-validation-target") as HTMLInputElement;
      await act(async () => userEvent.click(getByLabelText(radio, `${target} Uploaded Data`)));

      userEvent.click(getByTestId("validate-controls-validate-button"));

      await waitFor(() => {
        expect(called).toBe(true);
      });
    }
  );

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
        <ValidationControls
          dataSubmission={{
            ...baseSubmission,
            _id: submissionID,
            status: "In Progress",
            metadataValidationStatus: "New",
            fileValidationStatus: "New",
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    await waitFor(() => userEvent.click(getByTestId("validate-controls-validate-button")));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("Unable to initiate validation process.", {
        variant: "error",
      });
      expect(getByTestId("validate-controls-validate-button")).toBeEnabled();
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
        <ValidationControls
          dataSubmission={{
            ...baseSubmission,
            _id: submissionID,
            status: "In Progress",
            metadataValidationStatus: "New",
            fileValidationStatus: "New",
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    await waitFor(() => userEvent.click(getByTestId("validate-controls-validate-button")));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("Unable to initiate validation process.", {
        variant: "error",
      });
      expect(getByTestId("validate-controls-validate-button")).toBeEnabled();
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
          <ValidationControls
            dataSubmission={{
              ...baseSubmission,
              _id: submissionID,
              status: "In Progress",
              metadataValidationStatus: "New",
              fileValidationStatus: "New",
            }}
            onValidate={onValidate}
          />
        </TestParent>
      );

      await waitFor(() => userEvent.click(getByTestId("validate-controls-validate-button")));

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

  it("should reset the validation type and upload type after starting validation", async () => {
    const submissionID = "reset-state-onclick-id";
    const mocks: MockedResponse<ValidateSubmissionResp>[] = [
      {
        request: {
          query: VALIDATE_SUBMISSION,
        },
        variableMatcher: () => true,
        result: {
          data: {
            validateSubmission: {
              success: true,
            },
          },
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks} context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}>
        <ValidationControls
          dataSubmission={{
            ...baseSubmission,
            _id: submissionID,
            status: "In Progress",
            metadataValidationStatus: "New",
            fileValidationStatus: "New",
          }}
          onValidate={jest.fn()}
        />
      </TestParent>
    );

    // Change from default type
    const typeRadio = getByTestId("validate-controls-validation-type") as HTMLInputElement;
    await act(async () => userEvent.click(getByLabelText(typeRadio, "Both")));

    // Change from default target
    const targetRadio = getByTestId("validate-controls-validation-target") as HTMLInputElement;
    await act(async () => userEvent.click(getByLabelText(targetRadio, `All Uploaded Data`)));

    userEvent.click(getByTestId("validate-controls-validate-button"));

    await waitFor(() => {
      expect(getByLabelText(typeRadio, "Validate Metadata")).toBeChecked();
      expect(getByLabelText(targetRadio, "New Uploaded Data")).toBeChecked();
    });
  });

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
