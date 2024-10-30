import { render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { FC, useMemo } from "react";
import userEvent from "@testing-library/user-event";
import { GraphQLError } from "graphql";
import {
  Context as AuthContext,
  ContextState as AuthContextState,
  Status as AuthContextStatus,
} from "../Contexts/AuthContext";
import {
  LIST_ORG_NAMES,
  ListOrgNamesResp,
  REQUEST_ACCESS,
  RequestAccessInput,
  RequestAccessResp,
} from "../../graphql";
import FormDialog from "./FormDialog";

const mockUser: User = {
  _id: "",
  firstName: "",
  lastName: "",
  email: "",
  role: "User",
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
  user?: User;
  children: React.ReactNode;
};

const MockParent: FC<MockParentProps> = ({ mocks, user = mockUser, children }) => {
  const authValue: AuthContextState = useMemo<AuthContextState>(
    () => ({
      isLoggedIn: true,
      status: AuthContextStatus.LOADED,
      user: { ...user },
    }),
    [mockUser]
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
    const mockOnClose = jest.fn();
    const mock: MockedResponse<ListOrgNamesResp> = {
      request: {
        query: LIST_ORG_NAMES,
      },
      result: {
        data: {
          listOrganizations: [],
        },
      },
      delay: 5000, // NOTE: Without this, the test throws an ACT warning and fails
    };

    const { container } = render(<FormDialog open onClose={mockOnClose} />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  const emptyOrgMock: MockedResponse<ListOrgNamesResp> = {
    request: {
      query: LIST_ORG_NAMES,
    },
    result: {
      data: {
        listOrganizations: [],
      },
    },
    variableMatcher: () => true,
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should render without crashing", () => {
    const mockOnClose = jest.fn();

    expect(() =>
      render(<FormDialog open onClose={mockOnClose} />, {
        wrapper: ({ children }) => <MockParent mocks={[emptyOrgMock]}>{children}</MockParent>,
      })
    ).not.toThrow();
  });

  it("should close the dialog when the 'Cancel' button is clicked", async () => {
    const mockOnClose = jest.fn();

    const { getByTestId } = render(<FormDialog open onClose={mockOnClose} />, {
      wrapper: ({ children }) => <MockParent mocks={[emptyOrgMock]}>{children}</MockParent>,
    });

    expect(mockOnClose).not.toHaveBeenCalled();

    userEvent.click(getByTestId("access-request-dialog-cancel-button"));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should close the dialog when the 'X' icon is clicked", async () => {
    const mockOnClose = jest.fn();

    const { getByTestId } = render(<FormDialog open onClose={mockOnClose} />, {
      wrapper: ({ children }) => <MockParent mocks={[emptyOrgMock]}>{children}</MockParent>,
    });

    expect(mockOnClose).not.toHaveBeenCalled();

    userEvent.click(getByTestId("access-request-dialog-close-icon"));

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should close the dialog when the backdrop is clicked", async () => {
    const mockOnClose = jest.fn();

    const { getByTestId } = render(<FormDialog open onClose={mockOnClose} />, {
      wrapper: ({ children }) => <MockParent mocks={[emptyOrgMock]}>{children}</MockParent>,
    });

    expect(mockOnClose).not.toHaveBeenCalled();

    userEvent.click(getByTestId("access-request-dialog").firstChild as HTMLElement);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("should gracefully handle API errors when submitting (Network)", async () => {
    const mock: MockedResponse<RequestAccessResp, RequestAccessInput> = {
      request: {
        query: REQUEST_ACCESS,
      },
      variableMatcher: () => true,
      error: new Error("Network error"),
    };

    const { getByTestId } = render(<FormDialog open onClose={jest.fn()} />, {
      wrapper: ({ children }) => <MockParent mocks={[emptyOrgMock, mock]}>{children}</MockParent>,
    });

    userEvent.type(getByTestId("access-request-organization-field"), "My Mock Organization"); // Required field

    userEvent.click(getByTestId("access-request-dialog-submit-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Unable to submit access request form. Please try again.",
        { variant: "error" }
      );
    });
  });

  it("should gracefully handle API errors when submitting (GraphQL)", async () => {
    const mock: MockedResponse<RequestAccessResp, RequestAccessInput> = {
      request: {
        query: REQUEST_ACCESS,
      },
      variableMatcher: () => true,
      result: {
        errors: [new GraphQLError("Mock GraphQL error")],
      },
    };

    const { getByTestId } = render(<FormDialog open onClose={jest.fn()} />, {
      wrapper: ({ children }) => <MockParent mocks={[emptyOrgMock, mock]}>{children}</MockParent>,
    });

    userEvent.type(getByTestId("access-request-organization-field"), "My Mock Organization"); // Required field

    userEvent.click(getByTestId("access-request-dialog-submit-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Unable to submit access request form. Please try again.",
        { variant: "error" }
      );
    });
  });

  it("should gracefully handle API errors when submitting (Success with GraphQL Errors)", async () => {
    const mock: MockedResponse<RequestAccessResp, RequestAccessInput> = {
      request: {
        query: REQUEST_ACCESS,
      },
      variableMatcher: () => true,
      result: {
        data: {
          requestAccess: {
            success: true,
            message: "Mock success with GraphQL errors",
          },
        },
        errors: [new GraphQLError("Mock GraphQL error")],
      },
    };

    const { getByTestId } = render(<FormDialog open onClose={jest.fn()} />, {
      wrapper: ({ children }) => <MockParent mocks={[emptyOrgMock, mock]}>{children}</MockParent>,
    });

    userEvent.type(getByTestId("access-request-organization-field"), "My Mock Organization"); // Required field

    userEvent.click(getByTestId("access-request-dialog-submit-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Unable to submit access request form. Please try again.",
        { variant: "error" }
      );
    });
  });

  // it("should gracefully handle API errors when submitting (Error Response)", async () => {
  //   const mock: MockedResponse<RequestAccessResp, RequestAccessInput> = {
  //     request: {
  //       query: REQUEST_ACCESS,
  //     },
  //     variableMatcher: () => true,
  //     result: {
  //       data: {
  //         requestAccess: {
  //           success: false,
  //           message: "Mock error message",
  //         },
  //       },
  //     },
  //   };

  //   const { getByTestId } = render(<FormDialog open onClose={jest.fn()} />, {
  //     wrapper: ({ children }) => <MockParent mocks={[emptyOrgMock, mock]}>{children}</MockParent>,
  //   });

  //   userEvent.type(getByTestId("access-request-organization-field"), "My Mock Organization"); // Required field

  //   userEvent.click(getByTestId("access-request-dialog-submit-button"));

  //   await waitFor(() => {
  //     expect(global.mockEnqueue).toHaveBeenCalledWith(
  //       "Unable to submit access request form. Please try again.",
  //       { variant: "error" }
  //     );
  //   });
  // });

  it("should gracefully handle organization listing API errors (GraphQL)", async () => {
    const mock: MockedResponse<ListOrgNamesResp> = {
      request: {
        query: LIST_ORG_NAMES,
      },
      result: {
        errors: [new GraphQLError("Mock GraphQL error")],
      },
      variableMatcher: () => true,
    };

    render(<FormDialog open onClose={jest.fn()} />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("Unable to retrieve organization list.", {
        variant: "error",
      });
    });
  });

  it("should gracefully handle organization listing API errors (Network)", async () => {
    const mock: MockedResponse<ListOrgNamesResp> = {
      request: {
        query: LIST_ORG_NAMES,
      },
      error: new Error("Network error"),
      variableMatcher: () => true,
    };

    render(<FormDialog open onClose={jest.fn()} />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("Unable to retrieve organization list.", {
        variant: "error",
      });
    });
  });

  it("should disable the submit button while the form is submitting", async () => {
    const mock: MockedResponse<RequestAccessResp, RequestAccessInput> = {
      request: {
        query: REQUEST_ACCESS,
      },
      variableMatcher: () => true,
      result: {
        data: {
          requestAccess: {
            success: true,
            message: "Mock success",
          },
        },
      },
    };

    const { getByTestId } = render(<FormDialog open onClose={jest.fn()} />, {
      wrapper: ({ children }) => <MockParent mocks={[emptyOrgMock, mock]}>{children}</MockParent>,
    });

    userEvent.type(getByTestId("access-request-organization-field"), "My Mock Organization"); // Required field

    userEvent.click(getByTestId("access-request-dialog-submit-button"));

    await waitFor(() => {
      expect(getByTestId("access-request-dialog-submit-button")).toBeDisabled();
    });

    await waitFor(() => {
      expect(getByTestId("access-request-dialog-submit-button")).not.toBeDisabled();
    });
  });
});

describe("Implementation Requirements", () => {
  const emptyOrgMock: MockedResponse<ListOrgNamesResp> = {
    request: {
      query: LIST_ORG_NAMES,
    },
    result: {
      data: {
        listOrganizations: [],
      },
    },
    variableMatcher: () => true,
  };

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("should have a tooltip on the 'Additional Info' input", async () => {
    const { getByTestId, findByRole } = render(<FormDialog open onClose={jest.fn()} />, {
      wrapper: ({ children }) => <MockParent mocks={[emptyOrgMock]}>{children}</MockParent>,
    });

    userEvent.hover(getByTestId("additionalInfo-input-tooltip"));

    const tooltip = await findByRole("tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent(
      "Provide details such as your host institution or lab, along with the study or program you are submitting data for, to help us determine your associated organization."
    );

    userEvent.unhover(getByTestId("additionalInfo-input-tooltip"));

    await waitFor(() => {
      expect(tooltip).not.toBeInTheDocument();
    });
  });

  it("should trim whitespace from the text fields before submitting", async () => {
    const mockMatcher = jest.fn().mockImplementation(() => true);
    const mock: MockedResponse<RequestAccessResp, RequestAccessInput> = {
      request: {
        query: REQUEST_ACCESS,
      },
      variableMatcher: mockMatcher,
      result: {
        data: {
          requestAccess: {
            success: true,
            message: "Mock success",
          },
        },
      },
    };

    const { getByTestId } = render(<FormDialog open onClose={jest.fn()} />, {
      wrapper: ({ children }) => <MockParent mocks={[emptyOrgMock, mock]}>{children}</MockParent>,
    });

    userEvent.type(getByTestId("access-request-organization-field"), "  My Mock Organization  ");

    userEvent.type(getByTestId("access-request-additionalInfo-field"), "  My Mock Info   ");

    userEvent.click(getByTestId("access-request-dialog-submit-button"));

    await waitFor(() => {
      expect(mockMatcher).toHaveBeenCalledWith({
        role: expect.any(String),
        organization: "My Mock Organization",
        additionalInfo: "My Mock Info",
      });
    });
  });

  it("should limit 'Additional Info' to 200 characters", async () => {
    const mockMatcher = jest.fn().mockImplementation(() => true);
    const submitMock: MockedResponse<RequestAccessResp, RequestAccessInput> = {
      request: {
        query: REQUEST_ACCESS,
      },
      variableMatcher: mockMatcher,
      result: {
        data: {
          requestAccess: {
            success: true,
            message: "Mock success",
          },
        },
      },
    };

    const { getByTestId } = render(<FormDialog open onClose={jest.fn()} />, {
      wrapper: ({ children }) => (
        <MockParent mocks={[emptyOrgMock, submitMock]}>{children}</MockParent>
      ),
    });

    userEvent.type(getByTestId("access-request-organization-field"), "  My Mock Organization  ");

    userEvent.type(getByTestId("access-request-additionalInfo-field"), "x".repeat(350));

    userEvent.click(getByTestId("access-request-dialog-submit-button"));

    await waitFor(() => {
      expect(mockMatcher).toHaveBeenCalledWith({
        role: expect.any(String),
        organization: expect.any(String),
        additionalInfo: "x".repeat(200),
      });
    });
  });

  it("should pre-select the user's current role and organization if assigned", async () => {
    const mockMatcher = jest.fn().mockImplementation(() => true);
    const submitMock: MockedResponse<RequestAccessResp, RequestAccessInput> = {
      request: {
        query: REQUEST_ACCESS,
      },
      variableMatcher: mockMatcher,
      result: {
        data: {
          requestAccess: {
            success: true,
            message: "Mock success",
          },
        },
      },
    };

    const orgMock: MockedResponse<ListOrgNamesResp> = {
      request: {
        query: LIST_ORG_NAMES,
      },
      result: {
        data: {
          listOrganizations: [
            {
              _id: "123",
              name: "NCI",
            },
          ],
        },
      },
      variableMatcher: () => true,
    };

    const newUser: User = {
      ...mockUser,
      role: "Organization Owner",
      organization: {
        orgID: "123",
        orgName: "NCI",
        status: "Active",
        createdAt: "",
        updateAt: "",
      },
    };

    const { getByTestId } = render(<FormDialog open onClose={jest.fn()} />, {
      wrapper: ({ children }) => (
        <MockParent mocks={[submitMock, orgMock]} user={newUser}>
          {children}
        </MockParent>
      ),
    });

    userEvent.click(getByTestId("access-request-dialog-submit-button"));

    await waitFor(() => {
      expect(mockMatcher).toHaveBeenCalledWith({
        role: "Organization Owner",
        organization: "NCI",
        additionalInfo: expect.any(String),
      });
    });
  });

  it("should pre-select the user's current organization even if it is not returned by the API", async () => {
    const mockMatcher = jest.fn().mockImplementation(() => true);
    const submitMock: MockedResponse<RequestAccessResp, RequestAccessInput> = {
      request: {
        query: REQUEST_ACCESS,
      },
      variableMatcher: mockMatcher,
      result: {
        data: {
          requestAccess: {
            success: true,
            message: "Mock success",
          },
        },
      },
    };

    const newUser: User = {
      ...mockUser,
      role: "Organization Owner",
      organization: {
        orgID: "123",
        orgName: "THIS ORG IS VERY FAKE",
        status: "Active",
        createdAt: "",
        updateAt: "",
      },
    };

    const { getByTestId } = render(<FormDialog open onClose={jest.fn()} />, {
      wrapper: ({ children }) => (
        <MockParent mocks={[submitMock, emptyOrgMock]} user={newUser}>
          {children}
        </MockParent>
      ),
    });

    userEvent.click(getByTestId("access-request-dialog-submit-button"));

    await waitFor(() => {
      expect(mockMatcher).toHaveBeenCalledWith({
        role: "Organization Owner",
        organization: "THIS ORG IS VERY FAKE",
        additionalInfo: expect.any(String),
      });
    });
  });

  it("should not pre-select the user's current role if it's not a valid option", async () => {
    const mockMatcher = jest.fn().mockImplementation(() => true);
    const submitMock: MockedResponse<RequestAccessResp, RequestAccessInput> = {
      request: {
        query: REQUEST_ACCESS,
      },
      variableMatcher: mockMatcher,
      result: {
        data: {
          requestAccess: {
            success: true,
            message: "Mock success",
          },
        },
      },
    };

    const newUser: User = {
      ...mockUser,
      role: "Admin", // Technically not even able to see this dialog
      organization: {
        orgID: "123",
        orgName: "NCI",
        status: "Active",
        createdAt: "",
        updateAt: "",
      },
    };

    const { getByTestId } = render(<FormDialog open onClose={jest.fn()} />, {
      wrapper: ({ children }) => (
        <MockParent mocks={[submitMock, emptyOrgMock]} user={newUser}>
          {children}
        </MockParent>
      ),
    });

    userEvent.click(getByTestId("access-request-dialog-submit-button"));

    await waitFor(() => {
      expect(mockMatcher).toHaveBeenCalledWith({
        role: "Submitter", // Default role
        organization: "NCI",
        additionalInfo: expect.any(String),
      });
    });
  });

  it("should not pre-select the user's current organization if one is not assigned", async () => {
    const mockMatcher = jest.fn().mockImplementation(() => true);
    const submitMock: MockedResponse<RequestAccessResp, RequestAccessInput> = {
      request: {
        query: REQUEST_ACCESS,
      },
      variableMatcher: mockMatcher,
      result: {
        data: {
          requestAccess: {
            success: true,
            message: "Mock success",
          },
        },
      },
    };

    const newUser: User = {
      ...mockUser,
      role: "Organization Owner",
      organization: null,
    };

    const { getByTestId } = render(<FormDialog open onClose={jest.fn()} />, {
      wrapper: ({ children }) => (
        <MockParent mocks={[submitMock, emptyOrgMock]} user={newUser}>
          {children}
        </MockParent>
      ),
    });

    userEvent.click(getByTestId("access-request-dialog-submit-button"));

    await waitFor(() => {
      expect(getByTestId("access-request-dialog-error-organization")).toHaveTextContent(
        "This field is required"
      );
    });
  });
});
