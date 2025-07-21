import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import userEvent from "@testing-library/user-event";
import { GraphQLError } from "graphql";
import { axe } from "vitest-axe";

import {
  GET_RELEASED_NODE_TYPES,
  GetReleasedNodeTypesInput,
  GetReleasedNodeTypesResp,
  LIST_RELEASED_DATA_RECORDS,
  ListReleasedDataRecordsInput,
  ListReleasedDataRecordsResponse,
  RETRIEVE_PROPS_FOR_NODE_TYPE,
  RetrievePropsForNodeTypeInput,
  RetrievePropsForNodeTypeResp,
} from "../../graphql";
import { render, waitFor } from "../../test-utils";

import DataExplorerExportAllButton, { DataExplorerExportAllButtonProps } from "./index";

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

const BaseProps: DataExplorerExportAllButtonProps = {
  studyId: "mock-study-id",
  studyAbbreviation: "CMB",
  dataCommonsDisplayName: "MOCK-DC",
};

const mockNodeTypesResponse: MockedResponse<GetReleasedNodeTypesResp, GetReleasedNodeTypesInput> = {
  request: {
    query: GET_RELEASED_NODE_TYPES,
    variables: {
      studyId: "mock-study-id",
      dataCommonsDisplayName: "MOCK-DC",
    },
  },
  result: {
    data: {
      getReleaseNodeTypes: {
        nodes: [
          { name: "participant", IDPropName: "participant_id", count: 10 },
          { name: "sample", IDPropName: "sample_id", count: 5 },
        ],
      },
    },
  },
};

const mockNodePropsResponse: MockedResponse<
  RetrievePropsForNodeTypeResp,
  RetrievePropsForNodeTypeInput
> = {
  request: {
    query: RETRIEVE_PROPS_FOR_NODE_TYPE,
    variables: {
      nodeType: "participant",
      studyId: "mock-study-id",
      dataCommonsDisplayName: "MOCK-DC",
    },
  },
  result: {
    data: {
      retrievePropsForNodeType: [
        { name: "participant_id", required: true, group: "model_defined" },
        { name: "age", required: false, group: "model_defined" },
      ],
    },
  },
};

const mockSamplePropsResponse: MockedResponse<
  RetrievePropsForNodeTypeResp,
  RetrievePropsForNodeTypeInput
> = {
  request: {
    query: RETRIEVE_PROPS_FOR_NODE_TYPE,
    variables: { nodeType: "sample", studyId: "mock-study-id", dataCommonsDisplayName: "MOCK-DC" },
  },
  result: {
    data: {
      retrievePropsForNodeType: [
        { name: "sample_id", required: true, group: "model_defined" },
        { name: "tissue_type", required: false, group: "model_defined" },
      ],
    },
  },
};

const mockDataResponse: MockedResponse<
  ListReleasedDataRecordsResponse,
  ListReleasedDataRecordsInput
> = {
  request: {
    query: LIST_RELEASED_DATA_RECORDS,
    variables: {
      studyId: "mock-study-id",
      nodeType: "participant",
      dataCommonsDisplayName: "MOCK-DC",
      properties: [],
      first: 5000,
      offset: 0,
    },
  },
  result: {
    data: {
      listReleasedDataRecords: {
        total: 2,
        nodes: [
          { participant_id: "P001", age: 25 },
          { participant_id: "P002", age: 30 },
        ],
      },
    },
  },
};

const mockSampleDataResponse: MockedResponse<
  ListReleasedDataRecordsResponse,
  ListReleasedDataRecordsInput
> = {
  request: {
    query: LIST_RELEASED_DATA_RECORDS,
    variables: {
      studyId: "mock-study-id",
      nodeType: "sample",
      dataCommonsDisplayName: "MOCK-DC",
      properties: [],
      first: 5000,
      offset: 0,
    },
  },
  result: {
    data: {
      listReleasedDataRecords: {
        total: 1,
        nodes: [{ sample_id: "S001", tissue_type: "tumor" }],
      },
    },
  },
};

describe("Accessibility", () => {
  beforeEach(() => {
    mockDownloadBlob.mockClear();
  });

  it("should have no accessibility violations", async () => {
    const { container, getByTestId } = render(<DataExplorerExportAllButton {...BaseProps} />, {
      wrapper: MockParent,
    });

    expect(getByTestId("data-explorer-export-all-button")).toBeEnabled(); // Sanity check

    expect(await axe(container)).toHaveNoViolations();
  });

  it("should have no accessibility violations (disabled)", async () => {
    const { container } = render(<DataExplorerExportAllButton {...BaseProps} disabled />, {
      wrapper: MockParent,
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("Basic Functionality", () => {
  beforeEach(() => {
    mockDownloadBlob.mockClear();
  });

  it("should render the export all button", () => {
    const { getByTestId } = render(<DataExplorerExportAllButton {...BaseProps} />, {
      wrapper: MockParent,
    });

    expect(getByTestId("data-explorer-export-all-button")).toBeInTheDocument();
    expect(getByTestId("data-explorer-export-all-tooltip")).toBeInTheDocument();
  });

  it("should show the correct tooltip text", async () => {
    const { getByTestId, findByRole } = render(<DataExplorerExportAllButton {...BaseProps} />, {
      wrapper: MockParent,
    });

    await userEvent.hover(getByTestId("data-explorer-export-all-button"));

    const tooltip = await findByRole("tooltip");
    expect(tooltip).toHaveTextContent("Download metadata for all node types with all properties");
  });

  it("should be disabled when the disabled prop is true", () => {
    const { getByTestId } = render(<DataExplorerExportAllButton {...BaseProps} disabled />, {
      wrapper: MockParent,
    });

    expect(getByTestId("data-explorer-export-all-button")).toBeDisabled();
  });

  it("should handle successful export of all node types", async () => {
    const mocks = [
      mockNodeTypesResponse,
      mockNodePropsResponse,
      mockSamplePropsResponse,
      mockDataResponse,
      mockSampleDataResponse,
    ];

    const { getByTestId } = render(<DataExplorerExportAllButton {...BaseProps} />, {
      wrapper: (props) => <MockParent {...props} mocks={mocks} />,
    });

    const button = getByTestId("data-explorer-export-all-button");

    await userEvent.click(button);

    await waitFor(() => {
      expect(mockDownloadBlob).toHaveBeenCalledTimes(1);
    });

    const [blob, filename, contentType] = mockDownloadBlob.mock.calls[0];
    expect(filename).toMatch(/CMB_AllNodes_\d{14}\.zip/);
    expect(contentType).toBe("application/zip");
    expect(blob).toBeInstanceOf(Blob);
  });

  it("should handle error when no node types are found", async () => {
    const errorMocks = [
      {
        request: {
          query: GET_RELEASED_NODE_TYPES,
          variables: {
            studyId: "mock-study-id",
            dataCommonsDisplayName: "MOCK-DC",
          },
        },
        result: {
          data: {
            getReleaseNodeTypes: {
              nodes: [],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(<DataExplorerExportAllButton {...BaseProps} />, {
      wrapper: (props) => <MockParent {...props} mocks={errorMocks} />,
    });

    const button = getByTestId("data-explorer-export-all-button");

    await userEvent.click(button);

    await waitFor(() => {
      expect(mockDownloadBlob).not.toHaveBeenCalled();
    });
  });

  it("should handle GraphQL errors gracefully", async () => {
    const errorMocks = [
      {
        request: {
          query: GET_RELEASED_NODE_TYPES,
          variables: {
            studyId: "mock-study-id",
            dataCommonsDisplayName: "MOCK-DC",
          },
        },
        error: new GraphQLError("Network error"),
      },
    ];

    const { getByTestId } = render(<DataExplorerExportAllButton {...BaseProps} />, {
      wrapper: (props) => <MockParent {...props} mocks={errorMocks} />,
    });

    const button = getByTestId("data-explorer-export-all-button");

    await userEvent.click(button);

    await waitFor(() => {
      expect(mockDownloadBlob).not.toHaveBeenCalled();
    });
  });
});

describe("Implementation Requirements", () => {
  beforeEach(() => {
    mockDownloadBlob.mockClear();
  });

  it("should disable the button while loading", async () => {
    const { getByTestId, rerender } = render(
      <DataExplorerExportAllButton {...BaseProps} disabled />,
      { wrapper: MockParent }
    );

    expect(getByTestId("data-explorer-export-all-button")).toBeDisabled();

    rerender(
      <MockParent>
        <DataExplorerExportAllButton {...BaseProps} disabled={false} />
      </MockParent>
    );

    expect(getByTestId("data-explorer-export-all-button")).toBeEnabled();
  });

  it("should pass through additional IconButton props", () => {
    const { container } = render(
      <DataExplorerExportAllButton {...BaseProps} data-custom-attr="test" />,
      { wrapper: MockParent }
    );

    expect(container.querySelector('[data-custom-attr="test"]')).toBeInTheDocument();
  });
});
