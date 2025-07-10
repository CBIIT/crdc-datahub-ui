import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import { GraphQLError } from "graphql";
import { FC } from "react";
import { MemoryRouter } from "react-router-dom";
import { axe } from "vitest-axe";

import { SearchParamsProvider } from "../../components/Contexts/SearchParamsContext";
import * as SubmissionCtx from "../../components/Contexts/SubmissionContext";
import { SubmissionCtxStatus } from "../../components/Contexts/SubmissionContext";
import { LIST_BATCHES, ListBatchesResp } from "../../graphql";
import { render, waitFor } from "../../test-utils";

import DataActivity from "./DataActivity";

// NOTE: We omit all properties that the component specifically depends on
const baseSubmission: Omit<Submission, "_id"> = {
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
  crossSubmissionStatus: null,
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
  studyID: "",
  deletingData: false,
  nodeCount: 0,
  collaborators: [],
  dataFileSize: null,
};

type ParentProps = {
  mocks?: MockedResponse[];
  children: React.ReactNode;
};

const TestParent: FC<ParentProps> = ({ mocks, children }: ParentProps) => (
  <MemoryRouter basename="">
    <MockedProvider mocks={mocks} showWarnings>
      <SearchParamsProvider>{children}</SearchParamsProvider>
    </MockedProvider>
  </MemoryRouter>
);

describe("General", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should not have any accessibility violations", async () => {
    vi.spyOn(SubmissionCtx, "useSubmissionContext").mockReturnValue({
      status: SubmissionCtxStatus.LOADING,
      data: {
        getSubmission: {
          _id: "",
          ...baseSubmission,
        },
        submissionStats: {
          stats: [],
        },
        getSubmissionAttributes: {
          submissionAttributes: {
            isBatchUploading: false,
            hasOrphanError: false,
          },
        },
      },
      error: null,
    });

    const mocks: MockedResponse<ListBatchesResp>[] = [
      {
        request: {
          query: LIST_BATCHES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            listBatches: {
              total: 0,
              batches: [],
            },
          },
        },
      },
    ];

    const { container } = render(<DataActivity ref={null} />, {
      wrapper: ({ children }) => <TestParent mocks={mocks}>{children}</TestParent>,
    });

    expect(await axe(container)).toHaveNoViolations();
  });

  it.todo("should refetch data when the submission ID changes");

  it("should show an error message when the batches cannot be fetched (network)", async () => {
    vi.spyOn(SubmissionCtx, "useSubmissionContext").mockReturnValue({
      status: SubmissionCtxStatus.LOADED,
      data: {
        getSubmission: {
          _id: "simulated-network-error",
          ...baseSubmission,
        },
        submissionStats: null,
        getSubmissionAttributes: null,
      },
      error: null,
      refetch: null,
    });

    const mocks: MockedResponse<ListBatchesResp>[] = [
      {
        request: {
          query: LIST_BATCHES,
        },
        variableMatcher: () => true,
        error: new Error("Simulated network error"),
      },
    ];

    render(<DataActivity />, {
      wrapper: ({ children }) => <TestParent mocks={mocks}>{children}</TestParent>,
    });

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("Unable to retrieve batch data.", {
        variant: "error",
      });
    });
  });

  it("should show an error message when the batches cannot be fetched (GraphQL)", async () => {
    vi.spyOn(SubmissionCtx, "useSubmissionContext").mockReturnValue({
      status: SubmissionCtxStatus.LOADED,
      data: {
        getSubmission: {
          _id: "simulated-graphql-error",
          ...baseSubmission,
        },
        submissionStats: null,
        getSubmissionAttributes: null,
      },
      error: null,
      refetch: null,
    });

    const mocks: MockedResponse<ListBatchesResp>[] = [
      {
        request: {
          query: LIST_BATCHES,
        },
        variableMatcher: () => true,
        result: {
          errors: [new GraphQLError("Simulated GraphQL error")],
        },
      },
    ];

    render(<DataActivity />, {
      wrapper: ({ children }) => <TestParent mocks={mocks}>{children}</TestParent>,
    });

    await waitFor(() => {
      expect(global.mockEnqueue).toHaveBeenCalledWith("Unable to retrieve batch data.", {
        variant: "error",
      });
    });
  });

  it("should not crash when no submission is available", async () => {
    vi.spyOn(SubmissionCtx, "useSubmissionContext").mockReturnValue({
      status: SubmissionCtxStatus.LOADED,
      data: null,
      error: null,
    });

    const { container } = render(<DataActivity />, {
      wrapper: ({ children }) => <TestParent>{children}</TestParent>,
    });

    expect(container).toBeInTheDocument();
  });
});

describe("Table", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the placeholder text when no data is available", async () => {
    vi.spyOn(SubmissionCtx, "useSubmissionContext").mockReturnValue({
      status: SubmissionCtxStatus.LOADED,
      data: {
        getSubmission: {
          _id: "",
          ...baseSubmission,
        },
        submissionStats: {
          stats: [],
        },
        getSubmissionAttributes: {
          submissionAttributes: {
            isBatchUploading: false,
            hasOrphanError: false,
          },
        },
      },
      error: null,
    });

    const mocks: MockedResponse<ListBatchesResp>[] = [
      {
        request: {
          query: LIST_BATCHES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            listBatches: {
              total: 0,
              batches: [],
            },
          },
        },
      },
    ];

    const { getByText } = render(<DataActivity ref={null} />, {
      wrapper: ({ children }) => <TestParent mocks={mocks}>{children}</TestParent>,
    });

    await waitFor(() => {
      expect(getByText(/No existing data was found/i)).toBeInTheDocument();
    });
  });

  it.todo("should have an interactive file count column");

  it.todo("should display an interactive upload errors column");

  it.todo("should use the correct pluralization for the error count of %p");

  it("should not refetch the submission if the submission is already polling", async () => {
    const mockRefetch = vi.fn();
    vi.spyOn(SubmissionCtx, "useSubmissionContext").mockReturnValue({
      status: SubmissionCtxStatus.POLLING,
      data: {
        getSubmission: {
          _id: "refetching-submission-test",
          ...baseSubmission,
        },
        submissionStats: {
          stats: [],
        },
        getSubmissionAttributes: {
          submissionAttributes: {
            isBatchUploading: true,
            hasOrphanError: false,
          },
        },
      },
      error: null,
      refetch: mockRefetch,
    });

    const mocks: MockedResponse<ListBatchesResp>[] = [
      {
        request: {
          query: LIST_BATCHES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            listBatches: {
              total: 0,
              batches: [],
            },
          },
        },
      },
    ];

    render(<DataActivity ref={null} />, {
      wrapper: ({ children }) => <TestParent mocks={mocks}>{children}</TestParent>,
    });

    await waitFor(() => {
      expect(mockRefetch).not.toHaveBeenCalled();
    });
  });

  it("should have a default pagination count of 20 rows per page", async () => {
    vi.spyOn(SubmissionCtx, "useSubmissionContext").mockReturnValue({
      status: SubmissionCtxStatus.LOADED,
      data: {
        getSubmission: {
          _id: "",
          ...baseSubmission,
        },
        submissionStats: {
          stats: [],
        },
        getSubmissionAttributes: {
          submissionAttributes: {
            isBatchUploading: false,
            hasOrphanError: false,
          },
        },
      },
      error: null,
    });

    const mocks: MockedResponse<ListBatchesResp>[] = [
      {
        request: {
          query: LIST_BATCHES,
        },
        variableMatcher: () => true,
        result: {
          data: {
            listBatches: {
              total: 0,
              batches: [],
            },
          },
        },
      },
    ];

    const { getByTestId } = render(<DataActivity ref={null} />, {
      wrapper: ({ children }) => <TestParent mocks={mocks}>{children}</TestParent>,
    });

    await waitFor(() => {
      expect(getByTestId("generic-table-rows-per-page-bottom")).toHaveValue("20");
    });
  });
});
