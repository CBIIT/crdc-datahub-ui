import React, { FC } from "react";
import { render, waitFor } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import { vi } from "vitest";
import {
  OrganizationProvider,
  Status as OrgStatus,
  useOrganizationListContext,
} from "./OrganizationListContext";
import { LIST_ORGS } from "../../graphql";

type Props = {
  mocks?: MockedResponse[];
  preload?: boolean;
  children?: React.ReactNode;
};

const TestChild: FC = () => {
  const { status, data, activeOrganizations } = useOrganizationListContext();

  if (status === OrgStatus.LOADING) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div data-testid="status">{status}</div>
      <ul data-testid="organization-list">
        {data?.map((org, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={`organization-${index}`} data-testid={`organization-${index}`}>
            {org.name}
          </li>
        ))}
      </ul>
      <ul data-testid="active-organization-list">
        {activeOrganizations?.map((org, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={`active-organization-${index}`} data-testid={`active-organization-${index}`}>
            {org.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

const TestParent: FC<Props> = ({ mocks, preload = true, children }: Props) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <OrganizationProvider preload={preload}>{children ?? <TestChild />}</OrganizationProvider>
  </MockedProvider>
);

describe("OrganizationListContext > useOrganizationListContext Tests", () => {
  it("should throw an exception when used outside of the OrganizationProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestChild />)).toThrow(
      "OrganizationListContext cannot be used outside of the OrganizationProvider component"
    );
    vi.spyOn(console, "error").mockRestore();
  });
});

describe("OrganizationListContext > OrganizationProvider Tests", () => {
  const emptyMocks = [
    {
      request: {
        query: LIST_ORGS,
      },
      result: {
        data: {
          listOrganizations: [],
        },
      },
    },
  ];

  it("should render without crashing", () => {
    render(<TestParent mocks={emptyMocks} />);
  });

  it("should handle loading state correctly", async () => {
    const { getByText } = render(<TestParent mocks={emptyMocks} />);
    expect(getByText("Loading...")).toBeInTheDocument();
  });

  it("should load and display organization data", async () => {
    const orgData = [
      { name: "Org One", status: "Active" },
      { name: "Org Two", status: "Active" },
    ];

    const mocks = [
      {
        request: {
          query: LIST_ORGS,
        },
        result: {
          data: {
            listOrganizations: orgData,
          },
        },
      },
    ];

    const { getByTestId } = render(<TestParent mocks={mocks} />);

    await waitFor(() => {
      expect(getByTestId("status").textContent).toEqual(OrgStatus.LOADED);
      expect(getByTestId("organization-0").textContent).toEqual("Org One");
      expect(getByTestId("organization-1").textContent).toEqual("Org Two");
    });
  });

  it("should handle errors when failing to load organizations", async () => {
    const mocks = [
      {
        request: {
          query: LIST_ORGS,
        },
        result: {
          errors: [new GraphQLError("Failed to fetch")],
        },
      },
    ];

    const { getByTestId } = render(<TestParent mocks={mocks} />);

    await waitFor(() => {
      expect(getByTestId("status").textContent).toEqual(OrgStatus.ERROR);
    });
  });

  it("should only show active organizations in the activeOrganizations list", async () => {
    const orgData = [
      { name: "Active Org", status: "Active" },
      { name: "Inactive Org", status: "Inactive" },
    ];

    const mocks = [
      {
        request: {
          query: LIST_ORGS,
        },
        result: {
          data: {
            listOrganizations: orgData,
          },
        },
      },
    ];

    const FilteredTestParent: FC = () => (
      <MockedProvider mocks={mocks} addTypename={false}>
        <OrganizationProvider preload>
          <TestChild />
        </OrganizationProvider>
      </MockedProvider>
    );

    const { getByTestId } = render(<FilteredTestParent />);

    await waitFor(() => {
      expect(getByTestId("organization-list").textContent).toContain("Active Org");
      expect(getByTestId("organization-list").textContent).toContain("Inactive Org");
      expect(getByTestId("active-organization-list").textContent).not.toContain("Inactive Org");
    });
  });

  it("should sort organizations by name in ascending order", async () => {
    const orgData = [
      { name: "Organization Zeta", status: "Active" },
      { name: "Organization Alpha", status: "Active" },
      { name: "Organization Delta", status: "Active" },
    ];

    const mocks = [
      {
        request: {
          query: LIST_ORGS,
        },
        result: {
          data: {
            listOrganizations: orgData,
          },
        },
      },
    ];

    const { getByTestId } = render(<TestParent mocks={mocks} />);

    await waitFor(() => {
      expect(getByTestId("organization-0").textContent).toEqual("Organization Alpha");
      expect(getByTestId("organization-1").textContent).toEqual("Organization Delta");
      expect(getByTestId("organization-2").textContent).toEqual("Organization Zeta");
    });
  });

  it("should not execute query when preload is false", async () => {
    const { queryByText } = render(
      <TestParent mocks={[]} preload={false}>
        <TestChild />
      </TestParent>
    );
    await waitFor(() => {
      expect(queryByText("Loading...")).not.toBeInTheDocument();
    });
  });

  it("should handle state changes gracefully", async () => {
    const orgData = [{ name: "Org Fast", status: "Active" }];
    const loadingMock = {
      request: { query: LIST_ORGS },
      result: { data: { listOrganizations: [] } },
      delay: 100,
    };
    const loadedMock = {
      request: { query: LIST_ORGS },
      result: { data: { listOrganizations: orgData } },
    };

    const { getByText } = render(<TestParent mocks={[loadingMock]} />);

    await waitFor(() => {
      expect(getByText("Loading...")).toBeInTheDocument();
    });

    const { getByTestId } = render(<TestParent mocks={[loadedMock]} />);

    await waitFor(() => {
      expect(getByTestId("status").textContent).toEqual(OrgStatus.LOADED);
      expect(getByTestId("organization-0").textContent).toEqual("Org Fast");
    });
  });

  it("should correctly update all consumers when state changes", async () => {
    const orgData = [{ name: "Org Multi", status: "Active" }];

    const mocks = [
      {
        request: { query: LIST_ORGS },
        result: { data: { listOrganizations: orgData } },
      },
    ];

    const DoubleConsumer: FC = () => (
      <MockedProvider mocks={mocks} addTypename={false}>
        <OrganizationProvider preload>
          <TestChild />
          <TestChild />
        </OrganizationProvider>
      </MockedProvider>
    );

    const { getAllByTestId } = render(<DoubleConsumer />);

    await waitFor(() => {
      const statuses = getAllByTestId("status");
      expect(statuses[0].textContent).toEqual(OrgStatus.LOADED);
      expect(statuses[1].textContent).toEqual(OrgStatus.LOADED);
    });
  });

  it("should handle partial data without crashing", async () => {
    const partialDataMocks = [
      {
        request: { query: LIST_ORGS },
        result: {
          data: { listOrganizations: [{ name: "Org Partial" }] }, // Missing "status"
        },
      },
    ];

    const { getByTestId } = render(<TestParent mocks={partialDataMocks} />);

    await waitFor(() => {
      expect(getByTestId("status").textContent).toEqual(OrgStatus.LOADED);
      expect(getByTestId("organization-0").textContent).toEqual("Org Partial");
    });
  });
});
