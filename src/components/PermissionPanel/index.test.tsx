import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { act, render, within } from "@testing-library/react";
import { FormProvider, FormProviderProps } from "react-hook-form";
import { axe } from "jest-axe";
import { FC } from "react";
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
      if (field === "role") return "Admin";
      return [];
    });

    const { getByTestId } = render(<PermissionPanel role="Submitter" />, {
      wrapper: ({ children }) => (
        <MockParent mocks={[mock]} methods={{ watch: mockWatcher } as unknown as FormProviderProps}>
          {children}
        </MockParent>
      ),
    });

    const srGroup = getByTestId("permissions-group-Submission Request");
    expect(srGroup).toBeInTheDocument();
    expect(within(srGroup).getByTestId("permission-submission_request:create")).toBeInTheDocument();
    const dsGroup = getByTestId("permissions-group-Data Submission");

    expect(dsGroup).toBeInTheDocument();
    expect(within(dsGroup).getByTestId("permission-data_submission:view")).toBeInTheDocument();

    const adminGroup = getByTestId("permissions-group-Admin");
    expect(adminGroup).toBeInTheDocument();
    expect(within(adminGroup).getByTestId("permission-program:manage")).toBeInTheDocument();

    const dsNotifGroup = getByTestId("notifications-group-Data Submissions");
    expect(dsNotifGroup).toBeInTheDocument();
    expect(
      within(dsNotifGroup).getByTestId("notification-data_submission:cancelled")
    ).toBeInTheDocument();

    const accountGroup = getByTestId("notifications-group-Account");
    expect(accountGroup).toBeInTheDocument();
    expect(within(accountGroup).getByTestId("notification-account:disabled")).toBeInTheDocument();
  });

  it.todo("should utilize a maximum of 3 columns for the permissions");

  it.todo("should utilize a maximum of 3 columns for the notifications");

  it.todo(
    "should utilize the current permissions to determine the checked state of each permission"
  );

  it.todo("should log an error when unable to retrieve the default PBAC details (GraphQL)");

  it.todo("should log an error when unable to retrieve the default PBAC details (Network)");

  it.todo("should log an error when unable to retrieve the default PBAC details (API)");

  it.todo("should log an error when a permission is assigned but not provided in the defaults");

  it.todo("should log an error when a notification is assigned but not provided in the defaults");

  it.todo("should render a loading state when fetching the default PBAC details");
});

describe("Implementation Requirements", () => {
  it.todo("should reset the permissions to their default values when the role changes");

  it.todo("should allow disabled permissions to be checked by default");

  it.todo("should be rendered as collapsed by default");

  it.todo("should propagate the permissions selections to the parent form");

  it.todo("should propagate the notification selections to the parent form");
});
