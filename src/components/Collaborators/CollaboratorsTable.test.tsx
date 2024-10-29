import React, { useMemo } from "react";
import { render, fireEvent, within, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { axe } from "jest-axe";
import { CollaboratorsProvider, useCollaboratorsContext } from "../Contexts/CollaboratorsContext";
import {
  Context as AuthContext,
  ContextState as AuthContextState,
  Status as AuthStatus,
  useAuthContext,
} from "../Contexts/AuthContext";
import { useSubmissionContext } from "../Contexts/SubmissionContext";
import CollaboratorsTable from "./CollaboratorsTable";
import { TOOLTIP_TEXT } from "../../config/DashboardTooltips";

jest.mock("../Contexts/AuthContext", () => ({
  ...jest.requireActual("../Contexts/AuthContext"),
  useAuthContext: jest.fn(),
}));

jest.mock("../Contexts/SubmissionContext", () => ({
  ...jest.requireActual("../Contexts/SubmissionContext"),
  useSubmissionContext: jest.fn(),
}));

jest.mock("../Contexts/CollaboratorsContext", () => ({
  ...jest.requireActual("../Contexts/CollaboratorsContext"),
  useCollaboratorsContext: jest.fn(),
}));

const mockUseAuthContext = useAuthContext as jest.Mock;
const mockUseSubmissionContext = useSubmissionContext as jest.Mock;
const mockUseCollaboratorsContext = useCollaboratorsContext as jest.Mock;

const mockUser: User = {
  _id: "user-1",
  role: "Submitter",
  email: "user1@example.com",
  firstName: "John",
  lastName: "Doe",
  organization: {
    orgID: "org-1",
    orgName: "Organization 1",
    status: "Active",
    createdAt: "",
    updateAt: "",
  },
  dataCommons: [],
  studies: [],
  IDP: "nih",
  userStatus: "Active",
  updateAt: "",
  createdAt: "",
};

const mockSubmission: Submission = {
  _id: "submission-1",
  submitterID: "user-1",
  collaborators: [],
} as Submission;

const mockCollaborators: Collaborator[] = [
  {
    collaboratorID: "user-2",
    collaboratorName: "Jane Smith",
    permission: "Can View",
    Organization: {
      orgID: "org-2",
      orgName: "Organization 2",
    },
  },
];

const mockRemainingPotentialCollaborators: Collaborator[] = [
  {
    collaboratorID: "user-3",
    collaboratorName: "Bob Johnson",
    permission: "Can View",
    Organization: {
      orgID: "org-3",
      orgName: "Organization 3",
    },
  },
  {
    collaboratorID: "user-4",
    collaboratorName: "Alice Williams",
    permission: "Can View",
    Organization: {
      orgID: "org-4",
      orgName: "Organization 4",
    },
  },
];

const mockHandleAddCollaborator = jest.fn();
const mockHandleRemoveCollaborator = jest.fn();
const mockHandleUpdateCollaborator = jest.fn();

const baseAuthCtx: AuthContextState = {
  status: AuthStatus.LOADED,
  isLoggedIn: false,
  user: null,
};

type Props = {
  role?: UserRole;
  children: React.ReactNode;
};

const TestParent: React.FC<Props> = ({ role = "Submitter", children }) => {
  const authState = useMemo<AuthContextState>(
    () => ({
      ...baseAuthCtx,
      isLoggedIn: true,
      user: { ...mockUser, role },
    }),
    [role]
  );

  return (
    <MockedProvider mocks={[]}>
      <AuthContext.Provider value={authState}>
        <CollaboratorsProvider>{children}</CollaboratorsProvider>
      </AuthContext.Provider>
    </MockedProvider>
  );
};

describe("CollaboratorsTable Accessibility Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuthContext.mockReturnValue({
      user: mockUser,
      status: AuthStatus.LOADED,
    });

    mockUseSubmissionContext.mockReturnValue({
      data: { getSubmission: mockSubmission },
    });

    mockUseCollaboratorsContext.mockReturnValue({
      currentCollaborators: mockCollaborators,
      remainingPotentialCollaborators: mockRemainingPotentialCollaborators,
      maxCollaborators: 5,
      handleAddCollaborator: mockHandleAddCollaborator,
      handleRemoveCollaborator: mockHandleRemoveCollaborator,
      handleUpdateCollaborator: mockHandleUpdateCollaborator,
      loading: false,
    });
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <TestParent>
        <CollaboratorsTable isEdit />
      </TestParent>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("CollaboratorsTable Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuthContext.mockReturnValue({
      user: mockUser,
      status: AuthStatus.LOADED,
    });

    mockUseSubmissionContext.mockReturnValue({
      data: { getSubmission: mockSubmission },
    });

    mockUseCollaboratorsContext.mockReturnValue({
      currentCollaborators: mockCollaborators,
      remainingPotentialCollaborators: mockRemainingPotentialCollaborators,
      maxCollaborators: 5,
      handleAddCollaborator: mockHandleAddCollaborator,
      handleRemoveCollaborator: mockHandleRemoveCollaborator,
      handleUpdateCollaborator: mockHandleUpdateCollaborator,
      loading: false,
    });
  });

  it("renders table headers correctly", () => {
    const { getByTestId } = render(
      <TestParent>
        <CollaboratorsTable isEdit />
      </TestParent>
    );

    expect(getByTestId("header-collaborator")).toHaveTextContent("Collaborator");
    expect(getByTestId("header-organization")).toHaveTextContent("Collaborator Organization");
    expect(getByTestId("header-access")).toHaveTextContent("Access");
    expect(getByTestId("header-remove")).toHaveTextContent("Remove");
  });

  it("renders collaborators correctly", () => {
    const { getByTestId } = render(
      <TestParent>
        <CollaboratorsTable isEdit />
      </TestParent>
    );

    const collaboratorRow = getByTestId("collaborator-row-0");
    expect(collaboratorRow).toBeInTheDocument();

    const collaboratorSelect = getByTestId("collaborator-select-0-input");
    expect(collaboratorSelect).toBeInTheDocument();
    expect(collaboratorSelect).toHaveValue("user-2");

    const collaboratorOrg = getByTestId("collaborator-org-0");
    expect(collaboratorOrg).toHaveTextContent("Organizati...");

    const collaboratorPermissions = getByTestId("collaborator-permissions-0");
    expect(collaboratorPermissions).toBeInTheDocument();

    const removeButton = getByTestId("remove-collaborator-button-0");
    expect(removeButton).toBeInTheDocument();
  });

  it("calls handleRemoveCollaborator when remove button is clicked", () => {
    const { getByTestId } = render(
      <TestParent>
        <CollaboratorsTable isEdit />
      </TestParent>
    );

    const removeButton = getByTestId("remove-collaborator-button-0");
    fireEvent.click(removeButton);

    expect(mockHandleRemoveCollaborator).toHaveBeenCalledWith(0);
  });

  it("calls handleAddCollaborator when add collaborator button is clicked", () => {
    const { getByTestId } = render(
      <TestParent>
        <CollaboratorsTable isEdit />
      </TestParent>
    );

    const addButton = getByTestId("add-collaborator-button");
    fireEvent.click(addButton);

    expect(mockHandleAddCollaborator).toHaveBeenCalled();
  });

  it("renders add collaborator button disabled when max collaborators reached", () => {
    mockUseCollaboratorsContext.mockReturnValue({
      currentCollaborators: new Array(5).fill(mockCollaborators[0]),
      remainingPotentialCollaborators: [],
      maxCollaborators: 5,
      handleAddCollaborator: mockHandleAddCollaborator,
      handleRemoveCollaborator: mockHandleRemoveCollaborator,
      handleUpdateCollaborator: mockHandleUpdateCollaborator,
      loading: false,
    });

    const { getByTestId } = render(
      <TestParent>
        <CollaboratorsTable isEdit />
      </TestParent>
    );

    const addButton = getByTestId("add-collaborator-button");
    expect(addButton).toBeDisabled();
  });

  it("disables inputs when loading", () => {
    mockUseCollaboratorsContext.mockReturnValue({
      currentCollaborators: mockCollaborators,
      remainingPotentialCollaborators: mockRemainingPotentialCollaborators,
      maxCollaborators: 5,
      handleAddCollaborator: mockHandleAddCollaborator,
      handleRemoveCollaborator: mockHandleRemoveCollaborator,
      handleUpdateCollaborator: mockHandleUpdateCollaborator,
      loading: true,
    });

    const { getByTestId } = render(
      <TestParent>
        <CollaboratorsTable isEdit />
      </TestParent>
    );

    const collaboratorSelect = within(getByTestId("collaborator-select-0")).getByRole("button");
    expect(collaboratorSelect).toHaveClass("Mui-readOnly");

    const removeButton = getByTestId("remove-collaborator-button-0");
    expect(removeButton).toBeDisabled();

    const addButton = getByTestId("add-collaborator-button");
    expect(addButton).toBeDisabled();
  });

  it("does not render remove button when isEdit is false", () => {
    const { queryByTestId } = render(
      <TestParent>
        <CollaboratorsTable isEdit={false} />
      </TestParent>
    );

    expect(queryByTestId("header-remove")).toBeNull();
    expect(queryByTestId("remove-collaborator-button-0")).toBeNull();
  });

  it("calls handleUpdateCollaborator when collaborator select changes", () => {
    const { getByTestId } = render(
      <TestParent>
        <CollaboratorsTable isEdit />
      </TestParent>
    );

    const collaboratorSelect = getByTestId("collaborator-select-0-input");

    fireEvent.change(collaboratorSelect, { target: { value: "user-3" } });

    expect(mockHandleUpdateCollaborator).toHaveBeenCalledWith(0, {
      collaboratorID: "user-3",
      permission: "Can View",
    });
  });

  it("calls handleUpdateCollaborator when permission changes", () => {
    const { getByTestId } = render(
      <TestParent>
        <CollaboratorsTable isEdit />
      </TestParent>
    );

    const radioGroup = getByTestId("collaborator-permissions-0");

    fireEvent.click(within(radioGroup).getByDisplayValue("Can Edit"));

    expect(mockHandleUpdateCollaborator).toHaveBeenCalledWith(0, {
      collaboratorID: "user-2",
      permission: "Can Edit",
    });
  });

  it("renders permission tooltips correctly", async () => {
    const { getByText, getByTestId } = render(
      <TestParent>
        <CollaboratorsTable isEdit />
      </TestParent>
    );

    const radioGroup = getByTestId("collaborator-permissions-0");

    fireEvent.mouseOver(within(radioGroup).getByDisplayValue("Can View"));

    await waitFor(() => {
      expect(getByText(TOOLTIP_TEXT.COLLABORATORS_DIALOG.PERMISSIONS.CAN_VIEW)).toBeInTheDocument();
    });

    fireEvent.mouseOver(within(radioGroup).getByDisplayValue("Can Edit"));

    await waitFor(() => {
      expect(getByText(TOOLTIP_TEXT.COLLABORATORS_DIALOG.PERMISSIONS.CAN_EDIT)).toBeInTheDocument();
    });
  });

  it("renders disabled add collaborator button tooltip correctly", async () => {
    const { getByText, getByTestId } = render(
      <TestParent>
        <CollaboratorsTable isEdit={false} />
      </TestParent>
    );

    fireEvent.mouseOver(getByTestId("add-collaborator-button"));

    await waitFor(() => {
      expect(
        getByText(TOOLTIP_TEXT.COLLABORATORS_DIALOG.ACTIONS.ADD_COLLABORATOR_DISABLED)
      ).toBeInTheDocument();
    });
  });

  it("renders placeholder in collaborator select when no collaboratorID", () => {
    const mockCollaboratorsWithEmptyID = [
      {
        collaboratorID: "",
        collaboratorName: "",
        permission: "Can View",
        Organization: {
          orgID: "",
          orgName: "",
        },
      },
    ];

    mockUseCollaboratorsContext.mockReturnValue({
      currentCollaborators: mockCollaboratorsWithEmptyID,
      remainingPotentialCollaborators: mockRemainingPotentialCollaborators,
      maxCollaborators: 5,
      handleAddCollaborator: mockHandleAddCollaborator,
      handleRemoveCollaborator: mockHandleRemoveCollaborator,
      handleUpdateCollaborator: mockHandleUpdateCollaborator,
      loading: false,
    });

    const { getByTestId } = render(
      <TestParent>
        <CollaboratorsTable isEdit />
      </TestParent>
    );

    const collaboratorSelect = getByTestId("collaborator-select-0-input");
    expect(collaboratorSelect).toHaveValue("");
  });

  it("disables inputs when user isEdit is false", () => {
    const { getByTestId } = render(
      <TestParent>
        <CollaboratorsTable isEdit={false} />
      </TestParent>
    );

    const collaboratorSelect = within(getByTestId("collaborator-select-0")).getByRole("button");
    expect(collaboratorSelect).toHaveClass("Mui-readOnly");

    const addButton = getByTestId("add-collaborator-button");
    expect(addButton).toBeDisabled();
  });

  it("renders the correct number of collaborator rows", () => {
    const additionalCollaborators = [
      {
        collaboratorID: "user-5",
        collaboratorName: "Emily Davis",
        permission: "Can Edit",
        Organization: {
          orgID: "org-5",
          orgName: "Organization 5",
        },
      },
    ];

    mockUseCollaboratorsContext.mockReturnValue({
      currentCollaborators: [...mockCollaborators, ...additionalCollaborators],
      remainingPotentialCollaborators: mockRemainingPotentialCollaborators,
      maxCollaborators: 5,
      handleAddCollaborator: mockHandleAddCollaborator,
      handleRemoveCollaborator: mockHandleRemoveCollaborator,
      handleUpdateCollaborator: mockHandleUpdateCollaborator,
      loading: false,
    });

    const { getByTestId } = render(
      <TestParent>
        <CollaboratorsTable isEdit />
      </TestParent>
    );

    const collaboratorRow0 = getByTestId("collaborator-row-0");
    const collaboratorRow1 = getByTestId("collaborator-row-1");

    expect(collaboratorRow0).toBeInTheDocument();
    expect(collaboratorRow1).toBeInTheDocument();
  });

  it("returns empty string in renderValue when value is falsy", () => {
    const mockCollaboratorsWithEmptyID = [
      {
        collaboratorID: "",
        collaboratorName: "Jane Smith",
        permission: "Can View",
        Organization: {
          orgID: "org-2",
          orgName: "Organization 2",
        },
      },
    ];

    mockUseCollaboratorsContext.mockReturnValue({
      currentCollaborators: mockCollaboratorsWithEmptyID,
      remainingPotentialCollaborators: mockRemainingPotentialCollaborators,
      maxCollaborators: 5,
      handleAddCollaborator: mockHandleAddCollaborator,
      handleRemoveCollaborator: mockHandleRemoveCollaborator,
      handleUpdateCollaborator: mockHandleUpdateCollaborator,
      loading: false,
    });

    const { getByTestId } = render(
      <TestParent>
        <CollaboratorsTable isEdit />
      </TestParent>
    );

    const collaboratorSelect = getByTestId("collaborator-select-0-input");

    expect(collaboratorSelect).toHaveValue("");
  });

  it("displays a space when collaboratorName is null", () => {
    const mockCollaboratorsWithNullName = [
      {
        collaboratorID: "user-2",
        collaboratorName: null,
        permission: "Can View",
        Organization: {
          orgID: "org-2",
          orgName: "Organization 2",
        },
      },
    ];

    mockUseCollaboratorsContext.mockReturnValue({
      currentCollaborators: mockCollaboratorsWithNullName,
      remainingPotentialCollaborators: mockRemainingPotentialCollaborators,
      maxCollaborators: 5,
      handleAddCollaborator: mockHandleAddCollaborator,
      handleRemoveCollaborator: mockHandleRemoveCollaborator,
      handleUpdateCollaborator: mockHandleUpdateCollaborator,
      loading: false,
    });

    const { getByTestId } = render(
      <TestParent>
        <CollaboratorsTable isEdit />
      </TestParent>
    );

    const collaboratorSelect = getByTestId("collaborator-select-0");

    expect(within(collaboratorSelect).getByTestId("truncated-text-label").textContent).toEqual(" ");
  });

  it("displays a space when collaboratorID is null", () => {
    const mockCollaboratorsWithNullName = [
      {
        collaboratorID: null,
        collaboratorName: "user-name",
        permission: "Can View",
        Organization: {
          orgID: "org-2",
          orgName: "Organization 2",
        },
      },
    ];

    mockUseCollaboratorsContext.mockReturnValue({
      currentCollaborators: mockCollaboratorsWithNullName,
      remainingPotentialCollaborators: mockRemainingPotentialCollaborators,
      maxCollaborators: 5,
      handleAddCollaborator: mockHandleAddCollaborator,
      handleRemoveCollaborator: mockHandleRemoveCollaborator,
      handleUpdateCollaborator: mockHandleUpdateCollaborator,
      loading: false,
    });

    const { getByTestId } = render(
      <TestParent>
        <CollaboratorsTable isEdit />
      </TestParent>
    );

    const collaboratorSelect = getByTestId("collaborator-select-0-input");

    expect(collaboratorSelect).toHaveValue("");
  });

  it("handles undefined collaborator permission by defaulting to empty string", () => {
    const mockCollaboratorsWithUndefinedPermission = [
      {
        collaboratorID: "user-2",
        collaboratorName: "Jane Smith",
        permission: undefined,
        Organization: {
          orgID: "org-2",
          orgName: "Organization 2",
        },
      },
    ];

    mockUseCollaboratorsContext.mockReturnValue({
      currentCollaborators: mockCollaboratorsWithUndefinedPermission,
      remainingPotentialCollaborators: mockRemainingPotentialCollaborators,
      maxCollaborators: 5,
      handleAddCollaborator: mockHandleAddCollaborator,
      handleRemoveCollaborator: mockHandleRemoveCollaborator,
      handleUpdateCollaborator: mockHandleUpdateCollaborator,
      loading: false,
    });

    const { getByTestId } = render(
      <TestParent>
        <CollaboratorsTable isEdit />
      </TestParent>
    );

    const radioGroup = getByTestId("collaborator-permissions-0");

    const canViewRadio = within(radioGroup).getByDisplayValue("Can View") as HTMLInputElement;
    const canEditRadio = within(radioGroup).getByDisplayValue("Can Edit") as HTMLInputElement;

    expect(canViewRadio.checked).toBe(false);
    expect(canEditRadio.checked).toBe(false);
  });
});