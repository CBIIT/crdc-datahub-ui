import React, { FC } from "react";
import { render, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import GenericTable, { Column, Props } from ".";
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

const TestParent: FC<{ mocks?: MockedResponse[]; children: React.ReactNode }> = ({
  mocks,
  children,
}) => (
  <MockedProvider mocks={mocks} showWarnings>
    <MemoryRouter>
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

  describe("Sorting and Pagination", () => {
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

      const fetchListing = {
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

      const fetchListing = {
        first: defaultProps.defaultRowsPerPage,
        offset: 2 * defaultProps.defaultRowsPerPage,
        sortDirection: defaultProps.defaultOrder,
        orderBy: defaultColumn?.fieldKey ?? defaultColumn?.field?.toString(),
      };
      expect(defaultProps.onFetchData).toHaveBeenCalledWith(fetchListing, false);
    });
  });

  describe("Row and Page Interaction", () => {
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

    it("properly handles an empty columns array", () => {
      const { queryByRole } = setup({ ...defaultProps, columns: [] });
      expect(queryByRole("columnheader")).not.toBeInTheDocument();
    });
  });

  describe("Style Application", () => {
    it("applies horizontal scroll styles when enabled", () => {
      const { container } = setup({ ...defaultProps, horizontalScroll: true });
      expect(container.querySelector("table")).toHaveStyle("white-space: nowrap");
      expect(container.querySelector("table")).toHaveStyle("display: block");
      expect(container.querySelector("table")).toHaveStyle("overflow-x: auto");
    });

    it("does not apply horizontal scroll styles when disabled", () => {
      const { container } = setup({ ...defaultProps, horizontalScroll: false });
      expect(container.querySelector("table")).toHaveStyle("white-space: initial");
      expect(container.querySelector("table")).toHaveStyle("display: table");
      expect(container.querySelector("table")).toHaveStyle("overflow-x: initial");
    });

    it("applies borderBottom style conditionally based on row position", () => {
      const { getAllByTestId } = setup();

      const tableCells = getAllByTestId("table-body-cell-with-data");

      const lastRow = tableCells[tableCells.length - 1];
      expect(lastRow).toHaveStyle("border-bottom: none");

      const anyOtherRow = tableCells[0];
      expect(anyOtherRow).toHaveStyle("border-bottom: 1px solid #6B7294");
    });
  });

  describe("Early Return Conditions", () => {
    it("does not invoke data fetching when onFetchData is not provided", () => {
      const { getByText } = setup({
        ...defaultProps,
        onFetchData: undefined,
      });

      const nameHeader = getByText("Name");
      userEvent.click(nameHeader);
      expect(defaultProps.onFetchData).not.toHaveBeenCalled();
    });
  });

  describe("No Data and Errors", () => {
    it("displays no data message when there is no data", () => {
      const { getByText } = setup({ ...defaultProps, data: [], total: 0 });
      expect(getByText("No existing data was found")).toBeInTheDocument();
    });

    it("properly handles an empty columns array", () => {
      const { queryByRole } = setup({ ...defaultProps, columns: [] });
      expect(queryByRole("columnheader")).not.toBeInTheDocument();
    });

    it("displays empty rows when data is less than per page count", () => {
      const { getAllByRole } = setup({ ...defaultProps, data: [mockData[0]], total: 1 });
      expect(getAllByRole("row").length).toBeGreaterThan(1); // Includes header row
    });
  });

  describe("Visual and Interaction Features", () => {
    it("checks styled component properties when horizontal scroll is enabled", () => {
      const { container } = setup({ ...defaultProps, horizontalScroll: true });
      expect(container.querySelector(".MuiTable-root")).toHaveStyle("display: block");
    });

    it("renders top and bottom pagination when position is both", () => {
      const { getByTestId } = setup({ ...defaultProps, position: "both" });
      const topPagination = getByTestId("generic-table-rows-per-page-top");
      const bottomPagination = getByTestId("generic-table-rows-per-page-bottom");
      expect(topPagination).toBeInTheDocument();
      expect(bottomPagination).toBeInTheDocument();
    });

    it("handles no sort when sortDisabled is true", () => {
      const customColumns = [
        ...columns,
        { label: "NoSort", renderValue: (item) => item.name, sortDisabled: true },
      ];
      const { queryByText } = setup({ ...defaultProps, columns: customColumns });
      const noSortHeader = queryByText("NoSort");
      expect(noSortHeader).not.toHaveAttribute("role", "button");
    });
  });
});
