import { axe } from "vitest-axe";
import { render, waitFor } from "../../test-utils";
import ValidationStatistics from "./ValidationStatistics";
import * as SubmissionCtx from "../Contexts/SubmissionContext";
import { SubmissionCtxStatus } from "../Contexts/SubmissionContext";

const baseSubmission: Omit<Submission, "_id"> = {
  status: "New",
  name: "",
  submitterID: "",
  submitterName: "",
  organization: undefined,
  dataCommons: "",
  dataCommonsDisplayName: "",
  modelVersion: "",
  studyAbbreviation: "",
  studyName: "",
  dbGaPID: "",
  bucketName: "",
  rootPath: "",
  metadataValidationStatus: "New",
  fileValidationStatus: "New",
  fileErrors: [],
  history: [],
  conciergeName: "",
  conciergeEmail: "",
  intention: "New/Update",
  dataType: "Metadata and Data Files",
  createdAt: "",
  updatedAt: "",
  crossSubmissionStatus: "New",
  otherSubmissions: null,
  archived: false,
  validationStarted: "",
  validationEnded: "",
  validationScope: "New",
  validationType: ["metadata", "file"],
  studyID: "",
  deletingData: false,
  nodeCount: 0,
  collaborators: [],
  dataFileSize: null,
};

describe("Accessibility", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should not have accessibility violations", async () => {
    vi.spyOn(SubmissionCtx, "useSubmissionContext").mockReturnValue({
      status: SubmissionCtxStatus.LOADED,
      data: {
        getSubmission: {
          ...baseSubmission,
          _id: "id-accessibility-base-case",
        },
        submissionStats: {
          stats: [
            { nodeName: "node1", total: 5, new: 1, passed: 2, error: 3, warning: 4 },
            { nodeName: "node2", total: 10, new: 3, passed: 3, warning: 3, error: 1 },
            { nodeName: "node3", total: 33, new: 0, passed: 11, warning: 11, error: 11 },
          ],
        },
        getSubmissionAttributes: {
          submissionAttributes: {
            hasOrphanError: false,
            isBatchUploading: false,
          },
        },
      },
      error: null,
    });

    const { container, getByTestId } = render(<ValidationStatistics />);
    expect(await axe(container)).toHaveNoViolations();
    expect(getByTestId("statistics-charts-container")).toBeVisible();
  });

  it("should not have accessibility violations (loading)", async () => {
    vi.spyOn(SubmissionCtx, "useSubmissionContext").mockReturnValue({
      status: SubmissionCtxStatus.LOADING,
      data: null,
      error: null,
      startPolling: vi.fn(),
      stopPolling: vi.fn(),
    });

    const { container, getByTestId } = render(<ValidationStatistics />);
    expect(await axe(container)).toHaveNoViolations();

    await waitFor(() => {
      expect(getByTestId("statistics-loader-container")).toBeVisible();
    });
  });

  it("should not have accessibility violations (no data)", async () => {
    vi.spyOn(SubmissionCtx, "useSubmissionContext").mockReturnValue({
      status: SubmissionCtxStatus.LOADED,
      data: {
        getSubmission: {
          ...baseSubmission,
          _id: "id-accessibility-no-data",
        },
        submissionStats: { stats: [] },
        getSubmissionAttributes: {
          submissionAttributes: {
            hasOrphanError: false,
            isBatchUploading: false,
          },
        },
      },
      error: null,
    });

    const { container, getByTestId } = render(<ValidationStatistics />);
    expect(await axe(container)).toHaveNoViolations();
    expect(getByTestId("statistics-empty-container")).toBeVisible();
  });
});
