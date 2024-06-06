import React, { FC } from "react";
import { render, waitFor } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import {
  OrganizationProvider,
  Status as OrgStatus,
  useOrganizationListContext,
} from "./OrganizationListContext";
import { LIST_ORGS } from "../../graphql";

type Props = {
  mocks?: MockedResponse[];
  children?: React.ReactNode;
};

const TestChild: FC = () => {
  const { status, data } = useOrganizationListContext();

  if (status === OrgStatus.LOADING) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div data-testid="status">{status}</div>
      <ul data-testid="organization-list">
        {data?.map((org, index) => (
          <li key={org?._id} data-testid={`organization-${index}`}>
            {org.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

const TestParent: FC<Props> = ({ mocks, children }: Props) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <OrganizationProvider filterInactive={false} preload>
      {children ?? <TestChild />}
    </OrganizationProvider>
  </MockedProvider>
);

describe("OrganizationListContext > useOrganizationListContext Tests", () => {
  it("should throw an exception when used outside of the OrganizationProvider", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestChild />)).toThrow(
      "OrganizationListContext cannot be used outside of the OrganizationProvider component"
    );
    jest.spyOn(console, "error").mockRestore();
  });
});

describe("OrganizationListContext > OrganizationProvider Tests", () => {
  it("should render without crashing", () => {
    render(<TestParent />);
  });

  it("should handle loading state correctly", async () => {
    const { getByText } = render(<TestParent />);
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

  it("should filter inactive organizations if filterInactive is true", async () => {
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

    // Override the OrganizationProvider for filtering
    const FilteredTestParent: FC = () => (
      <MockedProvider mocks={mocks} addTypename={false}>
        <OrganizationProvider preload filterInactive>
          <TestChild />
        </OrganizationProvider>
      </MockedProvider>
    );

    const { getByTestId } = render(<FilteredTestParent />);

    await waitFor(() => {
      expect(getByTestId("organization-list").textContent).toContain("Active Org");
      expect(getByTestId("organization-list").textContent).not.toContain("Inactive Org");
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
});
