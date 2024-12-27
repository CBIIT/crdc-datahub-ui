import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { act, render, waitFor, within } from "@testing-library/react";
import { FormProvider, FormProviderProps } from "react-hook-form";
import { axe } from "jest-axe";
import { FC } from "react";
import { GraphQLError } from "graphql";
import PermissionPanel from "./index";
import {
  RETRIEVE_PBAC_DEFAULTS,
  RetrievePBACDefaultsInput,
  RetrievePBACDefaultsResp,
} from "../../graphql";

type MockParentProps = {
  children: React.ReactNode;
  methods?: FormProviderProps<unknown>;
  mocks?: MockedResponse[];
};

const MockParent: FC<MockParentProps> = ({ children, methods, mocks = [] }) => (
  <MockedProvider mocks={mocks}>
    <FormProvider
      watch={jest.fn().mockImplementation(() => []) as FormProviderProps["watch"]}
      setValue={jest.fn()}
      {...methods}
    >
      {children}
    </FormProvider>
  </MockedProvider>
);

describe("Accessibility", () => {
  it("should not have any accessibility violations (empty)", async () => {
    const mock: MockedResponse<RetrievePBACDefaultsResp, RetrievePBACDefaultsInput> = {
      request: {
        query: RETRIEVE_PBAC_DEFAULTS,
        variables: { roles: ["All"] },
      },
      result: {
        data: {
          retrievePBACDefaults: [
            {
              role: "Submitter",
              permissions: [],
              notifications: [],
            },
          ],
        },
      },
    };

    const { container } = render(<PermissionPanel role="Submitter" />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    let result;
    await act(async () => {
      result = await axe(container);
    });
    expect(result).toHaveNoViolations();
  });

  it("should not have any accessibility violations (populated)", async () => {
    const mock: MockedResponse<RetrievePBACDefaultsResp, RetrievePBACDefaultsInput> = {
      request: {
        query: RETRIEVE_PBAC_DEFAULTS,
        variables: { roles: ["All"] },
      },
      result: {
        data: {
          retrievePBACDefaults: [
            {
              role: "Submitter",
              permissions: [
                {
                  _id: "submission_request:create",
                  group: "Submission Request",
                  name: "Create",
                  checked: false,
                  disabled: false,
                },
                {
                  _id: "data_submission:view",
                  group: "Data Submission",
                  name: "View",
                  checked: true,
                  disabled: true,
                },
              ],
              notifications: [
                {
                  _id: "data_submission:cancelled",
                  group: "Data Submissions",
                  name: "Cancelled",
                  checked: false,
                  disabled: false,
                },
                {
                  _id: "account:disabled",
                  group: "Account",
                  name: "Disabled",
                  checked: false,
                  disabled: false,
                },
              ],
            },
          ],
        },
      },
    };

    const { container } = render(<PermissionPanel role="Submitter" />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    let result;
    await act(async () => {
      result = await axe(container);
    });
    expect(result).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("should not crash when rendered", async () => {
    const mock: MockedResponse<RetrievePBACDefaultsResp, RetrievePBACDefaultsInput> = {
      request: {
        query: RETRIEVE_PBAC_DEFAULTS,
        variables: { roles: ["All"] },
      },
      result: {
        data: {
          retrievePBACDefaults: [
            {
              role: "Submitter",
              permissions: [],
              notifications: [],
            },
          ],
        },
      },
    };

    render(<PermissionPanel role="Submitter" />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });
  });

  it("should cache the default PBAC data by default", async () => {
    const mockMatcher = jest.fn().mockImplementation(() => true);
    const mock: MockedResponse<RetrievePBACDefaultsResp, RetrievePBACDefaultsInput> = {
      request: {
        query: RETRIEVE_PBAC_DEFAULTS,
      },
      variableMatcher: mockMatcher,
      result: {
        data: {
          retrievePBACDefaults: [
            {
              role: "Submitter",
              permissions: [],
              notifications: [],
            },
          ],
        },
      },
      maxUsageCount: 999,
    };

    const { rerender } = render(<PermissionPanel role="Submitter" />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    expect(mockMatcher).toHaveBeenCalledTimes(1);

    rerender(<PermissionPanel role="Admin" />);

    expect(mockMatcher).toHaveBeenCalledTimes(1);
  });

  it("should group the permissions by their pre-defined groups", async () => {
    const mock: MockedResponse<RetrievePBACDefaultsResp, RetrievePBACDefaultsInput> = {
      request: {
        query: RETRIEVE_PBAC_DEFAULTS,
        variables: { roles: ["All"] },
      },
      result: {
        data: {
          retrievePBACDefaults: [
            {
              role: "Submitter",
              permissions: [
                {
                  _id: "submission_request:create",
                  group: "Submission Request",
                  name: "Create",
                  checked: true,
                  disabled: false,
                },
                {
                  _id: "data_submission:view",
                  group: "Data Submission",
                  name: "View",
                  checked: true,
                  disabled: true,
                },
                {
                  _id: "program:manage",
                  group: "Admin",
                  name: "Manage Programs",
                  checked: false,
                  disabled: false,
                },
              ],
              notifications: [
                {
                  _id: "data_submission:cancelled",
                  group: "Data Submissions",
                  name: "Cancelled",
                  checked: false,
                  disabled: false,
                },
                {
                  _id: "account:disabled",
                  group: "Account",
                  name: "Disabled",
                  checked: false,
                  disabled: false,
                },
              ],
            },
          ],
        },
      },
    };

    const mockWatcher = jest.fn().mockImplementation((field) => {
      // Return the selected role (e.g. watch("role"))
      if (field === "role") {
        return "Submitter";
      }

      // Return the selected permissions (e.g. watch("permissions"))
      return [];
    });

    const { getByTestId } = render(<PermissionPanel role="Submitter" />, {
      wrapper: ({ children }) => (
        <MockParent mocks={[mock]} methods={{ watch: mockWatcher } as unknown as FormProviderProps}>
          {children}
        </MockParent>
      ),
    });

    await waitFor(() => {
      expect(getByTestId("permissions-group-Submission Request")).toBeInTheDocument();
    });

    const srGroup = getByTestId("permissions-group-Submission Request");
    expect(within(srGroup).getByTestId("permission-submission_request:create")).toBeInTheDocument();

    const dsGroup = getByTestId("permissions-group-Data Submission");
    expect(dsGroup).toBeInTheDocument();
    expect(within(dsGroup).getByTestId("permission-data_submission:view")).toBeInTheDocument();

    const adminGroup = getByTestId("permissions-group-Admin");
    expect(adminGroup).toBeInTheDocument();
    expect(within(adminGroup).getByTestId("permission-program:manage")).toBeInTheDocument();

    const dsEmailGroup = getByTestId("notifications-group-Data Submissions");
    expect(dsEmailGroup).toBeInTheDocument();
    expect(
      within(dsEmailGroup).getByTestId("notification-data_submission:cancelled")
    ).toBeInTheDocument();

    const accountGroup = getByTestId("notifications-group-Account");
    expect(accountGroup).toBeInTheDocument();
    expect(within(accountGroup).getByTestId("notification-account:disabled")).toBeInTheDocument();
  });

  it("should utilize a maximum of 3 columns for the permissions", async () => {
    const mock: MockedResponse<RetrievePBACDefaultsResp, RetrievePBACDefaultsInput> = {
      request: {
        query: RETRIEVE_PBAC_DEFAULTS,
        variables: { roles: ["All"] },
      },
      result: {
        data: {
          retrievePBACDefaults: [
            {
              role: "Submitter",
              permissions: [
                {
                  _id: "submission_request:create",
                  group: "Group1",
                  name: "Create",
                  checked: true,
                  disabled: false,
                },
                {
                  _id: "submission_request:review",
                  group: "Group2",
                  name: "Create",
                  checked: true,
                  disabled: false,
                },
                {
                  _id: "submission_request:submit",
                  group: "Group3",
                  name: "Create",
                  checked: true,
                  disabled: false,
                },
                {
                  _id: "submission_request:view",
                  group: "Group4",
                  name: "Create",
                  checked: true,
                  disabled: false,
                },
                {
                  _id: "data_submission:create",
                  group: "Group5",
                  name: "Create",
                  checked: true,
                  disabled: false,
                },
                {
                  _id: "study:manage",
                  group: "Group6",
                  name: "Create",
                  checked: true,
                  disabled: false,
                },
              ],
              notifications: [],
            },
          ],
        },
      },
    };

    const mockWatcher = jest.fn().mockImplementation((field) => {
      if (field === "role") {
        return "Submitter";
      }

      return [];
    });

    const { getByTestId, queryByTestId } = render(<PermissionPanel role="Submitter" />, {
      wrapper: ({ children }) => (
        <MockParent mocks={[mock]} methods={{ watch: mockWatcher } as unknown as FormProviderProps}>
          {children}
        </MockParent>
      ),
    });

    await waitFor(() => {
      expect(getByTestId("permissions-column-0")).toBeInTheDocument();
      expect(getByTestId("permissions-column-1")).toBeInTheDocument();
      expect(getByTestId("permissions-column-2")).toBeInTheDocument();
    });

    // Column 0-1 (has 1 group)
    expect(
      within(getByTestId("permissions-column-0")).getByTestId("permissions-group-Group1")
    ).toBeInTheDocument();
    expect(
      within(getByTestId("permissions-column-1")).getByTestId("permissions-group-Group2")
    ).toBeInTheDocument();

    // Column 2 (has remaining groups)
    expect(
      within(getByTestId("permissions-column-2")).getByTestId("permissions-group-Group3")
    ).toBeInTheDocument();
    expect(
      within(getByTestId("permissions-column-2")).getByTestId("permissions-group-Group4")
    ).toBeInTheDocument();
    expect(
      within(getByTestId("permissions-column-2")).getByTestId("permissions-group-Group5")
    ).toBeInTheDocument();
    expect(
      within(getByTestId("permissions-column-2")).getByTestId("permissions-group-Group6")
    ).toBeInTheDocument();

    // Sanity check
    expect(queryByTestId("permissions-column-3")).not.toBeInTheDocument();
  });

  it("should utilize a maximum of 3 columns for the notifications", async () => {
    const mock: MockedResponse<RetrievePBACDefaultsResp, RetrievePBACDefaultsInput> = {
      request: {
        query: RETRIEVE_PBAC_DEFAULTS,
        variables: { roles: ["All"] },
      },
      result: {
        data: {
          retrievePBACDefaults: [
            {
              role: "Submitter",
              permissions: [],
              notifications: [
                {
                  _id: "access:requested",
                  group: "Group1",
                  name: "Notification 1",
                  checked: true,
                  disabled: false,
                },
                {
                  _id: "account:disabled",
                  group: "Group2",
                  name: "Notification 2",
                  checked: true,
                  disabled: false,
                },
                {
                  _id: "data_submission:cancelled",
                  group: "Group3",
                  name: "Notification 3",
                  checked: true,
                  disabled: false,
                },
                {
                  _id: "submission_request:to_be_reviewed",
                  group: "Group4",
                  name: "Notification 4",
                  checked: true,
                  disabled: false,
                },
                {
                  _id: "data_submission:withdrawn",
                  group: "Group5",
                  name: "Notification 5",
                  checked: true,
                  disabled: false,
                },
                {
                  _id: "data_submission:deleted",
                  group: "Group6",
                  name: "Notification 6",
                  checked: true,
                  disabled: false,
                },
              ],
            },
          ],
        },
      },
    };

    const mockWatcher = jest.fn().mockImplementation((field) => {
      if (field === "role") {
        return "Submitter";
      }

      return [];
    });

    const { getByTestId, queryByTestId } = render(<PermissionPanel role="Submitter" />, {
      wrapper: ({ children }) => (
        <MockParent mocks={[mock]} methods={{ watch: mockWatcher } as unknown as FormProviderProps}>
          {children}
        </MockParent>
      ),
    });

    await waitFor(() => {
      expect(getByTestId("notifications-column-0")).toBeInTheDocument();
      expect(getByTestId("notifications-column-1")).toBeInTheDocument();
      expect(getByTestId("notifications-column-2")).toBeInTheDocument();
    });

    // Column 0-1 (has 1 group)
    expect(
      within(getByTestId("notifications-column-0")).getByTestId("notifications-group-Group1")
    ).toBeInTheDocument();
    expect(
      within(getByTestId("notifications-column-1")).getByTestId("notifications-group-Group2")
    ).toBeInTheDocument();

    // Column 2 (has remaining groups)
    expect(
      within(getByTestId("notifications-column-2")).getByTestId("notifications-group-Group3")
    ).toBeInTheDocument();
    expect(
      within(getByTestId("notifications-column-2")).getByTestId("notifications-group-Group4")
    ).toBeInTheDocument();
    expect(
      within(getByTestId("notifications-column-2")).getByTestId("notifications-group-Group5")
    ).toBeInTheDocument();
    expect(
      within(getByTestId("notifications-column-2")).getByTestId("notifications-group-Group6")
    ).toBeInTheDocument();

    // Sanity check
    expect(queryByTestId("notifications-column-3")).not.toBeInTheDocument();
  });

  it("should show an error when unable to retrieve the default PBAC details (GraphQL)", async () => {
    const mock: MockedResponse<RetrievePBACDefaultsResp, RetrievePBACDefaultsInput> = {
      request: {
        query: RETRIEVE_PBAC_DEFAULTS,
        variables: { roles: ["All"] },
      },
      result: {
        errors: [new GraphQLError("Mock Error")],
      },
    };

    render(<PermissionPanel role="Submitter" />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(expect.any(String), {
        variant: "error",
      });
    });
  });

  it("should show an error when unable to retrieve the default PBAC details (Network)", async () => {
    const mock: MockedResponse<RetrievePBACDefaultsResp, RetrievePBACDefaultsInput> = {
      request: {
        query: RETRIEVE_PBAC_DEFAULTS,
        variables: { roles: ["All"] },
      },
      error: new Error("Network error"),
    };

    render(<PermissionPanel role="Submitter" />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(expect.any(String), {
        variant: "error",
      });
    });
  });
});

describe("Implementation Requirements", () => {
  it.todo(
    "should utilize the current permissions to determine the checked state of each permission"
  );

  it.todo("should reset the permissions to their default values when the role changes");

  it.todo("should allow disabled permissions to be checked by default");

  it.todo("should be rendered as collapsed by default");

  it.todo(
    "should sort the permission groups in the following order: Submission Request, Data Submission, Admin, Miscellaneous"
  );

  it.todo("should propagate the permissions selections to the parent form");

  it.todo("should propagate the notification selections to the parent form");

  it("should render a notice when there are no default PBAC details for a role", async () => {
    const mock: MockedResponse<RetrievePBACDefaultsResp, RetrievePBACDefaultsInput> = {
      request: {
        query: RETRIEVE_PBAC_DEFAULTS,
        variables: { roles: ["All"] },
      },
      result: {
        data: {
          retrievePBACDefaults: [],
        },
      },
    };

    const { getByTestId } = render(<PermissionPanel role="Submitter" />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    expect(getByTestId("no-permissions-notice")).toBeInTheDocument();
    expect(getByTestId("no-permissions-notice")).toHaveTextContent(
      /No permission options found for this role./i
    );

    expect(getByTestId("no-notifications-notice")).toBeInTheDocument();
    expect(getByTestId("no-notifications-notice")).toHaveTextContent(
      /No notification options found for this role./i
    );
  });
});
