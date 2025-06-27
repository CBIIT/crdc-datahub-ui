import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import userEvent from "@testing-library/user-event";
import { GraphQLError } from "graphql";
import { axe } from "vitest-axe";

import {
  LIST_RELEASED_DATA_RECORDS,
  ListReleasedDataRecordsInput,
  ListReleasedDataRecordsResponse,
} from "../../graphql";
import { render, waitFor } from "../../test-utils";

import DataExplorerExportButton, { DataExplorerExportButtonProps } from "./index";

const mockDownloadBlob = vi.fn();
vi.mock("../../utils", async () => ({
  ...(await vi.importActual("../../utils")),
  downloadBlob: (...args) => mockDownloadBlob(...args),
}));

type MockParentProps = {
  mocks?: MockedResponse[];
  children: React.ReactNode;
};

const MockParent: React.FC<MockParentProps> = ({ mocks = [], children }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    {children}
  </MockedProvider>
);

const BaseProps: DataExplorerExportButtonProps = {
  studyId: "mock-study-id",
  studyDisplayName: "Mock Study",
  nodeType: "participant",
  dataCommonsDisplayName: "MOCK-DC",
  columns: [],
};

describe("Accessibility", () => {
  it("should have no accessibility violations", async () => {
    const { container, getByTestId } = render(<DataExplorerExportButton {...BaseProps} />, {
      wrapper: MockParent,
    });

    expect(getByTestId("data-explorer-export-button")).toBeEnabled(); // Sanity check

    expect(await axe(container)).toHaveNoViolations();
  });

  it("should have no accessibility violations when disabled", async () => {
    const { container, getByTestId } = render(
      <DataExplorerExportButton {...BaseProps} disabled />,
      {
        wrapper: MockParent,
      }
    );

    expect(getByTestId("data-explorer-export-button")).toBeDisabled(); // Sanity check

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  it("should render without crashing", () => {
    expect(() =>
      render(<DataExplorerExportButton {...BaseProps} />, { wrapper: MockParent })
    ).not.toThrow();
  });

  it("should notify the user when starting the download", async () => {
    const mock: MockedResponse<ListReleasedDataRecordsResponse, ListReleasedDataRecordsInput> = {
      request: {
        query: LIST_RELEASED_DATA_RECORDS,
      },
      variableMatcher: () => true,
      result: {
        data: {
          listReleasedDataRecords: null, // This never resolves anyway
        },
      },
    };

    const { getByTestId } = render(<DataExplorerExportButton {...BaseProps} />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    userEvent.click(getByTestId("data-explorer-export-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Downloading the requested metadata file. This may take a moment...",
        {
          variant: "default",
        }
      );
    });
  });

  it("should gracefully handle API errors (GraphQL)", async () => {
    const mock: MockedResponse<ListReleasedDataRecordsResponse, ListReleasedDataRecordsInput> = {
      request: {
        query: LIST_RELEASED_DATA_RECORDS,
      },
      variableMatcher: () => true,
      result: {
        errors: [new GraphQLError("Mock error")],
      },
    };

    const { getByTestId } = render(<DataExplorerExportButton {...BaseProps} />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    userEvent.click(getByTestId("data-explorer-export-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Failed to generate the TSV for the selected node.",
        {
          variant: "error",
        }
      );
    });

    await waitFor(() => {
      expect(getByTestId("data-explorer-export-button")).toBeEnabled();
    });

    expect(mockDownloadBlob).not.toHaveBeenCalled();
  });

  it("should gracefully handle API errors (Network)", async () => {
    const mock: MockedResponse<ListReleasedDataRecordsResponse, ListReleasedDataRecordsInput> = {
      request: {
        query: LIST_RELEASED_DATA_RECORDS,
      },
      variableMatcher: () => true,
      error: new Error("Network error"),
    };

    const { getByTestId } = render(<DataExplorerExportButton {...BaseProps} />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    userEvent.click(getByTestId("data-explorer-export-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Failed to generate the TSV for the selected node.",
        {
          variant: "error",
        }
      );
    });

    await waitFor(() => {
      expect(getByTestId("data-explorer-export-button")).toBeEnabled();
    });

    expect(mockDownloadBlob).not.toHaveBeenCalled();
  });

  it("should gracefully handle API errors (API)", async () => {
    const mock: MockedResponse<ListReleasedDataRecordsResponse, ListReleasedDataRecordsInput> = {
      request: {
        query: LIST_RELEASED_DATA_RECORDS,
      },
      variableMatcher: () => true,
      result: {
        data: {
          listReleasedDataRecords: null,
        },
      },
    };

    const { getByTestId } = render(<DataExplorerExportButton {...BaseProps} />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    userEvent.click(getByTestId("data-explorer-export-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Failed to generate the TSV for the selected node.",
        {
          variant: "error",
        }
      );
    });

    await waitFor(() => {
      expect(getByTestId("data-explorer-export-button")).toBeEnabled();
    });

    expect(mockDownloadBlob).not.toHaveBeenCalled();
  });

  it("should gracefully handle API errors (Empty response)", async () => {
    const mock: MockedResponse<ListReleasedDataRecordsResponse, ListReleasedDataRecordsInput> = {
      request: {
        query: LIST_RELEASED_DATA_RECORDS,
      },
      variableMatcher: () => true,
      result: {
        data: {
          listReleasedDataRecords: {
            total: 0,
            properties: [],
            nodes: [],
          },
        },
      },
    };

    const { getByTestId } = render(<DataExplorerExportButton {...BaseProps} />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    userEvent.click(getByTestId("data-explorer-export-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Failed to generate the TSV for the selected node.",
        {
          variant: "error",
        }
      );
    });

    await waitFor(() => {
      expect(getByTestId("data-explorer-export-button")).toBeEnabled();
    });

    expect(mockDownloadBlob).not.toHaveBeenCalled();
  });

  it("should group the API requests when there are more than 5000 records", async () => {
    const PAGE_SIZE = 5000; // Change this if the page size in the component changes

    const matcher1 = vi.fn().mockReturnValue(true);
    const matcher2 = vi.fn().mockReturnValue(true);
    const matcher3 = vi.fn().mockReturnValue(true);
    const mocks: MockedResponse<ListReleasedDataRecordsResponse, ListReleasedDataRecordsInput>[] = [
      {
        request: {
          query: LIST_RELEASED_DATA_RECORDS,
        },
        variableMatcher: matcher1,
        result: {
          data: {
            listReleasedDataRecords: {
              total: 14999,
              properties: ["some.property"],
              nodes: Array.from({ length: PAGE_SIZE }, (_, i) => ({
                "some.property": `value-${i + 1}`,
              })),
            },
          },
        },
      },
      {
        request: {
          query: LIST_RELEASED_DATA_RECORDS,
        },
        variableMatcher: matcher2,
        result: {
          data: {
            listReleasedDataRecords: {
              total: 14999,
              properties: ["some.property"],
              nodes: Array.from({ length: PAGE_SIZE }, (_, i) => ({
                "some.property": `value-${i + PAGE_SIZE + 1}`,
              })),
            },
          },
        },
      },
      {
        request: {
          query: LIST_RELEASED_DATA_RECORDS,
        },
        variableMatcher: matcher3,
        result: {
          data: {
            listReleasedDataRecords: {
              total: 14999,
              properties: ["some.property"],
              nodes: Array.from({ length: PAGE_SIZE - 1 }, (_, i) => ({
                "some.property": `value-${i + PAGE_SIZE * 2 + 1}`,
              })),
            },
          },
        },
      },
    ];

    const { getByTestId } = render(<DataExplorerExportButton {...BaseProps} />, {
      wrapper: ({ children }) => <MockParent mocks={mocks}>{children}</MockParent>,
    });

    userEvent.click(getByTestId("data-explorer-export-button"));

    await waitFor(() => {
      expect(mockDownloadBlob).toHaveBeenCalledOnce();
    });

    expect(matcher1).toHaveBeenCalledWith(
      expect.objectContaining({
        first: 5000,
        offset: 0,
      })
    );
    expect(matcher2).toHaveBeenCalledWith(
      expect.objectContaining({
        first: 5000,
        offset: 5000,
      })
    );
    expect(matcher3).toHaveBeenCalledWith(
      expect.objectContaining({
        first: 5000,
        offset: 10000,
      })
    );
  });

  it("should be disabled when `disabled` prop is true", () => {
    const { rerender, getByTestId } = render(<DataExplorerExportButton {...BaseProps} disabled />, {
      wrapper: MockParent,
    });

    expect(getByTestId("data-explorer-export-button")).toBeDisabled();

    rerender(
      <MockParent>
        <DataExplorerExportButton {...BaseProps} disabled={false} />
      </MockParent>
    );

    expect(getByTestId("data-explorer-export-button")).toBeEnabled();
  });

  it("should be disabled when downloading the data", async () => {
    vi.useFakeTimers();

    const mock: MockedResponse<ListReleasedDataRecordsResponse, ListReleasedDataRecordsInput> = {
      request: {
        query: LIST_RELEASED_DATA_RECORDS,
      },
      variableMatcher: () => true,
      result: {
        data: {
          listReleasedDataRecords: null, // This never resolves anyway
        },
      },
      delay: 1000,
    };

    const { getByTestId } = render(<DataExplorerExportButton {...BaseProps} />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    expect(getByTestId("data-explorer-export-button")).toBeEnabled(); // Sanity check

    userEvent.click(getByTestId("data-explorer-export-button"));

    await waitFor(() => {
      expect(getByTestId("data-explorer-export-button")).toBeDisabled();
    });

    vi.useRealTimers();
  });
});

describe("Implementation Requirements", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should have a tooltip on the button", async () => {
    const { getByTestId, findByRole } = render(<DataExplorerExportButton {...BaseProps} />, {
      wrapper: MockParent,
    });

    userEvent.hover(getByTestId("data-explorer-export-button"));

    const tooltip = await findByRole("tooltip");

    expect(tooltip).toHaveTextContent("Download displayed metadata in .tsv format");

    userEvent.unhover(tooltip);

    await waitFor(() => {
      expect(tooltip).not.toBeInTheDocument();
    });
  });

  it.each<
    { expected: string; date: Date } & Pick<
      DataExplorerExportButtonProps,
      "studyDisplayName" | "nodeType"
    >
  >([
    {
      date: new Date("2025-05-21T09:30:00z"),
      studyDisplayName: "CMB",
      nodeType: "Participant",
      expected: "CMB_Participant_20250521093000.tsv",
    },
    {
      date: new Date("2023-11-03T14:01:11z"),
      studyDisplayName: "SOME_MOCK_STUDY",
      nodeType: "RANDOM_node_TYPE",
      expected: "SOME_MOCK_STUDY_RANDOM_node_TYPE_20231103140111.tsv",
    },
    {
      date: new Date("2025-06-27T10:50:00z"),
      studyDisplayName: "",
      nodeType: "",
      expected: "__20250627105000.tsv",
    },
    {
      date: new Date("1998-12-30T23:59:59z"),
      studyDisplayName: "GC",
      nodeType: "datafile",
      expected: "GC_datafile_19981230235959.tsv",
    },
    {
      date: new Date("2030-01-01T01:00:00z"),
      studyDisplayName: "$PEC!@L_CHARS-",
      nodeType: "*@(@14938124817318(!)@(3",
      expected: "$PEC!@L_CHARS-_*@(@14938124817318(!)@(3_20300101010000.tsv",
    },
  ])(
    "should correctly name the exported TSV as $expected",
    async ({ expected, studyDisplayName, nodeType, date }) => {
      vi.useFakeTimers().setSystemTime(date);

      const mockColumns: DataExplorerExportButtonProps["columns"] = [
        { label: "id", field: "id", renderValue: () => null },
        { label: "foo", field: "foo", renderValue: () => null },
      ];

      const mock: MockedResponse<ListReleasedDataRecordsResponse, ListReleasedDataRecordsInput> = {
        request: {
          query: LIST_RELEASED_DATA_RECORDS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            listReleasedDataRecords: {
              total: 1,
              properties: ["id", "foo"],
              nodes: [{ id: "mock-id", foo: "bar" }],
            },
          },
        },
      };

      const { getByTestId } = render(
        <DataExplorerExportButton
          {...BaseProps}
          studyDisplayName={studyDisplayName}
          nodeType={nodeType}
          columns={mockColumns}
        />,
        {
          wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
        }
      );

      userEvent.click(getByTestId("data-explorer-export-button"));

      await waitFor(() => {
        expect(mockDownloadBlob).toHaveBeenCalledOnce();
      });

      expect(mockDownloadBlob).toHaveBeenCalledWith(
        expect.any(String),
        expected,
        expect.any(String)
      );

      vi.useRealTimers();
    }
  );

  // NOTE: This component utilizes the API to filter which columns we build the TSV with
  // We're just asserting that the component sends the correct list to the API
  it("should only request the visible columns in the API request", async () => {
    const mockColumns: DataExplorerExportButtonProps["columns"] = [
      { label: "visible_col01", field: "visible_col01", renderValue: () => null },
      { label: "visible_col02", field: "visible_col02", renderValue: () => null },
    ];

    const mockMatcher = vi.fn().mockReturnValue(true);
    const mock: MockedResponse<ListReleasedDataRecordsResponse, ListReleasedDataRecordsInput> = {
      request: {
        query: LIST_RELEASED_DATA_RECORDS,
      },
      variableMatcher: mockMatcher,
      result: {
        data: {
          listReleasedDataRecords: {
            total: 1,
            properties: ["mock_value"],
            nodes: [
              {
                mock_value: "mock_value",
              },
            ],
          },
        },
      },
    };

    const { getByTestId } = render(
      <DataExplorerExportButton {...BaseProps} columns={mockColumns} />,
      {
        wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
      }
    );

    userEvent.click(getByTestId("data-explorer-export-button"));

    await waitFor(() => {
      expect(mockMatcher).toHaveBeenCalledWith(
        expect.objectContaining({
          properties: ["visible_col01", "visible_col02"],
        })
      );
    });
  });
});

describe("Snapshots", () => {
  it("should match snapshot when enabled", () => {
    const { container } = render(<DataExplorerExportButton {...BaseProps} />, {
      wrapper: MockParent,
    });

    expect(container).toMatchSnapshot();
  });

  it("should match snapshot when disabled", () => {
    const { container } = render(<DataExplorerExportButton {...BaseProps} disabled />, {
      wrapper: MockParent,
    });

    expect(container).toMatchSnapshot();
  });

  it("should match snapshot when hovered", async () => {
    const { container, getByTestId, findByRole } = render(
      <DataExplorerExportButton {...BaseProps} />,
      {
        wrapper: MockParent,
      }
    );

    userEvent.hover(getByTestId("data-explorer-export-button"));

    await findByRole("tooltip");

    expect(container).toMatchSnapshot();
  });
});
