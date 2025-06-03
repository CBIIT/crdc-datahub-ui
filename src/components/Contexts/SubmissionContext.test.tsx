import { FC } from "react";
import { act, render, renderHook, waitFor } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import { SubmissionCtxStatus, SubmissionProvider, useSubmissionContext } from "./SubmissionContext";
import {
  GET_SUBMISSION,
  GetSubmissionInput,
  GetSubmissionResp,
  SUBMISSION_QC_RESULTS,
  SubmissionQCResultsResp,
} from "../../graphql";

const mockStartPolling = vi.fn();
const mockStopPolling = vi.fn();
vi.mock("@apollo/client", async () => {
  const originalModule = await vi.importActual<typeof import("@apollo/client")>("@apollo/client");

  return {
    ...originalModule,
    useQuery: (...args: Parameters<typeof originalModule.useQuery>) => ({
      ...originalModule.useQuery(...args),
      startPolling: mockStartPolling,
      stopPolling: mockStopPolling,
    }),
  };
});

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
  studyName: "",
  dbGaPID: "",
  bucketName: "",
  rootPath: "",
  status: "New",
  metadataValidationStatus: "New",
  fileValidationStatus: "New",
  crossSubmissionStatus: "New",
  archived: false,
  validationStarted: "",
  validationEnded: "",
  validationScope: "New",
  validationType: [],
  deletingData: false,
  fileErrors: [],
  history: [],
  conciergeName: "",
  conciergeEmail: "",
  intention: "New/Update",
  dataType: "Metadata Only",
  otherSubmissions: "",
  nodeCount: 0,
  createdAt: "",
  updatedAt: "",
  studyID: "",
  collaborators: [],
  dataFileSize: null,
};

const TestChild: FC = () => {
  const { status } = useSubmissionContext();

  return <div data-testid="ctx-status">{status}</div>;
};

type TestParentProps = {
  _id?: string;
  mocks?: MockedResponse[];
  children?: React.ReactNode;
};

const TestParent: FC<TestParentProps> = ({ mocks = [], _id = "", children }: TestParentProps) => (
  <MockedProvider mocks={mocks}>
    <SubmissionProvider _id={_id}>{children ?? <TestChild />}</SubmissionProvider>
  </MockedProvider>
);

describe("useSubmissionContext", () => {
  it("should throw an exception when used outside of a SubmissionProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestChild />)).toThrow(
      "useSubmissionContext cannot be used outside of the SubmissionProvider component"
    );
    vi.spyOn(console, "error").mockRestore();
  });

  it("should render nominally when used inside a SubmissionProvider", () => {
    const mocks: MockedResponse<GetSubmissionResp, GetSubmissionInput>[] = [
      {
        request: {
          query: GET_SUBMISSION,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmission: null,
            submissionStats: null,
            batchStatusList: null,
          },
        },
      },
    ];

    const qcMocks: MockedResponse<SubmissionQCResultsResp<true>>[] = [
      {
        request: {
          query: SUBMISSION_QC_RESULTS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            submissionQCResults: null,
          },
        },
      },
    ];

    expect(() =>
      render(<TestParent mocks={[...mocks, ...qcMocks]} _id="test-nominal-id" />)
    ).not.toThrow();
  });
});

describe("SubmissionProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle API network errors without crashing", async () => {
    const mocks: MockedResponse<GetSubmissionResp, GetSubmissionInput>[] = [
      {
        request: {
          query: GET_SUBMISSION,
        },
        variableMatcher: () => true,
        error: new Error("Network error"),
      },
    ];
    const qcMocks: MockedResponse<SubmissionQCResultsResp<true>>[] = [
      {
        request: {
          query: SUBMISSION_QC_RESULTS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            submissionQCResults: null,
          },
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={[...mocks, ...qcMocks]} _id="test-network-error-id" />
    );

    await waitFor(() => expect(getByTestId("ctx-status")).toHaveTextContent("ERROR"));
  });

  it("should handle API GraphQL errors gracefully", async () => {
    const mocks: MockedResponse<GetSubmissionResp, GetSubmissionInput>[] = [
      {
        request: {
          query: GET_SUBMISSION,
        },
        variableMatcher: () => true,
        result: {
          errors: [new GraphQLError("GraphQL error")],
        },
      },
    ];
    const qcMocks: MockedResponse<SubmissionQCResultsResp<true>>[] = [
      {
        request: {
          query: SUBMISSION_QC_RESULTS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            submissionQCResults: null,
          },
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={[...mocks, ...qcMocks]} _id="test-graphql-error-id" />
    );

    await waitFor(() => expect(getByTestId("ctx-status")).toHaveTextContent("ERROR"));
  });

  it("should render without crashing > null", async () => {
    const mocks: MockedResponse<GetSubmissionResp, GetSubmissionInput>[] = [
      {
        request: {
          query: GET_SUBMISSION,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmission: null,
            submissionStats: null,
            batchStatusList: null,
          },
        },
      },
    ];
    const qcMocks: MockedResponse<SubmissionQCResultsResp<true>>[] = [
      {
        request: {
          query: SUBMISSION_QC_RESULTS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            submissionQCResults: null,
          },
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={[...mocks, ...qcMocks]} _id="test-null-id" />
    );

    await waitFor(() => expect(getByTestId("ctx-status")).toHaveTextContent("ERROR"));
  });

  it("should render without crashing with valid data", async () => {
    const mocks: MockedResponse<GetSubmissionResp, GetSubmissionInput>[] = [
      {
        request: {
          query: GET_SUBMISSION,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmission: {
              ...baseSubmission,
              _id: "test-valid-id",
            },
            submissionStats: {
              stats: [],
            },
            batchStatusList: {
              batches: [],
            },
          },
        },
      },
    ];
    const qcMocks: MockedResponse<SubmissionQCResultsResp<true>>[] = [
      {
        request: {
          query: SUBMISSION_QC_RESULTS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            submissionQCResults: {
              total: 0,
              results: [],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(
      <TestParent mocks={[...mocks, ...qcMocks]} _id="test-valid-id" />
    );

    await waitFor(() => expect(getByTestId("ctx-status")).toHaveTextContent("LOADED"));
  });

  it.each<keyof Submission>([
    "metadataValidationStatus",
    "fileValidationStatus",
    "crossSubmissionStatus",
  ])("should start polling if '%s' is in a validating state", async (key) => {
    const mocks: MockedResponse<GetSubmissionResp, GetSubmissionInput>[] = [
      {
        maxUsageCount: 1,
        request: {
          query: GET_SUBMISSION,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmission: {
              ...baseSubmission,
              _id: "test-validating-id",
              [key]: "Validating",
            },
            submissionStats: {
              stats: [],
            },
            batchStatusList: {
              batches: [],
            },
          },
        },
      },
    ];
    const qcMocks: MockedResponse<SubmissionQCResultsResp<true>>[] = [
      {
        request: {
          query: SUBMISSION_QC_RESULTS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            submissionQCResults: {
              total: 0,
              results: [],
            },
          },
        },
      },
    ];

    render(<TestParent mocks={[...mocks, ...qcMocks]} _id="test-validating-id" />);

    // Should poll getSubmission + submissionQCResults
    await waitFor(() => expect(mockStartPolling).toHaveBeenCalledTimes(2));
    expect(mockStopPolling).not.toHaveBeenCalled();
  });

  it.each<keyof Submission>([
    "metadataValidationStatus",
    "fileValidationStatus",
    "crossSubmissionStatus",
  ])("should stop polling if '%s' is not in a validating state", async (key) => {
    const mocks: MockedResponse<GetSubmissionResp, GetSubmissionInput>[] = [
      {
        maxUsageCount: 1,
        request: {
          query: GET_SUBMISSION,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmission: {
              ...baseSubmission,
              _id: "test-validating-id",
              [key]: "Passed",
            },
            submissionStats: {
              stats: [],
            },
            batchStatusList: {
              batches: [],
            },
          },
        },
      },
    ];
    const qcMocks: MockedResponse<SubmissionQCResultsResp<true>>[] = [
      {
        request: {
          query: SUBMISSION_QC_RESULTS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            submissionQCResults: {
              total: 0,
              results: [],
            },
          },
        },
      },
    ];

    render(<TestParent mocks={[...mocks, ...qcMocks]} _id="test-validating-id" />);

    // Should stop polling getSubmission + submissionQCResults
    await waitFor(() => expect(mockStopPolling).toHaveBeenCalledTimes(2));
    expect(mockStartPolling).not.toHaveBeenCalled();
  });

  it("should start polling if there are uploading batches", async () => {
    const mocks: MockedResponse<GetSubmissionResp, GetSubmissionInput>[] = [
      {
        maxUsageCount: 1,
        request: {
          query: GET_SUBMISSION,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmission: {
              ...baseSubmission,
              _id: "test-uploading-id",
            },
            submissionStats: {
              stats: [],
            },
            batchStatusList: {
              batches: [
                {
                  _id: "batch-0001",
                  status: "Uploading",
                },
              ],
            },
          },
        },
      },
    ];
    const qcMocks: MockedResponse<SubmissionQCResultsResp<true>>[] = [
      {
        request: {
          query: SUBMISSION_QC_RESULTS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            submissionQCResults: {
              total: 0,
              results: [],
            },
          },
        },
      },
    ];

    render(<TestParent mocks={[...mocks, ...qcMocks]} _id="test-uploading-id" />);

    // Should poll getSubmission + submissionQCResults
    await waitFor(() => expect(mockStartPolling).toHaveBeenCalledTimes(2));
    expect(mockStopPolling).not.toHaveBeenCalled();
  });

  it("should stop polling if there are no uploading batches", async () => {
    const mocks: MockedResponse<GetSubmissionResp, GetSubmissionInput>[] = [
      {
        maxUsageCount: 1,
        request: {
          query: GET_SUBMISSION,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmission: {
              ...baseSubmission,
              _id: "test-uploading-id",
            },
            submissionStats: {
              stats: [],
            },
            batchStatusList: {
              batches: [
                {
                  _id: "batch-0001",
                  status: "Uploaded",
                },
              ],
            },
          },
        },
      },
    ];
    const qcMocks: MockedResponse<SubmissionQCResultsResp<true>>[] = [
      {
        request: {
          query: SUBMISSION_QC_RESULTS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            submissionQCResults: {
              total: 0,
              results: [],
            },
          },
        },
      },
    ];

    // Should stop polling getSubmission + submissionQCResults
    render(<TestParent mocks={[...mocks, ...qcMocks]} _id="test-uploading-id" />);

    await waitFor(() => expect(mockStopPolling).toHaveBeenCalledTimes(2));
    expect(mockStartPolling).not.toHaveBeenCalled();
  });

  it("should start polling if there is an ongoing deletion", async () => {
    const mocks: MockedResponse<GetSubmissionResp, GetSubmissionInput>[] = [
      {
        maxUsageCount: 1,
        request: {
          query: GET_SUBMISSION,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmission: {
              ...baseSubmission,
              _id: "test-deleting-id",
              deletingData: true,
            },
            submissionStats: {
              stats: [],
            },
            batchStatusList: {
              batches: [],
            },
          },
        },
      },
    ];
    const qcMocks: MockedResponse<SubmissionQCResultsResp<true>>[] = [
      {
        request: {
          query: SUBMISSION_QC_RESULTS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            submissionQCResults: {
              total: 0,
              results: [],
            },
          },
        },
      },
    ];

    render(<TestParent mocks={[...mocks, ...qcMocks]} _id="test-deleting-id" />);

    // Should poll getSubmission + submissionQCResults
    await waitFor(() => expect(mockStartPolling).toHaveBeenCalledTimes(2));
    expect(mockStopPolling).not.toHaveBeenCalled();
  });

  it("should stop polling if there is no ongoing deletion", async () => {
    const mocks: MockedResponse<GetSubmissionResp, GetSubmissionInput>[] = [
      {
        maxUsageCount: 1,
        request: {
          query: GET_SUBMISSION,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmission: {
              ...baseSubmission,
              _id: "test-deleting-id",
              deletingData: false,
            },
            submissionStats: {
              stats: [],
            },
            batchStatusList: {
              batches: [],
            },
          },
        },
      },
    ];
    const qcMocks: MockedResponse<SubmissionQCResultsResp<true>>[] = [
      {
        request: {
          query: SUBMISSION_QC_RESULTS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            submissionQCResults: {
              total: 0,
              results: [],
            },
          },
        },
      },
    ];

    render(<TestParent mocks={[...mocks, ...qcMocks]} _id="test-deleting-id" />);

    // Should stop polling getSubmission + submissionQCResults
    await waitFor(() => expect(mockStopPolling).toHaveBeenCalledTimes(2));
    expect(mockStartPolling).not.toHaveBeenCalled();
  });

  it("should use the polling wrapper functions to start and stop polling", async () => {
    const mocks: MockedResponse<GetSubmissionResp, GetSubmissionInput>[] = [
      {
        request: {
          query: GET_SUBMISSION,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmission: {
              ...baseSubmission,
              _id: "test-wrapper-id",
            },
            submissionStats: {
              stats: [],
            },
            batchStatusList: {
              batches: [
                {
                  _id: "batch-0001",
                  status: "Uploaded",
                },
              ],
            },
          },
        },
      },
    ];
    const qcMocks: MockedResponse<SubmissionQCResultsResp<true>>[] = [
      {
        request: {
          query: SUBMISSION_QC_RESULTS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            submissionQCResults: {
              total: 0,
              results: [],
            },
          },
        },
      },
    ];

    const { result } = renderHook(() => useSubmissionContext(), {
      wrapper: ({ children }) => (
        <TestParent mocks={[...mocks, ...qcMocks]} _id="test-wrapper-id">
          {children}
        </TestParent>
      ),
    });

    await waitFor(() => expect(result.current.status).toBe(SubmissionCtxStatus.LOADED));

    const { startPolling, stopPolling } = result.current;

    act(() => {
      startPolling(1000);
    });

    await waitFor(() => expect(mockStartPolling).toHaveBeenCalledTimes(2));
    expect(mockStartPolling).toHaveBeenCalledWith(1000);

    act(() => {
      stopPolling();
    });

    expect(mockStopPolling).toHaveBeenCalled();
  });

  it("should set the status to POLLING when polling is active", async () => {
    const mocks: MockedResponse<GetSubmissionResp, GetSubmissionInput>[] = [
      {
        request: {
          query: GET_SUBMISSION,
        },
        variableMatcher: () => true,
        result: {
          data: {
            getSubmission: {
              ...baseSubmission,
              _id: "test-polling-id",
            },
            submissionStats: {
              stats: [],
            },
            batchStatusList: {
              batches: [],
            },
          },
        },
      },
    ];
    const qcMocks: MockedResponse<SubmissionQCResultsResp<true>>[] = [
      {
        request: {
          query: SUBMISSION_QC_RESULTS,
        },
        variableMatcher: () => true,
        result: {
          data: {
            submissionQCResults: {
              total: 0,
              results: [],
            },
          },
        },
      },
    ];

    const { result } = renderHook(() => useSubmissionContext(), {
      wrapper: ({ children }) => (
        <TestParent mocks={[...mocks, ...qcMocks]} _id="test-polling-id">
          {children}
        </TestParent>
      ),
    });

    await waitFor(() => expect(result.current.status).toBe(SubmissionCtxStatus.LOADED));

    act(() => {
      result.current.startPolling(1000);
    });

    await waitFor(() => expect(result.current.status).toBe(SubmissionCtxStatus.POLLING));
  });
});
