import { cleanup, render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { FC, useMemo } from "react";
import userEvent from "@testing-library/user-event";
import {
  Context as AuthContext,
  ContextState as AuthContextState,
  Status as AuthContextStatus,
} from "../Contexts/AuthContext";
import { LIST_ORG_NAMES, ListOrgNamesResp } from "../../graphql";
import FormDialog from "./FormDialog";

const mockUser: Omit<User, "role"> = {
  _id: "",
  firstName: "",
  lastName: "",
  email: "",
  organization: null,
  dataCommons: [],
  studies: [],
  IDP: "nih",
  userStatus: "Active",
  updateAt: "",
  createdAt: "",
};

type MockParentProps = {
  mocks: MockedResponse[];
  role: UserRole;
  children: React.ReactNode;
};

const MockParent: FC<MockParentProps> = ({ mocks, role, children }) => {
  const authValue: AuthContextState = useMemo<AuthContextState>(
    () => ({
      isLoggedIn: true,
      status: AuthContextStatus.LOADED,
      user: { ...mockUser, role },
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
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should have no violations", async () => {
    // const mocks: MockedResponse<ListOrgNamesResp> = {
    //   request: {
    //     query: LIST_ORG_NAMES,
    //   },
    //   result: {
    //     data: {
    //       listOrganizations: [],
    //     },
    //   },
    //   variableMatcher: () => true,
    // };
    // const mockOnClose = jest.fn();
    // const { container } = render(<FormDialog open onClose={mockOnClose} />, {
    //   wrapper: ({ children }) => (
    //     <MockParent mocks={[mocks]} role="User">
    //       {children}
    //     </MockParent>
    //   ),
    // });
    // expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should render without crashing", () => {});

  it("should close the dialog when the 'Close' button is clicked", async () => {});

  it("should close the dialog when the 'X' icon is clicked", async () => {});

  it("should close the dialog when the backdrop is clicked", async () => {});

  it("should trim whitespace from the text fields before submitting", async () => {});

  it("should gracefully handle API errors (Network)", async () => {});

  it("should gracefully handle API errors (GraphQL)", async () => {});

  it("should gracefully handle API errors (Failed Response)", async () => {});
});

describe("Implementation Requirements", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should not submit the form if 'Role' or 'Organization' is invalid", async () => {});

  it("should have a tooltip on the 'Role' input", async () => {});

  it("should have a tooltip on the 'Organization' input", async () => {});

  it("should have a tooltip on the 'Additional Info' input", async () => {});

  // NOTE: ensure it validates and submits the entered data correctly
  it("should allow free text in the Organization input", async () => {});

  it("should limit 'Additional Info' to 200 characters", async () => {});

  it("should pre-select the user's current role and organization if assigned", async () => {});

  it("should not pre-select the user's current role if it's not a valid option", async () => {});

  it("should not pre-select the user's current organization if one is not assigned", async () => {});
});
