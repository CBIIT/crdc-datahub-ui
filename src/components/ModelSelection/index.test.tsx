import { FC, ReactNode, useMemo } from "react";
import { MockedResponse, MockedProvider } from "@apollo/client/testing";
import { render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import userEvent from "@testing-library/user-event";
import { GraphQLError } from "graphql";
import {
  Context as AuthContext,
  ContextState as AuthCtxState,
  Status as AuthStatus,
} from "../Contexts/AuthContext";
import {
  SubmissionContext,
  SubmissionCtxState,
  SubmissionCtxStatus,
} from "../Contexts/SubmissionContext";
import {
  GetSubmissionResp,
  UPDATE_MODEL_VERSION,
  UpdateModelVersionInput,
  UpdateModelVersionResp,
} from "../../graphql";
import ModelSelection from "./index";

const mockListAvailableModelVersions = jest.fn();
jest.mock("../../utils", () => ({
  ...jest.requireActual("../../utils"),
  listAvailableModelVersions: async (...args) => mockListAvailableModelVersions(...args),
}));

const baseSubmission: Omit<Submission, "status"> = {
  _id: "",
  name: "",
  submitterID: "current-user",
  submitterName: "",
  organization: null,
  dataCommons: "MOCK-DC",
  dataCommonsDisplayName: "Mock Data Common",
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
  intention: "New/Update",
  dataType: "Metadata and Data Files",
  archived: false,
  validationStarted: "",
  validationEnded: "",
  validationScope: "New",
  validationType: ["metadata", "file"],
  studyID: "",
  deletingData: false,
  nodeCount: 0,
  collaborators: [],
  metadataValidationStatus: "New",
  fileValidationStatus: "New",
  dataFileSize: null,
};

const baseUser: Omit<User, "role" | "permissions" | "dataCommons" | "dataCommonsDisplayNames"> = {
  _id: "current-user",
  firstName: "",
  lastName: "",
  userStatus: "Active",
  IDP: "nih",
  email: "",
  studies: null,
  institution: null,
  createdAt: "",
  updateAt: "",
  notifications: [],
};

const MockParent: FC<{
  mocks?: MockedResponse[];
  user?: User;
  submission?: Submission;
  updateQuery?: SubmissionCtxState["updateQuery"];
  children: ReactNode;
}> = ({ mocks, submission, user, updateQuery = jest.fn(), children }) => {
  const authCtxState = useMemo<AuthCtxState>(
    () => ({
      status: AuthStatus.LOADED,
      isLoggedIn: false,
      user,
    }),
    [user]
  );

  const submissionContextState = useMemo<SubmissionCtxState>(
    () => ({
      data: {
        getSubmission: submission,
      } as GetSubmissionResp,
      updateQuery,
      status: SubmissionCtxStatus.LOADED,
      error: null,
    }),
    [submission, updateQuery]
  );

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <AuthContext.Provider value={authCtxState}>
        <SubmissionContext.Provider value={submissionContextState}>
          {children}
        </SubmissionContext.Provider>
      </AuthContext.Provider>
    </MockedProvider>
  );
};

describe("Accessibility", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should have no violations for the button", async () => {
    const { container, getByTestId } = render(<ModelSelection />, {
      wrapper: ({ children }) => (
        <MockParent
          submission={{ ...baseSubmission, status: "New" }}
          user={{
            ...baseUser,
            role: "Data Commons Personnel",
            permissions: ["data_submission:review"],
            dataCommons: [baseSubmission.dataCommons],
            dataCommonsDisplayNames: [baseSubmission.dataCommons],
          }}
        >
          {children}
        </MockParent>
      ),
    });

    expect(getByTestId("change-model-version-button")).toBeEnabled();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("should have no violations for the button (disabled)", async () => {
    const { container, getByTestId } = render(<ModelSelection disabled />, {
      wrapper: ({ children }) => (
        <MockParent
          submission={{ ...baseSubmission, status: "New" }}
          user={{
            ...baseUser,
            role: "Data Commons Personnel",
            permissions: ["data_submission:review"],
            dataCommons: [baseSubmission.dataCommons],
            dataCommonsDisplayNames: [baseSubmission.dataCommons],
          }}
        >
          {children}
        </MockParent>
      ),
    });

    expect(getByTestId("change-model-version-button")).toBeDisabled();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should render without crashing", () => {
    expect(() =>
      render(<ModelSelection />, {
        wrapper: ({ children }) => (
          <MockParent submission={null} user={null}>
            {children}
          </MockParent>
        ),
      })
    ).not.toThrow();
  });

  it("should show a snackbar when the change operation fails (GraphQL Error)", async () => {
    mockListAvailableModelVersions.mockImplementationOnce(() => ["1.0.0", "2.0.0"]);

    const mock: MockedResponse<UpdateModelVersionResp, UpdateModelVersionInput> = {
      request: {
        query: UPDATE_MODEL_VERSION,
      },
      variableMatcher: () => true,
      result: {
        errors: [new GraphQLError("Simulated GraphQL error")],
      },
    };

    const { getByTestId } = render(<ModelSelection />, {
      wrapper: ({ children }) => (
        <MockParent
          mocks={[mock]}
          submission={{ ...baseSubmission, status: "New", modelVersion: "1.0.0" }}
          user={{
            ...baseUser,
            role: "Data Commons Personnel",
            permissions: ["data_submission:review"],
            dataCommons: [baseSubmission.dataCommons],
            dataCommonsDisplayNames: [baseSubmission.dataCommons],
          }}
        >
          {children}
        </MockParent>
      ),
    });

    userEvent.click(getByTestId("change-model-version-button"));

    await waitFor(() => {
      expect(getByTestId("model-version-dialog")).toBeVisible();
    });

    userEvent.click(getByTestId("model-version-dialog-submit-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Oops! An error occurred while changing the model version",
        {
          variant: "error",
        }
      );
    });
  });

  it("should show a snackbar when the change operation fails (Network Error)", async () => {
    mockListAvailableModelVersions.mockImplementationOnce(() => ["1.0.0", "2.0.0"]);

    const mock: MockedResponse<UpdateModelVersionResp, UpdateModelVersionInput> = {
      request: {
        query: UPDATE_MODEL_VERSION,
      },
      variableMatcher: () => true,
      error: new Error("Simulated network error"),
    };

    const { getByTestId } = render(<ModelSelection />, {
      wrapper: ({ children }) => (
        <MockParent
          mocks={[mock]}
          submission={{ ...baseSubmission, status: "New", modelVersion: "1.0.0" }}
          user={{
            ...baseUser,
            role: "Data Commons Personnel",
            permissions: ["data_submission:review"],
            dataCommons: [baseSubmission.dataCommons],
            dataCommonsDisplayNames: [baseSubmission.dataCommons],
          }}
        >
          {children}
        </MockParent>
      ),
    });

    userEvent.click(getByTestId("change-model-version-button"));

    await waitFor(() => {
      expect(getByTestId("model-version-dialog")).toBeVisible();
    });

    userEvent.click(getByTestId("model-version-dialog-submit-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Oops! An error occurred while changing the model version",
        {
          variant: "error",
        }
      );
    });
  });

  it("should show a snackbar when the change operation fails (API Error)", async () => {
    mockListAvailableModelVersions.mockImplementationOnce(() => ["1.0.0", "2.0.0"]);

    const mock: MockedResponse<UpdateModelVersionResp, UpdateModelVersionInput> = {
      request: {
        query: UPDATE_MODEL_VERSION,
      },
      variableMatcher: () => true,
      result: {
        data: {
          updateSubmissionModelVersion: {
            _id: null,
            modelVersion: null,
          },
        },
      },
    };

    const { getByTestId } = render(<ModelSelection />, {
      wrapper: ({ children }) => (
        <MockParent
          mocks={[mock]}
          submission={{ ...baseSubmission, status: "New", modelVersion: "1.0.0" }}
          user={{
            ...baseUser,
            role: "Data Commons Personnel",
            permissions: ["data_submission:review"],
            dataCommons: [baseSubmission.dataCommons],
            dataCommonsDisplayNames: [baseSubmission.dataCommons],
          }}
        >
          {children}
        </MockParent>
      ),
    });

    userEvent.click(getByTestId("change-model-version-button"));

    await waitFor(() => {
      expect(getByTestId("model-version-dialog")).toBeVisible();
    });

    userEvent.click(getByTestId("model-version-dialog-submit-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Oops! An error occurred while changing the model version",
        {
          variant: "error",
        }
      );
    });
  });
});

describe("Implementation Requirements", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should have a tooltip present on the button", async () => {
    const { getByTestId, findByRole } = render(<ModelSelection />, {
      wrapper: ({ children }) => (
        <MockParent
          submission={{ ...baseSubmission, status: "New" }}
          user={{
            ...baseUser,
            role: "Data Commons Personnel",
            permissions: ["data_submission:review"],
            dataCommons: [baseSubmission.dataCommons],
            dataCommonsDisplayNames: [baseSubmission.dataCommons],
          }}
        >
          {children}
        </MockParent>
      ),
    });

    userEvent.hover(getByTestId("change-model-version-button"));

    const tooltip = await findByRole("tooltip");

    expect(tooltip).toBeVisible();
    expect(tooltip).toHaveTextContent("Change Data Model Version");

    userEvent.unhover(getByTestId("change-model-version-button"));

    await waitFor(() => {
      expect(tooltip).not.toBeVisible();
    });
  });

  it("should not be rendered when the user is missing the required permission", () => {
    const { rerender, getByTestId } = render(
      <MockParent
        submission={{ ...baseSubmission, status: "New" }}
        user={{
          ...baseUser,
          role: "Data Commons Personnel",
          permissions: [],
          dataCommons: [baseSubmission.dataCommons],
          dataCommonsDisplayNames: [baseSubmission.dataCommons],
        }}
      >
        <ModelSelection />
      </MockParent>
    );

    expect(() => getByTestId("change-model-version-button")).toThrow();

    rerender(
      <MockParent
        submission={{ ...baseSubmission, status: "New" }}
        user={{
          ...baseUser,
          role: "Data Commons Personnel",
          permissions: ["data_submission:review"],
          dataCommons: [baseSubmission.dataCommons],
          dataCommonsDisplayNames: [baseSubmission.dataCommons],
        }}
      >
        <ModelSelection />
      </MockParent>
    );

    expect(getByTestId("change-model-version-button")).toBeVisible();
  });

  it.each<UserRole>(["Admin", "Federal Lead", "Submitter", "User", "fake role" as UserRole])(
    "should not be rendered when the user is not a valid role (%s)",
    async (userRole) => {
      const { rerender, getByTestId } = render(
        <MockParent
          submission={{ ...baseSubmission, status: "New" }}
          user={{
            ...baseUser,
            role: userRole,
            permissions: ["data_submission:review"],
            // NOTE: Technically other roles don't have DC assigned, but this is required to test this scenario
            dataCommons: [baseSubmission.dataCommons],
            dataCommonsDisplayNames: [baseSubmission.dataCommons],
          }}
        >
          <ModelSelection />
        </MockParent>
      );

      expect(() => getByTestId("change-model-version-button")).toThrow(); // Button should not be rendered

      rerender(
        <MockParent
          submission={{ ...baseSubmission, status: "New" }}
          user={{
            ...baseUser,
            role: "Data Commons Personnel",
            permissions: ["data_submission:review"],
            dataCommons: [baseSubmission.dataCommons],
            dataCommonsDisplayNames: [baseSubmission.dataCommons],
          }}
        >
          <ModelSelection />
        </MockParent>
      );

      expect(getByTestId("change-model-version-button")).toBeVisible(); // Button should be rendered
    }
  );

  it("should not be rendered when the user is not assigned to the same data commons", () => {
    const { rerender, getByTestId } = render(
      <MockParent
        submission={{ ...baseSubmission, dataCommons: "a different dc", status: "New" }}
        user={{
          ...baseUser,
          role: "Data Commons Personnel",
          permissions: ["data_submission:review"],
          dataCommons: ["A fake data commons that is not definitely not MOCK-DC"],
          dataCommonsDisplayNames: [baseSubmission.dataCommons],
        }}
      >
        <ModelSelection />
      </MockParent>
    );

    expect(() => getByTestId("change-model-version-button")).toThrow();

    rerender(
      <MockParent
        submission={{ ...baseSubmission, dataCommons: "a different dc", status: "New" }}
        user={{
          ...baseUser,
          role: "Data Commons Personnel",
          permissions: ["data_submission:review"],
          dataCommons: ["a different dc"], // Change to the same data commons
          dataCommonsDisplayNames: ["a different dc"],
        }}
      >
        <ModelSelection />
      </MockParent>
    );

    expect(getByTestId("change-model-version-button")).toBeVisible();
  });

  it.each<SubmissionStatus>([
    "Submitted",
    "Released",
    "Completed",
    "Deleted",
    "Withdrawn",
    "mock" as SubmissionStatus,
  ])(
    "should not be rendered when the submission is not in a valid status (%s)",
    (submissionStatus) => {
      const { getByTestId } = render(<ModelSelection />, {
        wrapper: ({ children }) => (
          <MockParent
            submission={{ ...baseSubmission, status: submissionStatus }}
            user={{
              ...baseUser,
              role: "Data Commons Personnel",
              permissions: ["data_submission:review"],
              dataCommons: [baseSubmission.dataCommons],
              dataCommonsDisplayNames: [baseSubmission.dataCommons],
            }}
          >
            {children}
          </MockParent>
        ),
      });

      expect(() => getByTestId("change-model-version-button")).toThrow();
    }
  );

  it("should update the local cache state when the model version is changed", async () => {
    mockListAvailableModelVersions.mockImplementationOnce(() => ["1.0.0", "2.0.0"]);

    const mockUpdateQuery = jest.fn();

    const mock: MockedResponse<UpdateModelVersionResp, UpdateModelVersionInput> = {
      request: {
        query: UPDATE_MODEL_VERSION,
      },
      variableMatcher: () => true,
      result: {
        data: {
          updateSubmissionModelVersion: {
            _id: baseSubmission._id,
            modelVersion: "API RESPONSE VERSION",
          },
        },
      },
    };

    const { getByTestId } = render(<ModelSelection />, {
      wrapper: ({ children }) => (
        <MockParent
          mocks={[mock]}
          updateQuery={mockUpdateQuery}
          submission={{ ...baseSubmission, status: "New", modelVersion: "1.0.0" }}
          user={{
            ...baseUser,
            role: "Data Commons Personnel",
            permissions: ["data_submission:review"],
            dataCommons: [baseSubmission.dataCommons],
            dataCommonsDisplayNames: [baseSubmission.dataCommons],
          }}
        >
          {children}
        </MockParent>
      ),
    });

    userEvent.click(getByTestId("change-model-version-button"));

    await waitFor(() => {
      expect(getByTestId("model-version-dialog")).toBeVisible();
    });

    userEvent.click(getByTestId("model-version-dialog-submit-button"));

    await waitFor(() => {
      expect(mockUpdateQuery).toHaveBeenCalledTimes(1);
    });
  });
});
