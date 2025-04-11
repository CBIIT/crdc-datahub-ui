import React, { FC, useMemo } from "react";
import { render, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import {
  Context as AuthContext,
  ContextState as AuthContextState,
  Status as AuthContextStatus,
} from "../../components/Contexts/AuthContext";
import OrganizationController from "./Controller";

jest.mock("../../components/Contexts/OrganizationListContext", () => ({
  __esModule: true,
  OrganizationProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="organization-provider">{children}</div>
  ),
}));

jest.mock("./ListView", () => ({
  __esModule: true,
  default: () => <div data-testid="organization-list">MOCK-LIST-PAGE</div>,
}));

jest.mock("./OrganizationView", () => ({
  __esModule: true,
  default: ({ _id }) => <div data-testid="organization-view">MOCK-EDIT-PAGE {_id}</div>,
}));

const baseUser: Omit<User, "permissions"> = {
  _id: "",
  role: "fake role" as UserRole, // NOTE: This component does not depend on the role
  firstName: "",
  lastName: "",
  userStatus: "Active",
  IDP: "nih",
  email: "",
  dataCommons: [],
  dataCommonsDisplayNames: [],
  createdAt: "",
  updateAt: "",
  studies: null,
  notifications: [],
};

type ParentProps = {
  permissions?: AuthPermissions[];
  initialEntry?: string;
  ctxStatus?: AuthContextStatus;
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({
  permissions = ["program:manage"],
  initialEntry = "/programs",
  ctxStatus = AuthContextStatus.LOADED,
  children,
}: ParentProps) => {
  const baseAuthCtx: AuthContextState = useMemo<AuthContextState>(
    () => ({
      status: ctxStatus,
      isLoggedIn: true,
      user: { ...baseUser, permissions },
    }),
    [ctxStatus, permissions]
  );

  return (
    <AuthContext.Provider value={baseAuthCtx}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/programs/:orgId?" element={children} />
          <Route path="/" element={<div>Root Page</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe("Basic Functionality", () => {
  it("should render the page without crashing", async () => {
    expect(() =>
      render(<OrganizationController />, {
        wrapper: ({ children }) => <TestParent>{children}</TestParent>,
      })
    ).not.toThrow();
  });

  it("should show a loading spinner when the AuthCtx is loading", async () => {
    const { getByTestId } = render(<OrganizationController />, {
      wrapper: ({ children }) => (
        <TestParent ctxStatus={AuthContextStatus.LOADING}>{children}</TestParent>
      ),
    });

    expect(getByTestId("organization-suspense-loader")).toBeInTheDocument();
  });

  it("should redirect the user missing the required permissions to the home page", async () => {
    const { getByText } = render(<OrganizationController />, {
      wrapper: ({ children }) => <TestParent permissions={[]}>{children}</TestParent>,
    });

    expect(getByText("Root Page")).toBeInTheDocument();
  });

  it("should render the OrganizationView when a orgId param is provided", async () => {
    const { getByText } = render(<OrganizationController />, {
      wrapper: ({ children }) => (
        <TestParent initialEntry="/programs/program-123">{children}</TestParent>
      ),
    });

    await waitFor(() => {
      expect(getByText("MOCK-EDIT-PAGE program-123")).toBeInTheDocument();
    });
  });

  it("should render the ListView when no orgId param is provided", async () => {
    const { getByText } = render(<OrganizationController />, {
      wrapper: ({ children }) => <TestParent initialEntry="/programs">{children}</TestParent>,
    });

    await waitFor(() => {
      expect(getByText("MOCK-LIST-PAGE")).toBeInTheDocument();
    });
  });
});
