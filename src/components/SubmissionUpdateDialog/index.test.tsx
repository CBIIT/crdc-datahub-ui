import { MockedResponse, MockedProvider } from "@apollo/client/testing";
import userEvent from "@testing-library/user-event";
import { GraphQLError } from "graphql";
import { FC, ReactNode, useMemo } from "react";
import { axe } from "vitest-axe";

import { authCtxStateFactory } from "@/factories/auth/AuthCtxStateFactory";
import { userFactory } from "@/factories/auth/UserFactory";
import { submissionAttributesFactory } from "@/factories/submission/SubmissionAttributesFactory";
import { submissionFactory } from "@/factories/submission/SubmissionFactory";

import {
  GetSubmissionResp,
  UPDATE_SUBMISSION_INFO,
  UpdateSubmissionInfoInput,
  UpdateSubmissionInfoResp,
} from "../../graphql";
import { render, waitFor } from "../../test-utils";
import { Context as AuthContext, ContextState as AuthCtxState } from "../Contexts/AuthContext";
import {
  SubmissionContext,
  SubmissionCtxState,
  SubmissionCtxStatus,
} from "../Contexts/SubmissionContext";

import SubmissionUpdate from "./index";

const mockListAvailableModelVersions = vi.fn();
vi.mock("../../utils", async () => ({
  ...(await vi.importActual("../../utils")),
  listAvailableModelVersions: async (...args) => mockListAvailableModelVersions(...args),
}));

const mockDC = "MOCK-DC";

const MockParent: FC<{
  mocks?: MockedResponse[];
  user?: Partial<User>;
  submission?: Partial<Submission>;
  updateQuery?: SubmissionCtxState["updateQuery"];
  children: ReactNode;
}> = ({ mocks, submission, user, updateQuery = vi.fn(), children }) => {
  const authCtxState = useMemo<AuthCtxState>(
    () =>
      authCtxStateFactory.build({
        user: userFactory.build({ _id: "current-user", ...user }),
      }),
    [user]
  );

  const submissionContextState = useMemo<SubmissionCtxState>(
    () => ({
      data: {
        getSubmission: submissionFactory.build({
          submitterID: "current-user",
          dataCommons: mockDC,
          ...submission,
        }),
        submissionStats: null,
        getSubmissionAttributes: null,
      },
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
    vi.resetAllMocks();
  });

  it("should have no violations for the button", async () => {
    const { container, getByTestId } = render(<SubmissionUpdate />, {
      wrapper: ({ children }) => (
        <MockParent
          submission={{ status: "New" }}
          user={{
            role: "Data Commons Personnel",
            permissions: ["data_submission:review"],
            dataCommons: [mockDC],
            dataCommonsDisplayNames: [mockDC],
          }}
        >
          {children}
        </MockParent>
      ),
    });

    expect(getByTestId("update-submission-button")).toBeEnabled();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("should have no violations for the button (disabled)", async () => {
    const { container, getByTestId } = render(<SubmissionUpdate disabled />, {
      wrapper: ({ children }) => (
        <MockParent
          submission={{ status: "New" }}
          user={{
            role: "Data Commons Personnel",
            permissions: ["data_submission:review"],
            dataCommons: [mockDC],
            dataCommonsDisplayNames: [mockDC],
          }}
        >
          {children}
        </MockParent>
      ),
    });

    expect(getByTestId("update-submission-button")).toBeDisabled();
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should render without crashing", () => {
    expect(() =>
      render(<SubmissionUpdate />, {
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

    const mock: MockedResponse<UpdateSubmissionInfoResp, UpdateSubmissionInfoInput> = {
      request: {
        query: UPDATE_SUBMISSION_INFO,
      },
      variableMatcher: () => true,
      result: {
        errors: [new GraphQLError("Simulated GraphQL error")],
      },
    };

    const { getByTestId } = render(<SubmissionUpdate />, {
      wrapper: ({ children }) => (
        <MockParent
          mocks={[mock]}
          submission={{ status: "New", modelVersion: "1.0.0" }}
          user={{
            role: "Data Commons Personnel",
            permissions: ["data_submission:review"],
            dataCommons: [mockDC],
            dataCommonsDisplayNames: [mockDC],
          }}
        >
          {children}
        </MockParent>
      ),
    });

    userEvent.click(getByTestId("update-submission-button"));

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

    const mock: MockedResponse<UpdateSubmissionInfoResp, UpdateSubmissionInfoInput> = {
      request: {
        query: UPDATE_SUBMISSION_INFO,
      },
      variableMatcher: () => true,
      error: new Error("Simulated network error"),
    };

    const { getByTestId } = render(<SubmissionUpdate />, {
      wrapper: ({ children }) => (
        <MockParent
          mocks={[mock]}
          submission={{ status: "New", modelVersion: "1.0.0" }}
          user={{
            role: "Data Commons Personnel",
            permissions: ["data_submission:review"],
            dataCommons: [mockDC],
            dataCommonsDisplayNames: [mockDC],
          }}
        >
          {children}
        </MockParent>
      ),
    });

    userEvent.click(getByTestId("update-submission-button"));

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

    const mock: MockedResponse<UpdateSubmissionInfoResp, UpdateSubmissionInfoInput> = {
      request: {
        query: UPDATE_SUBMISSION_INFO,
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

    const { getByTestId } = render(<SubmissionUpdate />, {
      wrapper: ({ children }) => (
        <MockParent
          mocks={[mock]}
          submission={{ status: "New", modelVersion: "1.0.0" }}
          user={{
            role: "Data Commons Personnel",
            permissions: ["data_submission:review"],
            dataCommons: [mockDC],
            dataCommonsDisplayNames: [mockDC],
          }}
        >
          {children}
        </MockParent>
      ),
    });

    userEvent.click(getByTestId("update-submission-button"));

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
    vi.resetAllMocks();
  });

  it("should have a tooltip present on the button", async () => {
    const { getByTestId, findByRole } = render(<SubmissionUpdate />, {
      wrapper: ({ children }) => (
        <MockParent
          submission={{ status: "New" }}
          user={{
            role: "Data Commons Personnel",
            permissions: ["data_submission:review"],
            dataCommons: [mockDC],
            dataCommonsDisplayNames: [mockDC],
          }}
        >
          {children}
        </MockParent>
      ),
    });

    userEvent.hover(getByTestId("update-submission-button"));

    const tooltip = await findByRole("tooltip");

    expect(tooltip).toBeVisible();
    expect(tooltip).toHaveTextContent("Change Data Model Version");

    userEvent.unhover(getByTestId("update-submission-button"));

    await waitFor(() => {
      expect(tooltip).not.toBeVisible();
    });
  });

  it("should not be rendered when the user is missing the required permission", () => {
    const { rerender, getByTestId } = render(
      <MockParent
        submission={{ status: "New" }}
        user={{
          role: "Data Commons Personnel",
          permissions: [],
          dataCommons: [mockDC],
          dataCommonsDisplayNames: [mockDC],
        }}
      >
        <SubmissionUpdate />
      </MockParent>
    );

    expect(() => getByTestId("update-submission-button")).toThrow();

    rerender(
      <MockParent
        submission={{ status: "New" }}
        user={{
          role: "Data Commons Personnel",
          permissions: ["data_submission:review"],
          dataCommons: [mockDC],
          dataCommonsDisplayNames: [mockDC],
        }}
      >
        <SubmissionUpdate />
      </MockParent>
    );

    expect(getByTestId("update-submission-button")).toBeVisible();
  });

  it.each<UserRole>(["Admin", "Federal Lead", "Submitter", "User", "fake role" as UserRole])(
    "should not be rendered when the user is not a valid role (%s)",
    async (userRole) => {
      const { rerender, getByTestId } = render(
        <MockParent
          submission={{ status: "New" }}
          user={{
            role: userRole,
            permissions: ["data_submission:review"],
            // NOTE: Technically other roles don't have DC assigned, but this is required to test this scenario
            dataCommons: [mockDC],
            dataCommonsDisplayNames: [mockDC],
          }}
        >
          <SubmissionUpdate />
        </MockParent>
      );

      expect(() => getByTestId("update-submission-button")).toThrow(); // Button should not be rendered

      rerender(
        <MockParent
          submission={{ status: "New" }}
          user={{
            role: "Data Commons Personnel",
            permissions: ["data_submission:review"],
            dataCommons: [mockDC],
            dataCommonsDisplayNames: [mockDC],
          }}
        >
          <SubmissionUpdate />
        </MockParent>
      );

      expect(getByTestId("update-submission-button")).toBeVisible(); // Button should be rendered
    }
  );

  it("should not be rendered when the user is not assigned to the same data commons", () => {
    const { rerender, getByTestId } = render(
      <MockParent
        submission={{ dataCommons: "a different dc", status: "New" }}
        user={{
          role: "Data Commons Personnel",
          permissions: ["data_submission:review"],
          dataCommons: ["A fake data commons that is not definitely not MOCK-DC"],
          dataCommonsDisplayNames: [mockDC],
        }}
      >
        <SubmissionUpdate />
      </MockParent>
    );

    expect(() => getByTestId("update-submission-button")).toThrow();

    rerender(
      <MockParent
        submission={{ dataCommons: "a different dc", status: "New" }}
        user={{
          role: "Data Commons Personnel",
          permissions: ["data_submission:review"],
          dataCommons: ["a different dc"], // Change to the same data commons
          dataCommonsDisplayNames: ["a different dc"],
        }}
      >
        <SubmissionUpdate />
      </MockParent>
    );

    expect(getByTestId("update-submission-button")).toBeVisible();
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
      const { getByTestId } = render(<SubmissionUpdate />, {
        wrapper: ({ children }) => (
          <MockParent
            submission={{ status: submissionStatus }}
            user={{
              role: "Data Commons Personnel",
              permissions: ["data_submission:review"],
              dataCommons: [mockDC],
              dataCommonsDisplayNames: [mockDC],
            }}
          >
            {children}
          </MockParent>
        ),
      });

      expect(() => getByTestId("update-submission-button")).toThrow();
    }
  );

  it("should update the local cache state when the model version is changed", async () => {
    mockListAvailableModelVersions.mockImplementationOnce(() => ["1.0.0", "2.0.0"]);

    const mockUpdateQuery = vi.fn();

    const mock: MockedResponse<UpdateSubmissionInfoResp, UpdateSubmissionInfoInput> = {
      request: {
        query: UPDATE_SUBMISSION_INFO,
      },
      variableMatcher: () => true,
      result: {
        data: {
          updateSubmissionModelVersion: {
            _id: "",
            modelVersion: "API RESPONSE VERSION",
          },
        },
      },
    };

    const { getByTestId } = render(<SubmissionUpdate />, {
      wrapper: ({ children }) => (
        <MockParent
          mocks={[mock]}
          updateQuery={mockUpdateQuery}
          submission={{ status: "New", modelVersion: "1.0.0" }}
          user={{
            role: "Data Commons Personnel",
            permissions: ["data_submission:review"],
            dataCommons: [mockDC],
            dataCommonsDisplayNames: [mockDC],
          }}
        >
          {children}
        </MockParent>
      ),
    });

    userEvent.click(getByTestId("update-submission-button"));

    await waitFor(() => {
      expect(getByTestId("model-version-dialog")).toBeVisible();
    });

    userEvent.click(getByTestId("model-version-dialog-submit-button"));

    await waitFor(() => {
      expect(mockUpdateQuery).toHaveBeenCalledTimes(1);
    });
  });

  it("should reset validation results after the model version is changed", async () => {
    mockListAvailableModelVersions.mockImplementationOnce(() => ["1.0.0", "2.0.0"]);

    const prevState: GetSubmissionResp = {
      getSubmission: submissionFactory.build({
        submitterID: "current-user",
        dataCommons: mockDC,
        status: "New",
        modelVersion: "1.0.0",
        metadataValidationStatus: "Passed",
        fileValidationStatus: "Passed",
      }),
      submissionStats: null,
      getSubmissionAttributes: {
        submissionAttributes: submissionAttributesFactory
          .pick(["hasOrphanError", "isBatchUploading"])
          .build({
            hasOrphanError: false,
            isBatchUploading: false,
          }),
      },
    };

    let updateQueryResult: GetSubmissionResp | undefined;
    const mockUpdateQuery = vi.fn((updater: (prev: GetSubmissionResp) => GetSubmissionResp) => {
      updateQueryResult = updater(prevState);
    });

    const mock: MockedResponse<UpdateSubmissionInfoResp, UpdateSubmissionInfoInput> = {
      request: {
        query: UPDATE_SUBMISSION_INFO,
      },
      variableMatcher: () => true,
      result: {
        data: {
          updateSubmissionModelVersion: {
            _id: "",
            modelVersion: "API RESPONSE VERSION",
          },
        },
      },
    };

    const { getByTestId } = render(<SubmissionUpdate />, {
      wrapper: ({ children }) => (
        <MockParent
          mocks={[mock]}
          updateQuery={mockUpdateQuery}
          submission={{ ...prevState.getSubmission }}
          user={{
            role: "Data Commons Personnel",
            permissions: ["data_submission:review"],
            dataCommons: [mockDC],
            dataCommonsDisplayNames: [mockDC],
          }}
        >
          {children}
        </MockParent>
      ),
    });

    expect(updateQueryResult).toBeUndefined();

    userEvent.click(getByTestId("update-submission-button"));

    await waitFor(() => {
      expect(getByTestId("model-version-dialog")).toBeVisible();
    });

    userEvent.click(getByTestId("model-version-dialog-submit-button"));

    await waitFor(() => {
      expect(mockUpdateQuery).toHaveBeenCalledTimes(1);
    });

    expect(updateQueryResult).toBeDefined();
    expect(updateQueryResult.getSubmission.metadataValidationStatus).toBe("New");
    expect(updateQueryResult.getSubmission.fileValidationStatus).toBe("New");
  });
});
