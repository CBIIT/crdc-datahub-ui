import { FC } from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';
import { axe } from 'jest-axe';
import { render, waitFor } from '@testing-library/react';
import DataContent from './DataContent';
import { mockEnqueue } from '../../setupTests';
import { GET_SUBMISSION_NODES, GetSubmissionNodesResp } from '../../graphql';

type ParentProps = {
  mocks?: MockedResponse[];
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({ mocks, children } : ParentProps) => (
  <MockedProvider mocks={mocks} showWarnings>
    {children}
  </MockedProvider>
);

describe("DataContent > General", () => {
  const baseSubmissionStatistic: SubmissionStatistic = {
    nodeName: '',
    total: 0,
    new: 0,
    passed: 0,
    warning: 0,
    error: 0
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should not have any high level accessibility violations", async () => {
    const { container } = render(
      <TestParent mocks={[]}>
        <DataContent submissionId="example-sub-id" statistics={[]} />
      </TestParent>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it("should show an error message when no submission ID is provided", async () => {
    render(
      <TestParent mocks={[]}>
        <DataContent submissionId={undefined} statistics={[]} />
      </TestParent>
    );

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith("Cannot fetch results. Submission ID is invalid or missing.", { variant: "error" });
    });
  });

  it("should show an error message when the nodes cannot be fetched (network)", async () => {
    const submissionID = "example-sub-id-1";

    const mocks: MockedResponse<GetSubmissionNodesResp>[] = [{
      request: {
        query: GET_SUBMISSION_NODES,
        variables: {
          _id: submissionID,
          sortDirection: "desc",
          first: 20,
          offset: 0,
          nodeTypes: ["example-node"],
        },
      },
      error: new Error('Simulated network error'),
    }];

    const stats: SubmissionStatistic[] = [{ ...baseSubmissionStatistic, nodeName: "example-node", total: 1 }];

    render(
      <TestParent mocks={mocks}>
        <DataContent submissionId={submissionID} statistics={stats} />
      </TestParent>
    );

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith("Unable to retrieve node data.", { variant: "error" });
    });
  });

  it("should show an error message when the nodes cannot be fetched (GraphQL)", async () => {
    const submissionID = "example-sub-id-2";

    const mocks: MockedResponse<GetSubmissionNodesResp>[] = [{
      request: {
        query: GET_SUBMISSION_NODES,
        variables: {
          _id: submissionID,
          sortDirection: "desc",
          first: 20,
          offset: 0,
          nodeTypes: ["example-node"],
        },
      },
      result: {
        errors: [new GraphQLError('Simulated GraphQL error')],
      },
    }];

    const stats: SubmissionStatistic[] = [{ ...baseSubmissionStatistic, nodeName: "example-node", total: 1 }];

    render(
      <TestParent mocks={mocks}>
        <DataContent submissionId={submissionID} statistics={stats} />
      </TestParent>
    );

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith("Unable to retrieve node data.", { variant: "error" });
    });
  });
});

describe("DataContent > Table", () => {
  const baseSubmissionStatistic: SubmissionStatistic = {
    nodeName: '',
    total: 0,
    new: 0,
    passed: 0,
    warning: 0,
    error: 0
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render the placeholder text when no data is available", async () => {
    const submissionID = "example-placeholder-test-id";

    const mocks: MockedResponse<GetSubmissionNodesResp>[] = [{
      request: {
        query: GET_SUBMISSION_NODES,
        variables: {
          _id: submissionID,
          sortDirection: "desc",
          first: 20,
          offset: 0,
          nodeTypes: ["example-node"],
        },
      },
      result: {
        data: {
          getSubmissionNodes: {
            total: 0,
            properties: [],
            nodes: [],
          },
        },
      },
    }];

    const stats: SubmissionStatistic[] = [{ ...baseSubmissionStatistic, nodeName: "example-node", total: 1 }];

    const { getByText } = render(
      <TestParent mocks={mocks}>
        <DataContent submissionId={submissionID} statistics={stats} />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByText("No existing data was found")).toBeInTheDocument();
    });
  });

  it("should render dynamic columns based on the selected node properties", async () => {
    const submissionID = "example-dynamic-columns-id";

    const mocks: MockedResponse<GetSubmissionNodesResp>[] = [{
      request: {
        query: GET_SUBMISSION_NODES,
        variables: {
          _id: submissionID,
          sortDirection: "desc",
          first: 20,
          offset: 0,
          nodeTypes: ["example-node"],
        },
      },
      result: {
        data: {
          getSubmissionNodes: {
            total: 2,
            properties: ["col.1", "col.2", "col.3"],
            nodes: [
              {
                nodeType: "example-node",
                nodeID: "example-node-id",
                props: JSON.stringify({ "col.1": "value-1", "col.2": "value-2", "col.3": "value-3" }),
              },
            ],
          },
        },
      },
    }];

    const stats: SubmissionStatistic[] = [{ ...baseSubmissionStatistic, nodeName: "example-node", total: 1 }];

    const { getByTestId } = render(
      <TestParent mocks={mocks}>
        <DataContent submissionId={submissionID} statistics={stats} />
      </TestParent>
    );

    await waitFor(() => {
      expect(getByTestId("generic-table-header-col.1")).toBeInTheDocument();
      expect(getByTestId("generic-table-header-col.2")).toBeInTheDocument();
      expect(getByTestId("generic-table-header-col.3")).toBeInTheDocument();
    });
  });

  // NOTE: We're asserting that the columns ARE built using getSubmissionNodes.properties
  // instead of the keys of nodes.[x].props JSON object
  it("should NOT build the columns based off of the nodes.[X].props JSON object", async () => {
    const submissionID = "example-using-properties-dynamic-columns-id";

    const mocks: MockedResponse<GetSubmissionNodesResp>[] = [{
      request: {
        query: GET_SUBMISSION_NODES,
        variables: {
          _id: submissionID,
          sortDirection: "desc",
          first: 20,
          offset: 0,
          nodeTypes: ["example-node"],
        },
      },
      result: {
        data: {
          getSubmissionNodes: {
            total: 2,
            properties: ["good-col-1", "good-col-2"],
            nodes: [
              {
                nodeType: "example-node",
                nodeID: "example-node-id",
                props: JSON.stringify({ "good-col-1": "ok", "good-col-2": "ok", "bad-column": "bad" }),
              },
            ],
          },
        },
      },
    }];

    const stats: SubmissionStatistic[] = [{ ...baseSubmissionStatistic, nodeName: "example-node", total: 1 }];

    const { getByTestId } = render(
      <TestParent mocks={mocks}>
        <DataContent submissionId={submissionID} statistics={stats} />
      </TestParent>
    );

    await waitFor(() => {
      expect(() => getByTestId("generic-table-header-bad-column")).toThrow();
    });
  });

  it("should have a default pagination count of 25 rows per page", async () => {
    const submissionID = "example-pagination-default-test-id";

    const mocks: MockedResponse<GetSubmissionNodesResp>[] = [{
      request: {
        query: GET_SUBMISSION_NODES,
        variables: {
          _id: submissionID,
          sortDirection: "desc",
          first: 20,
          offset: 0,
          nodeTypes: ["example-node"],
        },
      },
      result: {
        data: {
          getSubmissionNodes: {
            total: 0,
            properties: [],
            nodes: [],
          },
        },
      },
    }];

    const stats: SubmissionStatistic[] = [{ ...baseSubmissionStatistic, nodeName: "example-node", total: 1 }];

    const { getByTestId } = render(
      <TestParent mocks={mocks}>
        <DataContent submissionId={submissionID} statistics={stats} />
      </TestParent>
    );

    await waitFor(() => {
      // TODO: this matches current requirements but it should be 20
      // if the reqs of 25 is correct, need to update the test queries above
      expect(getByTestId("generic-table-rows-per-page")).toHaveValue("25");
    });
  });
});
