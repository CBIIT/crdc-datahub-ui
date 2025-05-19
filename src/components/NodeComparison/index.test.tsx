import { act, render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { FC } from "react";
import { GraphQLError } from "graphql";
import {
  RETRIEVE_RELEASED_DATA,
  RetrieveReleasedDataInput,
  RetrieveReleasedDataResp,
} from "../../graphql";
import NodeComparison from "./index";

const mockTableRender = jest.fn().mockImplementation(() => <div>MOCK COMPARISON TABLE</div>);
jest.mock("./ComparisonTable", () => ({
  __esModule: true,
  default: (...p) => mockTableRender(...p),
}));

type MockParentProps = {
  mocks?: MockedResponse[];
  children: React.ReactNode;
};

const MockParent: FC<MockParentProps> = ({ mocks, children }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    {children}
  </MockedProvider>
);

describe("Accessibility", () => {
  it("should have no violations", async () => {
    const mock: MockedResponse<RetrieveReleasedDataResp, RetrieveReleasedDataInput> = {
      request: {
        query: RETRIEVE_RELEASED_DATA,
      },
      variableMatcher: () => true,
      result: {
        data: {
          retrieveReleasedDataByID: [],
        },
      },
    };

    const { container } = render(<NodeComparison submissionID="" nodeType="" submittedID="" />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    await act(async () => {
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});

describe("Basic Functionality", () => {
  it("should show an error message when nodes cannot be fetch (Network)", async () => {
    const mock: MockedResponse<RetrieveReleasedDataResp, RetrieveReleasedDataInput> = {
      request: {
        query: RETRIEVE_RELEASED_DATA,
      },
      variableMatcher: () => true,
      error: new Error("GraphQL error"),
    };

    render(<NodeComparison submissionID="" nodeType="" submittedID="" />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Oops! Unable to retrieve the data record comparison",
        { variant: "error" }
      );
    });
  });

  it("should show an error message when nodes cannot be fetch (GraphQL)", async () => {
    const mock: MockedResponse<RetrieveReleasedDataResp, RetrieveReleasedDataInput> = {
      request: {
        query: RETRIEVE_RELEASED_DATA,
      },
      variableMatcher: () => true,
      result: {
        errors: [new GraphQLError("GraphQL mock error")],
      },
    };

    render(<NodeComparison submissionID="" nodeType="" submittedID="" />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Oops! Unable to retrieve the data record comparison",
        { variant: "error" }
      );
    });
  });

  it("should forward the node data to the ComparisonTable", async () => {
    const mock: MockedResponse<RetrieveReleasedDataResp, RetrieveReleasedDataInput> = {
      request: {
        query: RETRIEVE_RELEASED_DATA,
      },
      variableMatcher: () => true,
      result: {
        data: {
          retrieveReleasedDataByID: [
            {
              nodeType: "mock_node_type",
              nodeID: "mock_node_id",
              props: JSON.stringify({ mock_node_data_name: "foo", baz: 1 }),
            },
            {
              nodeType: "mock_node_type",
              nodeID: "mock_node_id",
              props: JSON.stringify({ mock_node_data_name: "bar", baz: 2 }),
            },
          ],
        },
      },
    };

    render(<NodeComparison submissionID="" nodeType="" submittedID="" />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    await waitFor(() => {
      // Calls twice because of the loading state
      expect(mockTableRender).toHaveBeenCalledWith(
        expect.objectContaining({
          newNode: expect.objectContaining({
            nodeType: "mock_node_type",
            nodeID: "mock_node_id",
            props: JSON.stringify({ mock_node_data_name: "foo", baz: 1 }),
          }),
          existingNode: expect.objectContaining({
            nodeType: "mock_node_type",
            nodeID: "mock_node_id",
            props: JSON.stringify({ mock_node_data_name: "bar", baz: 2 }),
          }),
          loading: false,
        }),
        {}
      );
    });
  });

  it("should forward null, null to the ComparisonTable if the API returns a non-nominal array length (1)", async () => {
    const mock: MockedResponse<RetrieveReleasedDataResp, RetrieveReleasedDataInput> = {
      request: {
        query: RETRIEVE_RELEASED_DATA,
      },
      variableMatcher: () => true,
      result: {
        data: {
          retrieveReleasedDataByID: [
            {
              nodeType: "mock_node_type",
              nodeID: "mock_node_id",
              props: JSON.stringify({ mock_node_data_name: "foo", baz: 1 }),
            },
          ],
        },
      },
    };

    render(<NodeComparison submissionID="" nodeType="" submittedID="" />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    await waitFor(() => {
      expect(mockTableRender).toHaveBeenCalledWith(
        expect.objectContaining({
          newNode: null,
          existingNode: null,
          loading: false,
        }),
        {}
      );
    });
  });

  it("should forward null, null to the ComparisonTable if the API returns a non-nominal array length (3)", async () => {
    const mock: MockedResponse<RetrieveReleasedDataResp, RetrieveReleasedDataInput> = {
      request: {
        query: RETRIEVE_RELEASED_DATA,
      },
      variableMatcher: () => true,
      result: {
        data: {
          retrieveReleasedDataByID: [
            {
              nodeType: "mock_node_type",
              nodeID: "mock_node_id",
              props: JSON.stringify({ mock_node_data_name: "foo", baz: 1 }),
            },
            {
              nodeType: "mock_node_type",
              nodeID: "mock_node_id",
              props: JSON.stringify({ mock_node_data_name: "foo", baz: 1 }),
            },
            {
              nodeType: "mock_node_type",
              nodeID: "mock_node_id",
              props: JSON.stringify({ mock_node_data_name: "foo", baz: 1 }),
            },
          ],
        },
      },
    };

    render(<NodeComparison submissionID="" nodeType="" submittedID="" />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    await waitFor(() => {
      expect(mockTableRender).toHaveBeenCalledWith(
        expect.objectContaining({
          newNode: null,
          existingNode: null,
          loading: false,
        }),
        {}
      );
    });
  });
});

describe("Implementation Requirements", () => {
  it("should have a header describing the comparison", () => {
    const mock: MockedResponse<RetrieveReleasedDataResp, RetrieveReleasedDataInput> = {
      request: {
        query: RETRIEVE_RELEASED_DATA,
      },
      variableMatcher: () => true,
      result: {
        data: {
          retrieveReleasedDataByID: [],
        },
      },
    };

    const { getByTestId } = render(<NodeComparison submissionID="" nodeType="" submittedID="" />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    expect(getByTestId("node-comparison-header")).toBeInTheDocument();
    expect(getByTestId("node-comparison-header")).toHaveTextContent(
      /A record with this ID already exists. Review the existing and newly submitted data to decide whether to update the current record./
    );
  });

  it.todo("should have a footer describing special values");
});

describe("Snapshots", () => {
  it("should match the nominal state snapshot", async () => {
    const mockMatcher = jest.fn().mockReturnValue(true);
    const mock: MockedResponse<RetrieveReleasedDataResp, RetrieveReleasedDataInput> = {
      request: {
        query: RETRIEVE_RELEASED_DATA,
      },
      variableMatcher: mockMatcher,
      result: {
        data: {
          retrieveReleasedDataByID: [],
        },
      },
    };

    const { container } = render(<NodeComparison submissionID="" nodeType="" submittedID="" />, {
      wrapper: ({ children }) => <MockParent mocks={[mock]}>{children}</MockParent>,
    });

    await waitFor(() => {
      expect(mockMatcher).toHaveBeenCalled(); // wait for the state to normalize
    });

    expect(container).toMatchSnapshot();
  });
});
