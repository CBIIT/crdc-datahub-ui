import React, { FC } from "react";
import { MemoryRouter, MemoryRouterProps } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { render, waitFor, within } from "../../test-utils";
import DataExplorerFilters from "./index";
import { SearchParamsProvider, useSearchParamsContext } from "../Contexts/SearchParamsContext";

type ParentProps = {
  initialEntries?: MemoryRouterProps["initialEntries"];
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({ initialEntries = ["/"], children }: ParentProps) => (
  <MemoryRouter initialEntries={initialEntries}>
    <SearchParamsProvider>{children}</SearchParamsProvider>
  </MemoryRouter>
);

describe("Accessibility", () => {
  it("has no accessibility violations (populated)", async () => {
    const { container, getByTestId } = render(
      <DataExplorerFilters
        columns={[]}
        nodeTypes={["mock-node-type"]}
        defaultValues={{
          nodeType: "mock-node-type",
        }}
        columnVisibilityModel={{}}
        onColumnVisibilityModelChange={vi.fn()}
        onChange={vi.fn()}
      />,
      { wrapper: TestParent }
    );

    await waitFor(() => {
      expect(getByTestId("node-type-select")).toBeInTheDocument();
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no accessibility violations (empty)", async () => {
    const { container } = render(
      <DataExplorerFilters
        columns={[]}
        nodeTypes={[]}
        defaultValues={{
          nodeType: "",
        }}
        columnVisibilityModel={{}}
        onColumnVisibilityModelChange={vi.fn()}
        onChange={vi.fn()}
      />,
      { wrapper: TestParent }
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("renders without crashing", async () => {
    expect(() =>
      render(
        <TestParent>
          <DataExplorerFilters
            columns={[]}
            nodeTypes={["mock-node-type"]}
            defaultValues={{
              nodeType: "mock-node-type",
            }}
            columnVisibilityModel={{}}
            onColumnVisibilityModelChange={vi.fn()}
            onChange={vi.fn()}
          />
        </TestParent>
      )
    ).not.toThrow();
  });

  it("renders all input fields correctly", async () => {
    const { getByTestId } = render(
      <DataExplorerFilters
        columns={[]}
        nodeTypes={["node-123"]}
        defaultValues={{
          nodeType: "node-123",
        }}
        columnVisibilityModel={{}}
        onColumnVisibilityModelChange={vi.fn()}
        onChange={vi.fn()}
      />,
      { wrapper: TestParent }
    );

    await waitFor(() => {
      expect(getByTestId("node-type-select")).toBeInTheDocument();
    });

    expect(getByTestId("node-type-select-input")).toHaveValue("node-123");
  });

  it("resets all fields to their defaultValues when reset button is clicked", async () => {
    const mockOnChange = vi.fn();

    const { getByTestId, getByRole } = render(
      <DataExplorerFilters
        columns={[]}
        nodeTypes={["node-participant", "node-study"]}
        defaultValues={{
          nodeType: "node-participant",
        }}
        columnVisibilityModel={{}}
        onColumnVisibilityModelChange={vi.fn()}
        onChange={mockOnChange}
      />,
      { wrapper: TestParent }
    );

    const nodeTypeSelect = within(getByTestId("node-type-select")).getByRole("button");

    userEvent.click(nodeTypeSelect);

    const nodeTypeSelectList = within(getByRole("listbox", { hidden: true }));

    await waitFor(() => {
      expect(nodeTypeSelectList.getByTestId("node-type-option-node-study")).toBeVisible();
    });

    userEvent.click(nodeTypeSelectList.getByTestId("node-type-option-node-study"));

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          nodeType: "node-study",
        })
      );
    });

    userEvent.click(getByTestId("reset-filters-button"));

    await waitFor(() => {
      expect(getByTestId("node-type-select-input")).toHaveValue("node-participant");
    });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        nodeType: "node-participant",
      })
    );
  });

  it("resets the query string when reset button is clicked", async () => {
    const initialEntries = ["/?nodeType=node-study"];

    const CustomChild = () => {
      const { searchParams } = useSearchParamsContext();

      return (
        <div>
          <p data-testid="search-params-node-type">{searchParams.get("nodeType")}</p>
        </div>
      );
    };

    const CustomParent = ({ children }) => (
      <TestParent initialEntries={initialEntries}>
        <CustomChild />
        {children}
      </TestParent>
    );

    const { getByTestId } = render(
      <DataExplorerFilters
        columns={[]}
        nodeTypes={["node-participant", "node-study"]}
        defaultValues={{
          nodeType: "node-participant",
        }}
        columnVisibilityModel={{}}
        onColumnVisibilityModelChange={vi.fn()}
        onChange={vi.fn()}
      />,
      {
        wrapper: CustomParent,
      }
    );

    expect(getByTestId("search-params-node-type")).toHaveTextContent("node-study");

    userEvent.click(getByTestId("reset-filters-button"));

    await waitFor(() => {
      expect(getByTestId("node-type-select-input")).toHaveValue("node-participant");
    });

    expect(getByTestId("search-params-node-type")).toHaveTextContent(""); // Default value is not set in URL
  });

  it("should initialize the form fields based on searchParams", async () => {
    const initialEntries = ["/?nodeType=mock-node-from-url"];

    const mockOnChange = vi.fn();

    const { getByTestId } = render(
      <DataExplorerFilters
        columns={[]}
        nodeTypes={["node-participant", "node-study", "mock-node-from-url"]}
        defaultValues={{
          nodeType: "node-study",
        }}
        columnVisibilityModel={{}}
        onColumnVisibilityModelChange={vi.fn()}
        onChange={mockOnChange}
      />,
      {
        wrapper: ({ children }) => (
          <TestParent initialEntries={initialEntries}>{children}</TestParent>
        ),
      }
    );

    await waitFor(() => {
      expect(getByTestId("node-type-select-input")).toHaveValue("mock-node-from-url");
    });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        nodeType: "mock-node-from-url",
      })
    );
  });

  it("should ignore invalid form values provided in searchParams", async () => {
    const initialEntries = ["/?nodeType=fake-option"];

    const mockOnChange = vi.fn();

    const { getByTestId } = render(
      <DataExplorerFilters
        columns={[]}
        nodeTypes={["node-participant", "node-study"]}
        defaultValues={{
          nodeType: "node-study",
        }}
        columnVisibilityModel={{}}
        onColumnVisibilityModelChange={vi.fn()}
        onChange={mockOnChange}
      />,
      {
        wrapper: ({ children }) => (
          <TestParent initialEntries={initialEntries}>{children}</TestParent>
        ),
      }
    );

    await waitFor(() => {
      expect(getByTestId("node-type-select-input")).toHaveValue("node-study");
    });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        nodeType: "node-study",
      })
    );
  });

  it("initializes form fields to default when searchParams are empty", async () => {
    const initialEntries = ["/"];

    const mockOnChange = vi.fn();

    const { getByTestId } = render(
      <DataExplorerFilters
        columns={[]}
        nodeTypes={["node-participant", "node-study"]}
        defaultValues={{
          nodeType: "node-study",
        }}
        columnVisibilityModel={{}}
        onColumnVisibilityModelChange={vi.fn()}
        onChange={mockOnChange}
      />,
      {
        wrapper: ({ children }) => (
          <TestParent initialEntries={initialEntries}>{children}</TestParent>
        ),
      }
    );

    await waitFor(() => {
      expect(getByTestId("node-type-select-input")).toHaveValue("node-study");
    });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        nodeType: "node-study",
      })
    );
  });
});

describe.todo("Implementation Requirements");
