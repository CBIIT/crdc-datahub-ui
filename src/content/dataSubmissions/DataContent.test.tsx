import { FC } from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';
import { axe } from 'jest-axe';
import { render, waitFor } from '@testing-library/react';
import DataContent from './DataContent';
import { mockEnqueue } from '../../setupTests';
import { SUBMISSION_QC_RESULTS, SubmissionQCResultsResp } from '../../graphql';

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

    // TODO: Update to the real query
    const mocks: MockedResponse<SubmissionQCResultsResp>[] = [{
      request: {
        query: SUBMISSION_QC_RESULTS,
        variables: {
          id: submissionID,
          sortDirection: "desc",
          orderBy: "displayID",
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

    // TODO: Update to the real query
    const mocks: MockedResponse<SubmissionQCResultsResp>[] = [{
      request: {
        query: SUBMISSION_QC_RESULTS,
        variables: {
          id: submissionID,
          sortDirection: "desc",
          orderBy: "displayID",
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

    // TODO: Update to the real query
    const mocks: MockedResponse<SubmissionQCResultsResp>[] = [{
      request: {
        query: SUBMISSION_QC_RESULTS,
        variables: {
          id: submissionID,
          sortDirection: "desc",
          orderBy: "displayID",
          first: 20,
          offset: 0,
          nodeTypes: ["example-node"],
        },
      },
      result: {
        data: {
          submissionQCResults: {
            total: 0,
            results: [],
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

  it("should render dynamic columns based on the node type selected", async () => {
    fail("Not implemented");
  });

  it("should fetch the QC results when the component mounts", async () => {
    fail("Not implemented");
  });

  it("should have a default pagination count of 25 rows per page", async () => {
    fail("Not implemented");
  });

  // ... more tests ...?
});
