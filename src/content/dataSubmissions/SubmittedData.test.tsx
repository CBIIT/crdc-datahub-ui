import { FC } from "react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import { MemoryRouter } from "react-router-dom";
import { axe } from "jest-axe";
import { render, waitFor } from "@testing-library/react";
import SubmittedData from "./SubmittedData";
import { GET_SUBMISSION_NODES, SUBMISSION_STATS } from "../../graphql";
import { SearchParamsProvider } from "../../components/Contexts/SearchParamsContext";

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

describe("SubmittedData > General", () => {
  const baseSubmissionStatistic: SubmissionStatistic = {
    nodeName: "",
    total: 0,
    new: 0,
    passed: 0,
    warning: 0,
    error: 0,
  };

  const mockSubmissionQuery = {
    request: {
      query: SUBMISSION_STATS,
    },
    variableMatcher: () => true,
    result: {
      data: {
        submissionStats: {
          stats: [{ ...baseSubmissionStatistic, nodeName: "example-node", total: 1 }],
        },
      },
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should not have any high level accessibility violations", async () => {
    const { container } = render(
      <TestParent mocks={[]}>
        <SubmittedData submissionId={undefined} submissionName={undefined} />
      </TestParent>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it("should show an error message when no submission ID is provided", async () => {
    render(
      <TestParent mocks={[]}>
        <SubmittedData submissionId={undefined} submissionName={undefined} />
      </TestParent>
    );

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Cannot fetch results. Submission ID is invalid or missing.",
        {
          variant: "error",
        }
      );
    });
  });

  it("should show an error message when the nodes cannot be fetched (network)", async () => {
    const submissionID = "example-sub-id-1";

    const mocks: MockedResponse[] = [
      mockSubmissionQuery,
      {
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        error: new Error("Simulated network error"),
      },
    ];

    render(
      <TestParent mocks={mocks}>
        <SubmittedData submissionId={submissionID} submissionName={undefined} />
      </TestParent>
    );

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("Unable to retrieve node data.", {
        variant: "error",
      });
    });
  });

  it("should show an error message when the nodes cannot be fetched (GraphQL)", async () => {
    const submissionID = "example-sub-id-2";

    const mocks: MockedResponse[] = [
      mockSubmissionQuery,
      {
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        result: {
          errors: [new GraphQLError("Simulated GraphQL error")],
        },
      },
    ];

    render(
      <TestParent mocks={mocks}>
        <SubmittedData submissionId={submissionID} submissionName={undefined} />
      </TestParent>
    );

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("Unable to retrieve node data.", {
        variant: "error",
      });
    });
  });
});

describe("SubmittedData > Table", () => {
  const baseSubmissionStatistic: SubmissionStatistic = {
    nodeName: "",
    total: 0,
    new: 0,
    passed: 0,
    warning: 0,
    error: 0,
  };

  const mockSubmissionQuery = {
    request: {
      query: SUBMISSION_STATS,
    },
    variableMatcher: () => true,
    result: {
      data: {
        submissionStats: {
          stats: [{ ...baseSubmissionStatistic, nodeName: "example-node", total: 1 }],
        },
      },
    },
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the placeholder text when no data is available", async () => {
    const submissionID = "example-placeholder-test-id";

    const mocks: MockedResponse[] = [
      mockSubmissionQuery,
      {
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmissionNodes: {
              total: 0,
              properties: [],
              nodes: [],
            },
          },
        },
      },
    ];

    const { getByText } = render(
      <TestParent mocks={mocks}>
        <SubmittedData submissionId={submissionID} submissionName={undefined} />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByText("No existing data was found")).toBeInTheDocument();
    });
  });

  it("should render dynamic columns based on the selected node properties", async () => {
    const submissionID = "example-dynamic-columns-id";

    const mocks: MockedResponse[] = [
      mockSubmissionQuery,
      {
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmissionNodes: {
              total: 1,
              properties: ["col.1", "col.2", "col.3"],
              nodes: [
                {
                  nodeType: "example-node",
                  nodeID: "example-node-id",
                  props: JSON.stringify({
                    "col.1": "value-1",
                    "col.2": "value-2",
                    "col.3": "value-3",
                  }),
                  status: "New",
                },
              ],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks}>
        <SubmittedData submissionId={submissionID} submissionName={undefined} />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("generic-table-header-col.1")).toBeInTheDocument();
    });

    expect(getByTestId("generic-table-header-col.2")).toBeInTheDocument();
    expect(getByTestId("generic-table-header-col.3")).toBeInTheDocument();
  });

  it("should append the 'Status' column to any node type", async () => {
    const submissionID = "example-status-column-id";

    const mocks: MockedResponse[] = [
      mockSubmissionQuery,
      {
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmissionNodes: {
              total: 2,
              properties: ["col-xyz"],
              nodes: [
                {
                  nodeType: "example-node",
                  nodeID: "example-node-id",
                  props: JSON.stringify({
                    "col-xyz": "value-1",
                  }),
                  status: "New",
                },
                {
                  nodeType: "example-node",
                  nodeID: "example-node-id2",
                  props: JSON.stringify({
                    "col-xyz": "value-2",
                  }),
                  status: null,
                },
              ],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks}>
        <SubmittedData submissionId={submissionID} submissionName={undefined} />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("generic-table-header-Status")).toBeInTheDocument();
    });
  });

  it.todo("should append an interactive Checkbox column to the table");

  it.todo("should select all rows when the 'Select All' checkbox is clicked");

  it.todo("should handle failure to query for all nodes when 'Select All' is clicked");

  it.todo("should delete all selected rows when the 'Delete' button is clicked");

  it.todo("should use the proper pluralization for the delete dialog content button");

  it.todo("should deselect all rows when any filter changes");

  // NOTE: We're asserting that the columns ARE built using getSubmissionNodes.properties
  // instead of the keys of nodes.[x].props JSON object
  it("should NOT build the columns based off of the nodes.[X].props JSON object", async () => {
    const submissionID = "example-using-properties-dynamic-columns-id";

    const mocks: MockedResponse[] = [
      mockSubmissionQuery,
      {
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmissionNodes: {
              total: 2,
              properties: ["good-col-1", "good-col-2"],
              nodes: [
                {
                  nodeType: "example-node",
                  nodeID: "example-node-id",
                  props: JSON.stringify({
                    "good-col-1": "ok",
                    "good-col-2": "ok",
                    "bad-column": "bad",
                  }),
                },
              ],
            },
          },
        },
      },
    ];

    const { getByTestId, getByText } = render(
      <TestParent mocks={mocks}>
        <SubmittedData submissionId={submissionID} submissionName={undefined} />
      </TestParent>
    );

    await waitFor(() => {
      expect(() => getByTestId("generic-table-header-bad-column")).toThrow();
      expect(() => getByText("bad-column")).toThrow();
    });
  });

  it("should have a default pagination count of 20 rows per page", async () => {
    const submissionID = "example-pagination-default-test-id";

    const mocks: MockedResponse[] = [
      mockSubmissionQuery,
      {
        request: {
          query: GET_SUBMISSION_NODES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmissionNodes: {
              total: 0,
              properties: [],
              nodes: [],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={mocks}>
        <SubmittedData submissionId={submissionID} submissionName={undefined} />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("generic-table-rows-per-page-top")).toHaveValue("20");
      expect(getByTestId("generic-table-rows-per-page-bottom")).toHaveValue("20");
    });
  });
});
