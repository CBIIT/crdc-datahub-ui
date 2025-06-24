import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import userEvent from "@testing-library/user-event";
import { FC, useMemo } from "react";
import { axe } from "vitest-axe";

import {
  LIST_APPROVED_STUDIES,
  LIST_INSTITUTIONS,
  ListApprovedStudiesInput,
  ListApprovedStudiesResp,
  ListInstitutionsInput,
  ListInstitutionsResp,
} from "../../graphql";
import { render, waitFor } from "../../test-utils";
import {
  Context as AuthContext,
  ContextState as AuthContextState,
  Status as AuthContextStatus,
} from "../Contexts/AuthContext";

import AccessRequest from "./index";

const mockUser: Omit<User, "role" | "permissions"> = {
  _id: "",
  firstName: "",
  lastName: "",
  email: "",
  dataCommons: [],
  dataCommonsDisplayNames: [],
  studies: [],
  institution: null,
  IDP: "nih",
  userStatus: "Active",
  updateAt: "",
  createdAt: "",
  notifications: [],
};

const mockListApprovedStudies: MockedResponse<ListApprovedStudiesResp, ListApprovedStudiesInput> = {
  request: {
    query: LIST_APPROVED_STUDIES,
  },
  result: {
    data: {
      listApprovedStudies: {
        total: 0,
        studies: [],
      },
    },
  },
  variableMatcher: () => true,
};

const emptyInstitutionsMock: MockedResponse<ListInstitutionsResp, ListInstitutionsInput> = {
  request: {
    query: LIST_INSTITUTIONS,
  },
  variableMatcher: () => true,
  result: {
    data: {
      listInstitutions: {
        total: 0,
        institutions: [],
      },
    },
  },
};

type MockParentProps = {
  mocks: MockedResponse[];
  role: UserRole;
  permissions: AuthPermissions[];
  children: React.ReactNode;
};

const MockParent: FC<MockParentProps> = ({ mocks, role, permissions, children }) => {
  const authValue: AuthContextState = useMemo<AuthContextState>(
    () => ({
      isLoggedIn: true,
      status: AuthContextStatus.LOADED,
      user: { ...mockUser, role, permissions },
    }),
    [role]
  );

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
    </MockedProvider>
  );
};

describe("Accessibility", () => {
  it("should not have any violations", async () => {
    const { container } = render(<AccessRequest />, {
      wrapper: (p) => <MockParent {...p} mocks={[]} role="User" permissions={["access:request"]} />,
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("should open the dialog when the 'Request Access' button is clicked", async () => {
    const { getByTestId, getByRole, queryByRole } = render(<AccessRequest />, {
      wrapper: (p) => (
        <MockParent
          {...p}
          mocks={[emptyInstitutionsMock, mockListApprovedStudies]}
          role="User"
          permissions={["access:request"]}
        />
      ),
    });

    expect(queryByRole("dialog")).not.toBeInTheDocument();

    userEvent.click(getByTestId("request-access-button"));

    await waitFor(() => expect(getByRole("dialog")).toBeVisible());
  });
});

describe("Implementation Requirements", () => {
  it("should have a button with the text content 'Request Access'", async () => {
    const { getByText } = render(<AccessRequest />, {
      wrapper: (p) => <MockParent {...p} mocks={[]} role="User" permissions={["access:request"]} />,
    });

    expect(getByText("Request Access")).toBeInTheDocument();
    expect(getByText("Request Access")).toBeEnabled();
  });

  it("should not render the 'Request Access' button without the required permission", async () => {
    const { queryByTestId } = render(<AccessRequest />, {
      wrapper: (p) => <MockParent {...p} mocks={[]} role="User" permissions={[]} />,
    });

    expect(queryByTestId("request-access-button")).not.toBeInTheDocument();
  });
});
