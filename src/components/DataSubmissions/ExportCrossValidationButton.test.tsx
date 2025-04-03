import { FC, useMemo } from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import { axe } from "jest-axe";
import { ExportCrossValidationButton } from "./ExportCrossValidationButton";
import {
  CrossValidationResultsInput,
  CrossValidationResultsResp,
  SUBMISSION_CROSS_VALIDATION_RESULTS,
} from "../../graphql";
import {
  SubmissionCtxState,
  SubmissionCtxStatus,
  SubmissionContext,
} from "../Contexts/SubmissionContext";

const baseSubmission: Submission = {
  _id: "",
  name: "",
  submitterID: "",
  submitterName: "",
  organization: null,
  dataCommons: "",
  dataCommonsDisplayName: "",
  modelVersion: "",
  studyAbbreviation: "",
  dbGaPID: "",
  bucketName: "",
  rootPath: "",
  fileErrors: [],
  history: [],
  otherSubmissions: null,
  conciergeName: "",
  conciergeEmail: "",
  createdAt: "",
  updatedAt: "",
  intention: "New/Update",
  dataType: "Metadata and Data Files",
  archived: false,
  validationStarted: "",
  validationEnded: "",
  validationScope: "New",
  validationType: ["metadata", "file"],
  status: "New",
  metadataValidationStatus: "New",
  fileValidationStatus: "New",
  crossSubmissionStatus: null,
  studyID: "",
  deletingData: false,
  nodeCount: 0,
  collaborators: [],
};

const baseCrossValidationResult: CrossValidationResult = {
  submissionID: "",
  type: "",
  validationType: "metadata",
  batchID: "",
  displayID: 0,
  submittedID: "",
  severity: "Error",
  uploadedDate: "",
  validatedDate: "",
  conflictingSubmission: "",
  errors: [],
  warnings: [],
};

type ParentProps = {
  submission?: Partial<Submission>;
  mocks?: MockedResponse[];
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({ submission = {}, mocks, children }: ParentProps) => {
  const ctxValue: SubmissionCtxState = useMemo<SubmissionCtxState>(
    () => ({
      status: SubmissionCtxStatus.LOADED,
      data: {
        getSubmission: {
          ...baseSubmission,
          ...submission,
        },
        batchStatusList: {
          batches: [],
        },
        submissionStats: { stats: [] },
      },
      error: null,
    }),
    [submission]
  );

  return (
    <MockedProvider mocks={mocks} showWarnings>
      <SubmissionContext.Provider value={ctxValue}>{children}</SubmissionContext.Provider>
    </MockedProvider>
  );
};

const mockDownloadBlob = jest.fn();
jest.mock("../../utils", () => ({
  ...jest.requireActual("../../utils"),
  downloadBlob: (...args) => mockDownloadBlob(...args),
}));

describe("ExportCrossValidationButton cases", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should not have accessibility violations", async () => {
    const { container, getByTestId } = render(<ExportCrossValidationButton fields={{}} />, {
      wrapper: ({ children }) => <TestParent mocks={[]}>{children}</TestParent>,
    });

    expect(getByTestId("export-cross-validation-button")).not.toBeDisabled(); // Sanity check
    expect(await axe(container)).toHaveNoViolations();
  });

  it("should not have accessibility violations (disabled)", async () => {
    const { container, getByTestId } = render(
      <ExportCrossValidationButton fields={{}} disabled />,
      {
        wrapper: ({ children }) => <TestParent mocks={[]}>{children}</TestParent>,
      }
    );

    expect(getByTestId("export-cross-validation-button")).toBeDisabled();
    expect(await axe(container)).toHaveNoViolations();
  });

  it("should have a tooltip present on the button", async () => {
    const { getByTestId, findByRole } = render(<ExportCrossValidationButton fields={{}} />, {
      wrapper: ({ children }) => <TestParent mocks={[]}>{children}</TestParent>,
    });

    userEvent.hover(getByTestId("export-cross-validation-button"));

    const tooltip = await findByRole("tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent("Export all cross validation issues to a CSV file");
  });

  it("should only execute the fetch query onClick", async () => {
    const mockMatcher = jest.fn().mockImplementation(() => true);
    const mock: MockedResponse<CrossValidationResultsResp, CrossValidationResultsInput> = {
      request: {
        query: SUBMISSION_CROSS_VALIDATION_RESULTS,
      },
      variableMatcher: mockMatcher,
      result: {
        data: {
          submissionCrossValidationResults: {
            total: 0,
            results: [],
          },
        },
      },
    };

    const { getByTestId } = render(<ExportCrossValidationButton fields={{}} />, {
      wrapper: ({ children }) => <TestParent mocks={[mock]}>{children}</TestParent>,
    });

    expect(mockMatcher).not.toHaveBeenCalled();

    userEvent.click(getByTestId("export-cross-validation-button"));

    await waitFor(() => {
      expect(mockMatcher).toHaveBeenCalledTimes(1);
    });
  });

  it.each<{ name: string; date: Date; expected: string }>([
    {
      name: "Example Submission",
      date: new Date("2021-01-19T14:54:01Z"),
      expected: "Example-Submission-cross-validation-results-2021-01-19.csv",
    },
    {
      name: "long name".repeat(100),
      date: new Date("2007-11-13T13:01:01Z"),
      expected: `${"long-name".repeat(100)}-cross-validation-results-2007-11-13.csv`,
    },
    {
      name: "",
      date: new Date("2019-01-13T01:12:00Z"),
      expected: "-cross-validation-results-2019-01-13.csv",
    },
    {
      name: "non $alpha name $@!819",
      date: new Date("2015-02-27T23:23:19Z"),
      expected: "non-alpha-name-819-cross-validation-results-2015-02-27.csv",
    },
    {
      name: "  ",
      date: new Date("2018-01-01T01:01:01Z"),
      expected: "-cross-validation-results-2018-01-01.csv",
    },
    {
      name: "_-'a-b+c=d",
      date: new Date("2031-07-04T18:22:15Z"),
      expected: "-a-bcd-cross-validation-results-2031-07-04.csv",
    },
    {
      name: "CRDCDH-1234",
      date: new Date("2023-05-22T07:02:01Z"),
      expected: "CRDCDH-1234-cross-validation-results-2023-05-22.csv",
    },
    {
      name: "SPACE-AT-END ",
      date: new Date("1999-03-13T04:04:03Z"),
      expected: "SPACE-AT-END-cross-validation-results-1999-03-13.csv",
    },
  ])(
    "should generate the correct filename for the submission using the name and current date",
    async ({ name, date, expected }) => {
      jest.useFakeTimers().setSystemTime(date);

      const mock: MockedResponse<CrossValidationResultsResp, CrossValidationResultsInput> = {
        request: {
          query: SUBMISSION_CROSS_VALIDATION_RESULTS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            submissionCrossValidationResults: {
              total: 1,
              results: [
                {
                  ...baseCrossValidationResult,
                },
              ],
            },
          },
        },
      };

      const fields = {
        ID: jest.fn().mockImplementation((result: QCResult) => result.submissionID),
      };

      const { getByTestId } = render(<ExportCrossValidationButton fields={fields} />, {
        wrapper: ({ children }) => (
          <TestParent mocks={[mock]} submission={{ ...baseSubmission, name }}>
            {children}
          </TestParent>
        ),
      });

      // NOTE: Using fireEvent instead of userEvent to avoid the tooltip and act warning
      fireEvent.click(getByTestId("export-cross-validation-button"));

      await waitFor(() => {
        expect(mockDownloadBlob).toHaveBeenCalledWith(
          expect.any(String),
          expected,
          expect.any(String)
        );
      });

      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    }
  );

  it("should alert the user if there are no results to export", async () => {
    const mock: MockedResponse<CrossValidationResultsResp, CrossValidationResultsInput> = {
      request: {
        query: SUBMISSION_CROSS_VALIDATION_RESULTS,
      },
      variableMatcher: () => true,
      result: {
        data: {
          submissionCrossValidationResults: {
            total: 0,
            results: [],
          },
        },
      },
    };

    const { getByTestId } = render(<ExportCrossValidationButton fields={{}} />, {
      wrapper: ({ children }) => <TestParent mocks={[mock]}>{children}</TestParent>,
    });

    fireEvent.click(getByTestId("export-cross-validation-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "There are no cross validation results to export.",
        {
          variant: "error",
        }
      );
    });
  });

  it("should call the field value callback function for each field", async () => {
    const submissionID = "formatter-callback-sub-id";

    const qcErrors = [
      { code: null, title: "Error 01", description: "Error 01 description" },
      { code: null, title: "Error 02", description: "Error 02 description" },
    ];
    const qcWarnings = [
      { code: null, title: "Warning 01", description: "Warning 01 description" },
      { code: null, title: "Warning 02", description: "Warning 02 description" },
    ];

    const mock: MockedResponse<CrossValidationResultsResp, CrossValidationResultsInput> = {
      request: {
        query: SUBMISSION_CROSS_VALIDATION_RESULTS,
      },
      variableMatcher: () => true,
      result: {
        data: {
          submissionCrossValidationResults: {
            total: 3,
            results: [
              {
                ...baseCrossValidationResult,
                errors: qcErrors,
                warnings: qcWarnings,
                submissionID,
                displayID: 1,
              },
              {
                ...baseCrossValidationResult,
                errors: qcErrors,
                warnings: qcWarnings,
                submissionID,
                displayID: 2,
              },
              {
                ...baseCrossValidationResult,
                errors: qcErrors,
                warnings: qcWarnings,
                submissionID,
                displayID: 3,
              },
            ],
          },
        },
      },
    };

    const fields = {
      DisplayID: jest.fn().mockImplementation((result: CrossValidationResult) => result.displayID),
      ValidationType: jest
        .fn()
        .mockImplementation((result: CrossValidationResult) => result.validationType),
      // Testing the fallback of falsy values
      NullValueField: jest.fn().mockImplementation(() => null),
    };

    const { getByTestId } = render(<ExportCrossValidationButton fields={fields} />, {
      wrapper: ({ children }) => <TestParent mocks={[mock]}>{children}</TestParent>,
    });

    fireEvent.click(getByTestId("export-cross-validation-button"));

    await waitFor(() => {
      // NOTE: The results are unpacked, 3 QCResults with 2 errors and 2 warnings each = 12 calls
      expect(fields.DisplayID).toHaveBeenCalledTimes(12);
      expect(fields.ValidationType).toHaveBeenCalledTimes(12);
    });
  });

  it("should handle network errors when fetching the data without crashing", async () => {
    const mock: MockedResponse<CrossValidationResultsResp, CrossValidationResultsInput> = {
      request: {
        query: SUBMISSION_CROSS_VALIDATION_RESULTS,
      },
      variableMatcher: () => true,
      error: new Error("Simulated network error"),
    };

    const { getByTestId } = render(<ExportCrossValidationButton fields={{}} />, {
      wrapper: ({ children }) => <TestParent mocks={[mock]}>{children}</TestParent>,
    });

    fireEvent.click(getByTestId("export-cross-validation-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Unable to retrieve cross validation results.",
        {
          variant: "error",
        }
      );
    });
  });

  it("should handle GraphQL errors when fetching the QC Results without crashing", async () => {
    const mock: MockedResponse<CrossValidationResultsResp, CrossValidationResultsInput> = {
      request: {
        query: SUBMISSION_CROSS_VALIDATION_RESULTS,
      },
      variableMatcher: () => true,
      result: {
        errors: [new GraphQLError("Simulated GraphQL error")],
      },
    };

    const { getByTestId } = render(<ExportCrossValidationButton fields={{}} />, {
      wrapper: ({ children }) => <TestParent mocks={[mock]}>{children}</TestParent>,
    });

    fireEvent.click(getByTestId("export-cross-validation-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        "Unable to retrieve cross validation results.",
        {
          variant: "error",
        }
      );
    });
  });

  it("should handle invalid datasets without crashing", async () => {
    const mock: MockedResponse<CrossValidationResultsResp, CrossValidationResultsInput> = {
      request: {
        query: SUBMISSION_CROSS_VALIDATION_RESULTS,
      },
      variableMatcher: () => true,
      result: {
        data: {
          submissionCrossValidationResults: {
            total: 3,
            results: [
              { notReal: "true" } as unknown as CrossValidationResult,
              { badData: "agreed" } as unknown as CrossValidationResult,
              { 1: null } as unknown as CrossValidationResult,
            ],
          },
        },
      },
    };

    const { getByTestId } = render(<ExportCrossValidationButton fields={{}} />, {
      wrapper: ({ children }) => <TestParent mocks={[mock]}>{children}</TestParent>,
    });

    fireEvent.click(getByTestId("export-cross-validation-button"));

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith(
        expect.stringContaining("Unable to export cross validation results. Error:"),
        {
          variant: "error",
        }
      );
    });
  });
});
