import { FC } from "react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { render, screen, waitFor } from "@testing-library/react";
import { GraphQLError } from "graphql";
import userEvent from "@testing-library/user-event";
import { Context, ContextState, Status as AuthStatus } from "../Contexts/AuthContext";
import { DELETE_ALL_ORPHANED_FILES } from "../../graphql";
import DeleteAllOrphanFilesButton from "./DeleteAllOrphanFilesButton";

const baseSubmission: Submission = {
  _id: "submission-id",
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
  fileErrors: [
    {
      batchID: "",
      submissionID: "",
      type: "",
      validationType: "metadata",
      displayID: 0,
      submittedID: "mock-file-name",
      severity: "Error",
      uploadedDate: "",
      validatedDate: "",
      errors: [],
      warnings: [],
    },
  ],
  history: [],
  conciergeName: "",
  conciergeEmail: "",
  createdAt: "",
  updatedAt: "",
  intention: "New/Update",
  dataType: "Metadata and Data Files",
  status: "In Progress",
  crossSubmissionStatus: "Passed",
  otherSubmissions: "",
  archived: false,
  validationStarted: "",
  validationEnded: "",
  validationScope: "New",
  validationType: ["metadata", "file"],
  studyID: "",
  deletingData: false,
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

const successMocks: MockedResponse[] = [
  {
    request: {
      query: DELETE_ALL_ORPHANED_FILES,
      variables: { _id: "submission-id" },
    },
    result: {
      data: {
        deleteAllOrphanedFiles: { success: true },
      },
    },
  },
];

const failureMocks: MockedResponse[] = [
  {
    request: {
      query: DELETE_ALL_ORPHANED_FILES,
      variables: { _id: "submission-id" },
    },
    error: new Error("Unable to delete orphan file."),
  },
];

const graphqlErrorMocks: MockedResponse[] = [
  {
    request: {
      query: DELETE_ALL_ORPHANED_FILES,
      variables: { _id: "submission-id" },
    },
    error: new GraphQLError("Mock GraphQL error"),
  },
];

const failureMocksSuccessFalse: MockedResponse[] = [
  {
    request: {
      query: DELETE_ALL_ORPHANED_FILES,
      variables: { _id: "submission-id" },
    },
    result: {
      data: {
        deleteAllOrphanedFiles: { success: false },
      },
    },
  },
];

describe("DeleteAllOrphanFilesButton Component", () => {
  const onDelete = jest.fn();

  beforeEach(() => {
    onDelete.mockReset();
  });

  it("should render default chip with label and icon", () => {
    const { getByTestId } = render(
      <TestParent context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}>
        <DeleteAllOrphanFilesButton submission={baseSubmission} onDelete={onDelete} />
      </TestParent>
    );

    expect(getByTestId("delete-all-orphan-files-icon")).toBeDefined();
    expect(getByTestId("delete-all-orphan-files-button")).not.toBeDisabled();
  });

  it("should open delete dialog when the button when is clicked", async () => {
    const { getByTestId } = render(
      <TestParent
        context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}
        mocks={successMocks}
      >
        <DeleteAllOrphanFilesButton submission={baseSubmission} onDelete={onDelete} />
      </TestParent>
    );

    userEvent.click(getByTestId("delete-all-orphan-files-button"));

    await waitFor(() => {
      expect(screen.getByText("Delete All Orphaned Files")).toBeInTheDocument();
    });
  });

  it("should close the delete dialog when the close button is clicked", async () => {
    const { getByTestId } = render(
      <TestParent
        context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}
        mocks={successMocks}
      >
        <DeleteAllOrphanFilesButton submission={baseSubmission} onDelete={onDelete} />
      </TestParent>
    );

    userEvent.click(getByTestId("delete-all-orphan-files-button"));

    await waitFor(() => {
      expect(screen.getByText("Delete All Orphaned Files")).toBeInTheDocument();
    });

    const closeButton = getByTestId("delete-dialog-cancel-button");
    userEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByText("Delete All Orphaned Files")).not.toBeInTheDocument();
    });
  });

  it("should disable the button when in loading state", async () => {
    const { getByTestId } = render(
      <TestParent
        context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}
        mocks={successMocks}
      >
        <DeleteAllOrphanFilesButton submission={baseSubmission} onDelete={onDelete} />
      </TestParent>
    );

    userEvent.click(getByTestId("delete-all-orphan-files-button"));

    await waitFor(() => {
      expect(screen.getByText("Delete All Orphaned Files")).toBeInTheDocument();
    });

    userEvent.click(getByTestId("delete-dialog-confirm-button"));

    expect(getByTestId("delete-all-orphan-files-button")).toBeDisabled();
  });

  it("should disable the button when disabled prop is passed", () => {
    const { getByTestId } = render(
      <TestParent
        context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}
        mocks={successMocks}
      >
        <DeleteAllOrphanFilesButton submission={baseSubmission} onDelete={onDelete} disabled />
      </TestParent>
    );

    expect(getByTestId("delete-all-orphan-files-button")).toBeDisabled();
  });

  it("should call onDelete with true and show message on success mutation", async () => {
    const { getByTestId } = render(
      <TestParent
        context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}
        mocks={successMocks}
      >
        <DeleteAllOrphanFilesButton submission={baseSubmission} onDelete={onDelete} />
      </TestParent>
    );

    userEvent.click(getByTestId("delete-all-orphan-files-button"));

    await waitFor(() => {
      expect(screen.getByText("Delete All Orphaned Files")).toBeInTheDocument();
    });

    userEvent.click(getByTestId("delete-dialog-confirm-button"));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(true);
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "All orphaned files have been successfully deleted.",
        {
          variant: "success",
        }
      );
    });
  });

  it("should call onDelete with false and show error message on failed mutation (network failure)", async () => {
    const { getByTestId } = render(
      <TestParent
        context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}
        mocks={failureMocks}
      >
        <DeleteAllOrphanFilesButton submission={baseSubmission} onDelete={onDelete} />
      </TestParent>
    );

    userEvent.click(getByTestId("delete-all-orphan-files-button"));

    await waitFor(() => {
      expect(screen.getByText("Delete All Orphaned Files")).toBeInTheDocument();
    });

    userEvent.click(getByTestId("delete-dialog-confirm-button"));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(false);
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "There was an issue deleting all orphaned files.",
        {
          variant: "error",
        }
      );
    });
  });

  it("should call onDelete with false and show error message on failed mutation (GraphQL error)", async () => {
    const { getByTestId } = render(
      <TestParent
        context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}
        mocks={graphqlErrorMocks}
      >
        <DeleteAllOrphanFilesButton submission={baseSubmission} onDelete={onDelete} />
      </TestParent>
    );

    userEvent.click(getByTestId("delete-all-orphan-files-button"));

    await waitFor(() => {
      expect(screen.getByText("Delete All Orphaned Files")).toBeInTheDocument();
    });

    userEvent.click(getByTestId("delete-dialog-confirm-button"));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(false);
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "There was an issue deleting all orphaned files.",
        {
          variant: "error",
        }
      );
    });
  });

  it("should call onDelete with false and show error message on failed mutation (API failure)", async () => {
    const { getByTestId } = render(
      <TestParent
        context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}
        mocks={failureMocksSuccessFalse}
      >
        <DeleteAllOrphanFilesButton submission={baseSubmission} onDelete={onDelete} />
      </TestParent>
    );

    userEvent.click(getByTestId("delete-all-orphan-files-button"));

    await waitFor(() => {
      expect(screen.getByText("Delete All Orphaned Files")).toBeInTheDocument();
    });

    userEvent.click(getByTestId("delete-dialog-confirm-button"));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(false);
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "There was an issue deleting all orphaned files.",
        {
          variant: "error",
        }
      );
    });
  });

  it("should disable when submission has no fileErrors", async () => {
    const { getByTestId } = render(
      <TestParent
        context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}
        mocks={failureMocks}
      >
        <DeleteAllOrphanFilesButton
          submission={{ ...baseSubmission, fileErrors: [] }}
          onDelete={onDelete}
        />
      </TestParent>
    );

    expect(getByTestId("delete-all-orphan-files-button")).toBeDisabled();
  });

  it.each<User["role"]>(["Federal Lead", "Data Commons POC", "fake role" as User["role"]])(
    "should disable for the role %s",
    (role) => {
      const { getByTestId } = render(
        <TestParent context={{ ...baseContext, user: { ...baseUser, role } }} mocks={failureMocks}>
          <DeleteAllOrphanFilesButton submission={baseSubmission} onDelete={onDelete} />
        </TestParent>
      );

      expect(getByTestId("delete-all-orphan-files-button")).toBeDisabled();
    }
  );

  it("should show tooltip when hovering over icon button", async () => {
    const { getByTestId } = render(
      <TestParent
        context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}
        mocks={successMocks}
      >
        <DeleteAllOrphanFilesButton submission={{ ...baseSubmission }} onDelete={onDelete} />
      </TestParent>
    );

    const iconButton = getByTestId("delete-all-orphan-files-button");
    userEvent.hover(iconButton);

    await waitFor(() => {
      expect(screen.getByText("Delete All Orphaned Files")).toBeVisible();
      expect(getByTestId("delete-all-orphaned-files-tooltip")).toBeInTheDocument();
    });
  });

  it("should show correct text in delete dialog", async () => {
    const { getByTestId } = render(
      <TestParent
        context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}
        mocks={successMocks}
      >
        <DeleteAllOrphanFilesButton submission={{ ...baseSubmission }} onDelete={onDelete} />
      </TestParent>
    );

    userEvent.click(getByTestId("delete-all-orphan-files-button"));

    const headerText = "Delete All Orphaned Files";
    const descriptionText =
      "All uploaded data files without associate metadata will be deleted. This operation is irreversible. Are you sure you want to proceed?";
    const confirmText = "Confirm to Delete";
    const closeText = "Cancel";

    await waitFor(() => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
      expect(screen.getByText(descriptionText)).toBeInTheDocument();
      expect(screen.getByText(confirmText)).toBeInTheDocument();
      expect(screen.getByText(closeText)).toBeInTheDocument();
    });
  });

  it("should hide tooltip when unhovering over icon button", async () => {
    const { getByTestId } = render(
      <TestParent
        context={{ ...baseContext, user: { ...baseUser, role: "Admin" } }}
        mocks={successMocks}
      >
        <DeleteAllOrphanFilesButton submission={{ ...baseSubmission }} onDelete={onDelete} />
      </TestParent>
    );

    const iconButton = getByTestId("delete-all-orphan-files-button");
    userEvent.hover(iconButton);

    await waitFor(() => {
      expect(screen.getByText("Delete All Orphaned Files")).toBeVisible();
      expect(getByTestId("delete-all-orphaned-files-tooltip")).toBeInTheDocument();
    });

    userEvent.unhover(iconButton);

    await waitFor(() => {
      expect(screen.getByText("Delete All Orphaned Files")).not.toBeVisible();
    });
  });
});
