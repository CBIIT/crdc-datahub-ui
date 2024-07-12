import { FC } from "react";
import { act, render, renderHook, waitFor } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import { SubmissionCtxStatus, SubmissionProvider, useSubmissionContext } from "./SubmissionContext";
import { GET_SUBMISSION, GetSubmissionInput, GetSubmissionResp } from "../../graphql";

const mockStartPolling = jest.fn();
const mockStopPolling = jest.fn();
jest.mock("@apollo/client", () => {
  const originalModule = jest.requireActual("@apollo/client");

  return {
    ...originalModule,
    useQuery: (...args) => ({
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
  modelVersion: "",
  studyAbbreviation: "",
  dbGaPID: "",
  bucketName: "",
  rootPath: "",
  status: "New",
  metadataValidationStatus: "New",
  fileValidationStatus: "New",
  crossSubmissionStatus: "New",
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
  createdAt: "",
  updatedAt: "",
  studyID: "",
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
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<TestChild />)).toThrow(
      "useSubmissionContext cannot be used outside of the SubmissionProvider component"
    );
    jest.spyOn(console, "error").mockRestore();
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
            listBatches: null,
          },
        },
      },
    ];

    expect(() => render(<TestParent mocks={mocks} _id="test-nominal-id" />)).not.toThrow();
  });
});

describe("SubmissionProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    const { getByTestId } = render(<TestParent mocks={mocks} _id="test-network-error-id" />);

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

    const { getByTestId } = render(<TestParent mocks={mocks} _id="test-graphql-error-id" />);

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
            listBatches: null,
          },
        },
      },
    ];

    const { getByTestId } = render(<TestParent mocks={mocks} _id="test-null-id" />);

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
            listBatches: {
              batches: [],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(<TestParent mocks={mocks} _id="test-valid-id" />);

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
            listBatches: {
              batches: [],
            },
          },
        },
      },
    ];

    render(<TestParent mocks={mocks} _id="test-validating-id" />);

    await waitFor(() => expect(mockStartPolling).toHaveBeenCalledTimes(1));
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
            listBatches: {
              batches: [],
            },
          },
        },
      },
    ];

    render(<TestParent mocks={mocks} _id="test-validating-id" />);

    await waitFor(() => expect(mockStopPolling).toHaveBeenCalledTimes(1));
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
            listBatches: {
              batches: [
                {
                  status: "Uploading",
                },
              ],
            },
          },
        },
      },
    ];

    render(<TestParent mocks={mocks} _id="test-uploading-id" />);

    await waitFor(() => expect(mockStartPolling).toHaveBeenCalledTimes(1));
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
            listBatches: {
              batches: [
                {
                  status: "Uploaded",
                },
              ],
            },
          },
        },
      },
    ];

    render(<TestParent mocks={mocks} _id="test-uploading-id" />);

    await waitFor(() => expect(mockStopPolling).toHaveBeenCalledTimes(1));
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
            listBatches: {
              batches: [],
            },
          },
        },
      },
    ];

    render(<TestParent mocks={mocks} _id="test-deleting-id" />);

    await waitFor(() => expect(mockStartPolling).toHaveBeenCalledTimes(1));
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
            listBatches: {
              batches: [],
            },
          },
        },
      },
    ];

    render(<TestParent mocks={mocks} _id="test-deleting-id" />);

    await waitFor(() => expect(mockStopPolling).toHaveBeenCalledTimes(1));
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
            listBatches: {
              batches: [
                {
                  status: "Uploaded",
                },
              ],
            },
          },
        },
      },
    ];

    const { result } = renderHook(() => useSubmissionContext(), {
      wrapper: ({ children }) => (
        <TestParent mocks={mocks} _id="test-wrapper-id">
          {children}
        </TestParent>
      ),
    });

    await waitFor(() => expect(result.current.status).toBe(SubmissionCtxStatus.LOADED));

    const { startPolling, stopPolling } = result.current;

    act(() => {
      startPolling(1000);
    });

    expect(mockStartPolling).toHaveBeenCalledWith(1000);
    expect(result.current.isPolling).toBe(true);

    act(() => {
      stopPolling();
    });

    expect(mockStopPolling).toHaveBeenCalled();
    expect(result.current.isPolling).toBe(false);
  });
});
