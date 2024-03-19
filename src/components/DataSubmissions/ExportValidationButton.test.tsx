import 'jest-axe/extend-expect';
import '@testing-library/jest-dom';

import { FC } from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';
import { axe } from 'jest-axe';
import { ExportValidationButton } from './ExportValidationButton';
import { SUBMISSION_QC_RESULTS, SubmissionQCResultsResp } from '../../graphql';

type ParentProps = {
  mocks?: MockedResponse[];
  children: React.ReactNode;
};

// NOTE: Need to migrate to setupTests.ts to avoid duplication
const mockEnqueue = jest.fn();
jest.mock('notistack', () => ({
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueue
  })
}));

const TestParent: FC<ParentProps> = ({ mocks, children } : ParentProps) => (
  <MockedProvider mocks={mocks} showWarnings>
    {children}
  </MockedProvider>
);

describe('ExportValidationButton cases', () => {
  const baseQCResult: Omit<QCResult, "submissionID"> = {
    batchID: "",
    type: '',
    validationType: 'metadata',
    severity: "Error",
    displayID: 0,
    submittedID: '',
    uploadedDate: '',
    validatedDate: '',
    errors: [],
    warnings: [],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not have accessibility violations', async () => {
    const { container } = render(
      <TestParent mocks={[]}>
        <ExportValidationButton submissionId="example-sub-id" fields={{}} />
      </TestParent>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('should render without crashing', () => {
    const { getByText } = render(
      <TestParent mocks={[]}>
        <ExportValidationButton submissionId="example-sub-id" fields={{}} />
      </TestParent>
    );

    expect(getByText('Download QC Results')).toBeInTheDocument();
  });

  it('should execute the SUBMISSION_QC_RESULTS query onClick', async () => {
    const submissionID = "example-sub-id";

    const mocks: MockedResponse<SubmissionQCResultsResp>[] = [{
      request: {
        query: SUBMISSION_QC_RESULTS,
        variables: {
          id: submissionID,
          sortDirection: "asc",
          orderBy: "displayID",
          first: 10000, // TODO: change to -1
          offset: 0,
        },
      },
      result: {
        data: {
          submissionQCResults: {
            total: 1,
            results: [{
              ...baseQCResult,
              submissionID
            }]
          },
        },
      },
    }];

    const { getByText } = render(
      <TestParent mocks={mocks}>
        <ExportValidationButton submissionId={submissionID} fields={{}} />
      </TestParent>
    );

    act(() => {
      fireEvent.click(getByText('Download QC Results'));
    });
  });

  it('should handle network errors when fetching the QC Results without crashing', async () => {
    const submissionID = "random-010101-sub-id";

    const mocks: MockedResponse<SubmissionQCResultsResp>[] = [{
      request: {
        query: SUBMISSION_QC_RESULTS,
        variables: {
          id: submissionID,
          sortDirection: "asc",
          orderBy: "displayID",
          first: 10000, // TODO: change to -1
          offset: 0,
        },
      },
      error: new Error('Simulated network error'),
    }];

    const { getByText } = render(
      <TestParent mocks={mocks}>
        <ExportValidationButton submissionId={submissionID} fields={{}} />
      </TestParent>
    );

    act(() => {
      fireEvent.click(getByText('Download QC Results'));
    });

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith("Unable to retrieve submission quality control results.", { variant: "error" });
    });
  });

  it('should handle GraphQL errors when fetching the QC Results without crashing', async () => {
    const submissionID = "example-GraphQL-level-errors-id";

    const mocks: MockedResponse<SubmissionQCResultsResp>[] = [{
      request: {
        query: SUBMISSION_QC_RESULTS,
        variables: {
          id: submissionID,
          sortDirection: "asc",
          orderBy: "displayID",
          first: 10000, // TODO: change to -1
          offset: 0,
        },
      },
      result: {
        errors: [new GraphQLError('Simulated GraphQL error')],
      },
    }];

    const { getByText } = render(
      <TestParent mocks={mocks}>
        <ExportValidationButton submissionId={submissionID} fields={{}} />
      </TestParent>
    );

    act(() => {
      fireEvent.click(getByText('Download QC Results'));
    });

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith("Unable to retrieve submission quality control results.", { variant: "error" });
    });
  });

  it('should handle invalid datasets without crashing', async () => {
    const submissionID = "example-dataset-level-errors-id";

    const mocks: MockedResponse<SubmissionQCResultsResp>[] = [{
      request: {
        query: SUBMISSION_QC_RESULTS,
        variables: {
          id: submissionID,
          sortDirection: "asc",
          orderBy: "displayID",
          first: 10000, // TODO: change to -1
          offset: 0,
        },
      },
      result: {
        data: {
          submissionQCResults: {
            total: 1,
            results: [
              { notReal: "true", } as unknown as QCResult,
              { badData: "agreed", } as unknown as QCResult,
              { 1: null, } as unknown as QCResult,
            ]
          },
        },
      },
    }];

    const { getByText } = render(
      <TestParent mocks={mocks}>
        <ExportValidationButton submissionId={submissionID} fields={{}} />
      </TestParent>
    );

    act(() => {
      fireEvent.click(getByText('Download QC Results'));
    });

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith("Unable to export validation results.", { variant: "error" });
    });
  });
});
