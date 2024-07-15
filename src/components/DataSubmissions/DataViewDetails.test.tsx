import { FC } from "react";
import { MemoryRouter } from "react-router-dom";
import { render, waitFor } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import DataViewDetails from "./DataViewDetails";
import { SearchParamsProvider } from "../Contexts/SearchParamsContext";
import { GET_NODE_DETAIL } from "../../graphql";

const mocks: MockedResponse[] = [
  {
    request: {
      query: GET_NODE_DETAIL,
      variables: {
        submissionID: "12345",
        nodeType: "Node1",
        nodeID: "ID1",
      },
    },
    result: {
      data: {
        getNodeDetail: {
          parents: [{ nodeType: "ParentType", total: 1 }],
          children: [{ nodeType: "ChildType", total: 2 }],
          IDPropName: "id",
        },
      },
    },
  },
];

type ParentProps = {
  mocks?: MockedResponse[];
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({ mocks, children }: ParentProps) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <MemoryRouter>
      <SearchParamsProvider>{children}</SearchParamsProvider>
    </MemoryRouter>
  </MockedProvider>
);

describe("DataViewDetails", () => {
  const props = {
    submissionID: "12345",
    nodeType: "Node1",
    nodeID: "ID1",
  };

  it("renders node details correctly", async () => {
    const { getByText } = render(
      <TestParent mocks={mocks}>
        <DataViewDetails {...props} />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByText(props.nodeID)).toBeInTheDocument();
      expect(getByText(props.nodeType)).toBeInTheDocument();
      expect(getByText("Node1")).toBeInTheDocument();
      expect(getByText("ParentType")).toBeInTheDocument();
      expect(getByText("ChildType")).toBeInTheDocument();
    });
  });

  it("displays loading state correctly", () => {
    const { getByLabelText } = render(
      <TestParent mocks={mocks}>
        <DataViewDetails {...props} />
      </TestParent>
    );
    expect(getByLabelText("Content Loader")).toBeInTheDocument();
  });

  it("handles errors in data fetching", async () => {
    const errorMocks = [
      {
        request: {
          query: GET_NODE_DETAIL,
          variables: {
            submissionID: "12345",
            nodeType: "Node1",
            nodeID: "ID1",
          },
        },
        error: new Error("An error occurred"),
      },
    ];

    render(
      <TestParent mocks={errorMocks}>
        <DataViewDetails {...props} />
      </TestParent>
    );

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("Unable to load node details.", {
        variant: "error",
      });
    });
  });

  it("renders multiple parents and children with capitalization and comma separation", async () => {
    const props = {
      submissionID: "12345",
      nodeType: "Node1",
      nodeID: "ID1",
    };

    const enhancedMocks = [
      {
        request: {
          query: GET_NODE_DETAIL,
          variables: props,
        },
        result: {
          data: {
            getNodeDetail: {
              parents: [
                { nodeType: "parentType", total: 1 },
                { nodeType: "anotherParent", total: 2 },
              ],
              children: [
                { nodeType: "childType", total: 2 },
                { nodeType: "anotherChild", total: 3 },
              ],
              IDPropName: "id",
            },
          },
        },
      },
    ];

    const { getByText } = render(
      <TestParent mocks={enhancedMocks}>
        <DataViewDetails {...props} />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByText("Parent(s)")).toBeInTheDocument();
      expect(getByText("ParentType, AnotherParent")).toBeInTheDocument();
      expect(getByText("Child(ren)")).toBeInTheDocument();
      expect(getByText("ChildType, AnotherChild")).toBeInTheDocument();
    });
  });

  it("handles no parents or children correctly", async () => {
    const props = {
      submissionID: "12345",
      nodeType: "Node1",
      nodeID: "ID1",
    };

    const emptyMocks = [
      {
        request: {
          query: GET_NODE_DETAIL,
          variables: props,
        },
        result: {
          data: {
            getNodeDetail: {
              parents: [],
              children: [],
              IDPropName: "id",
            },
          },
        },
      },
    ];

    const { queryByText } = render(
      <TestParent mocks={emptyMocks}>
        <DataViewDetails {...props} />
      </TestParent>
    );

    await waitFor(() => {
      expect(queryByText("ParentType")).not.toBeInTheDocument();
      expect(queryByText("ChildType")).not.toBeInTheDocument();
    });
  });
});
