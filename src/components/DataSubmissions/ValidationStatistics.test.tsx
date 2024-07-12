import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import ValidationStatistics from "./ValidationStatistics";

const baseSubmission: Omit<Submission, "_id"> = {
  status: "New",
  name: "",
  submitterID: "",
  submitterName: "",
  organization: undefined,
  dataCommons: "",
  modelVersion: "",
  studyAbbreviation: "",
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
  validationStarted: "",
  validationEnded: "",
  validationScope: "New",
  validationType: ["metadata", "file"],
  studyID: "",
  deletingData: false,
};

describe("Accessibility", () => {
  it("should not have accessibility violations", async () => {
    const { container, getByTestId } = render(
      <ValidationStatistics
        dataSubmission={{
          ...baseSubmission,
          _id: "id-accessibility-base-case",
        }}
        statistics={[
          { nodeName: "node1", total: 5, new: 1, passed: 2, error: 3, warning: 4 },
          { nodeName: "node2", total: 10, new: 3, passed: 3, warning: 3, error: 1 },
          { nodeName: "node3", total: 33, new: 0, passed: 11, warning: 11, error: 11 },
        ]}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
    expect(getByTestId("statistics-charts-container")).toBeVisible();
  });

  it("should not have accessibility violations (loading)", async () => {
    const { container, getByTestId } = render(
      <ValidationStatistics dataSubmission={undefined} statistics={undefined} />
    );

    expect(await axe(container)).toHaveNoViolations();
    expect(getByTestId("statistics-loader-container")).toBeVisible();
  });

  it("should not have accessibility violations (no data)", async () => {
    const { container, getByTestId } = render(
      <ValidationStatistics
        dataSubmission={{
          ...baseSubmission,
          _id: "id-accessibility-no-data",
        }}
        statistics={[]}
      />
    );

    expect(await axe(container)).toHaveNoViolations();
    expect(getByTestId("statistics-empty-container")).toBeVisible();
  });
});
