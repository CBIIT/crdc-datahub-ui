import React, { FC } from "react";
import { render, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import GenericTable, { Column, Props } from "../DataSubmissions/GenericTable";
import { SearchParamsProvider } from "../Contexts/SearchParamsContext";

const mockData = [
  { _id: "1", name: "Alice", role: "Developer" },
  { _id: "2", name: "Bob", role: "Designer" },
  { _id: "3", name: "Bob2", role: "Designer2" },
  { _id: "4", name: "Bob3", role: "Designer3" },
  { _id: "5", name: "Bob4", role: "Designer4" },
  { _id: "6", name: "Bob5", role: "Designer5" },
];

const columns: Column<(typeof mockData)[0]>[] = [
  {
    label: "Name",
    renderValue: (item: (typeof mockData)[0]) => item.name,
    field: "name" as const,
    default: true,
  },
  {
    label: "Role",
    renderValue: (item: (typeof mockData)[0]) => item.role,
    field: "role" as const,
  },
];

const defaultProps: Props<(typeof mockData)[0]> = {
  columns,
  data: mockData,
  total: mockData.length,
  loading: false,
  position: "bottom",
  defaultRowsPerPage: 1,
  defaultOrder: "asc",
  onFetchData: jest.fn(),
  onOrderChange: jest.fn(),
  onOrderByChange: jest.fn(),
  onPerPageChange: jest.fn(),
};

type ParentProps = {
  mocks?: MockedResponse[];
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({ mocks, children }: ParentProps) => (
  <MockedProvider mocks={mocks} showWarnings>
    <MemoryRouter basename="">
      <SearchParamsProvider>{children}</SearchParamsProvider>
    </MemoryRouter>
  </MockedProvider>
);

const setup = (props = defaultProps) => {
  const ref = React.createRef<TableMethods>();
  const utils = render(
    <TestParent>
      <GenericTable ref={ref} {...props} />
    </TestParent>
  );
  return { ref, ...utils };
};

describe("GenericTable", () => {
  it("renders without errors", () => {
    const { getByText, getByTestId } = setup();
    expect(getByText("Alice")).toBeInTheDocument();
    expect(getByText("Bob")).toBeInTheDocument();
    expect(getByTestId(`generic-table-header-${columns[0].label}`)).toBeInTheDocument();
    expect(getByTestId(`generic-table-header-${columns[1].label}`)).toBeInTheDocument();
  });

  it("handles sort direction changes", () => {
    const { getByText } = setup();
    const nameHeader = getByText("Name");
    userEvent.click(nameHeader);
    expect(defaultProps.onOrderChange).toHaveBeenCalledWith("desc");
    expect(defaultProps.onOrderByChange).toHaveBeenCalledWith(columns[0]);
  });

  it("handles page changes via pagination next button", () => {
    const { getByRole } = setup();
    const pagination = getByRole("navigation");
    const nextPageButton = within(pagination).getByLabelText("Go to next page");
    const defaultColumn = columns.find((c) => c.default);
    userEvent.click(nextPageButton);

    const fetchListing: FetchListing<(typeof mockData)[0]> = {
      first: defaultProps.defaultRowsPerPage,
      offset: 1 * defaultProps.defaultRowsPerPage,
      sortDirection: defaultProps.defaultOrder,
      orderBy: defaultColumn?.fieldKey ?? defaultColumn?.field?.toString(),
    };
    expect(defaultProps.onFetchData).toHaveBeenCalledWith(fetchListing, false);
  });

  it("handles page changes via pagination number button", async () => {
    const { getByRole } = setup();
    const pagination = getByRole("navigation");
    const page3Button = within(pagination).getByLabelText("Go to page 3");
    const defaultColumn = columns.find((c) => c.default);
    userEvent.click(page3Button);

    const fetchListing: FetchListing<(typeof mockData)[0]> = {
      first: defaultProps.defaultRowsPerPage,
      offset: 2 * defaultProps.defaultRowsPerPage,
      sortDirection: defaultProps.defaultOrder,
      orderBy: defaultColumn?.fieldKey ?? defaultColumn?.field?.toString(),
      comparator: undefined,
    };
    expect(defaultProps.onFetchData).toHaveBeenCalledWith(fetchListing, false);
  });

  it("updates rows per page", () => {
    const { getByLabelText } = setup();
    const select = getByLabelText("rows per page");
    fireEvent.change(select, { target: { value: 10 } });
    expect(defaultProps.onPerPageChange).toHaveBeenCalledWith(10);
  });

  it("refreshes data when called from ref", () => {
    const { ref } = setup();
    ref.current?.refresh();
    expect(defaultProps.onFetchData).toHaveBeenCalledWith(expect.anything(), true);
  });

  it("displays no data message when there is no data", () => {
    const { getByText } = setup({ ...defaultProps, data: [], total: 0 });
    expect(getByText("No existing data was found")).toBeInTheDocument();
  });

  it("properly handles an empty columns array", () => {
    const { queryByRole } = setup({ ...defaultProps, columns: [] });
    expect(queryByRole("columnheader")).not.toBeInTheDocument();
  });
});
