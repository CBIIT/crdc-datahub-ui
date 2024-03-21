import { FC } from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { GraphQLError } from 'graphql';
import { axe } from 'jest-axe';
import { ExportValidationButton } from './ExportValidationButton';
import { SUBMISSION_QC_RESULTS, SubmissionQCResultsResp } from '../../graphql';
import { mockEnqueue } from '../../setupTests';

type ParentProps = {
  mocks?: MockedResponse[];
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({ mocks, children } : ParentProps) => (
  <MockedProvider mocks={mocks} showWarnings>
    {children}
  </MockedProvider>
);

describe('ExportValidationButton cases', () => {
  const baseSubmission: Submission = {
    _id: '',
    name: '',
    submitterID: '',
    submitterName: '',
    organization: null,
    dataCommons: '',
    modelVersion: '',
    studyAbbreviation: '',
    dbGaPID: '',
    bucketName: '',
    rootPath: '',
    status: 'New',
    metadataValidationStatus: 'Error',
    fileValidationStatus: 'Error',
    fileErrors: [],
    history: [],
    conciergeName: '',
    conciergeEmail: '',
    createdAt: '',
    updatedAt: ''
  };

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
        <ExportValidationButton submission={{ ...baseSubmission, _id: "example-sub-id" }} fields={{}} />
      </TestParent>
    );

    expect(await axe(container)).toHaveNoViolations();
  });

  it('should render without crashing', () => {
    const { getByText } = render(
      <TestParent mocks={[]}>
        <ExportValidationButton submission={{ ...baseSubmission, _id: "test-rendering-id" }} fields={{}} />
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
            results: [{ ...baseQCResult, submissionID }]
          },
        },
      },
    }];

    const { getByText } = render(
      <TestParent mocks={mocks}>
        <ExportValidationButton submission={{ ...baseSubmission, _id: submissionID }} fields={{}} />
      </TestParent>
    );

    act(() => {
      fireEvent.click(getByText('Download QC Results'));
    });
  });

  it.each<Submission>([
    { ...baseSubmission, _id: "example-sub-id" },
    { ...baseSubmission, _id: "example-sub-id-2" },
    { ...baseSubmission, _id: "example-sub-id-3" },
  ])("should name the export file as [TODO]", async (submission) => {
  // TODO: Implement per requirements
    expect(false).toBeTruthy();
  });

  it('should alert the user if there are no QC Results to export', async () => {
    const submissionID = "example-no-results-to-export-id";

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
            total: 0,
            results: []
          },
        },
      },
    }];

    const { getByText } = render(
      <TestParent mocks={mocks}>
        <ExportValidationButton submission={{ ...baseSubmission, _id: submissionID }} fields={{}} />
      </TestParent>
    );

    act(() => {
      fireEvent.click(getByText('Download QC Results'));
    });

    await waitFor(() => {
      expect(mockEnqueue).toHaveBeenCalledWith("There are no validation results to export.", { variant: "error" });
    });
  });

  it('should call the field value callback function for each field', async () => {
    const submissionID = "formatter-callback-sub-id";

    const qcErrors = [
      { title: "Error 01", description: "Error 01 description" },
      { title: "Error 02", description: "Error 02 description" },
    ];
    const qcWarnings = [
      { title: "Warning 01", description: "Warning 01 description" },
      { title: "Warning 02", description: "Warning 02 description" },
    ];

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
            total: 3,
            results: [
              { ...baseQCResult, errors: qcErrors, warnings: qcWarnings, submissionID, displayID: 1 },
              { ...baseQCResult, errors: qcErrors, warnings: qcWarnings, submissionID, displayID: 2 },
              { ...baseQCResult, errors: qcErrors, warnings: qcWarnings, submissionID, displayID: 3 },
            ]
          },
        },
      },
    }];

    const fields = {
      DisplayID: jest.fn().mockImplementation((result: QCResult) => result.displayID),
      ValidationType: jest.fn().mockImplementation((result: QCResult) => result.validationType),
      // Testing the fallback of falsy values
      NullValueField: jest.fn().mockImplementation(() => null),
    };

    const { getByText } = render(
      <TestParent mocks={mocks}>
        <ExportValidationButton submission={{ ...baseSubmission, _id: submissionID }} fields={fields} />
      </TestParent>
    );

    act(() => {
      fireEvent.click(getByText('Download QC Results'));
    });

    await waitFor(() => {
      // NOTE: The results are unpacked, 3 QCResults with 2 errors and 2 warnings each = 12 calls
      expect(fields.DisplayID).toHaveBeenCalledTimes(12);
      expect(fields.ValidationType).toHaveBeenCalledTimes(12);
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
        <ExportValidationButton submission={{ ...baseSubmission, _id: submissionID }} fields={{}} />
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
        <ExportValidationButton submission={{ ...baseSubmission, _id: submissionID }} fields={{}} />
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
        <ExportValidationButton submission={{ ...baseSubmission, _id: submissionID }} fields={{}} />
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
