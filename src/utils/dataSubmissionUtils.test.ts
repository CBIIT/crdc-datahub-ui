import * as utils from "./dataSubmissionUtils";
import { SubmitInfo } from "./dataSubmissionUtils";

const baseSubmission: Submission = {
  _id: "1234",
  name: "test123",
  submitterID: "1",
  submitterName: "User",
  organization: undefined,
  dataCommons: "",
  modelVersion: "",
  studyAbbreviation: "",
  dbGaPID: "",
  bucketName: "",
  rootPath: "",
  status: "New",
  metadataValidationStatus: null,
  fileValidationStatus: null,
  fileErrors: [],
  history: [],
  conciergeName: "",
  conciergeEmail: "",
  intention: "New",
  createdAt: "",
  updatedAt: "",
};

describe("General Submit", () => {
  it("should disable submit without isAdminOverride when user role is not Admin but there are validation errors", () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Error",
      fileValidationStatus: "Error",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(
      submission,
      "Submitter"
    );
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it("should disable submit when metadata passed but files has validation errors", () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Passed",
      fileValidationStatus: "Error",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(
      submission,
      "Submitter"
    );
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it("should disable submit when files passed but metadata has validation errors", () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Error",
      fileValidationStatus: "Passed",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(
      submission,
      "Submitter"
    );
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when metadata validation is "Warning" and file validation is "Error"', () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Warning",
      fileValidationStatus: "Error",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(
      submission,
      "Submitter"
    );
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when metadata validation is "Error" and file validation is "Warning"', () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Error",
      fileValidationStatus: "Warning",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(
      submission,
      "Submitter"
    );
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it("should not disable submit when user role is not Admin and there are no validation errors", () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Passed",
      fileValidationStatus: "Passed",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(
      submission,
      "Submitter"
    );
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(false);
  });

  it("should disable submit when user role is undefined", () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Passed",
      fileValidationStatus: "Passed",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(submission, undefined);
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it("should disable submit when metadata validation is null", () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: null,
      fileValidationStatus: "Passed",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(
      submission,
      "Submitter"
    );
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it("should disable submit when file validation is null", () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Passed",
      fileValidationStatus: null,
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(
      submission,
      "Submitter"
    );
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it("should disable submit when both metadata validation and file validation are null", () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: null,
      fileValidationStatus: null,
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(
      submission,
      "Submitter"
    );
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when both validations are in "Validating" state', () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Validating",
      fileValidationStatus: "Validating",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(
      submission,
      "Submitter"
    );
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when metadata validation is in "Validating" state', () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Validating",
      fileValidationStatus: "Passed",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(
      submission,
      "Submitter"
    );
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when file validation is in "Validating" state', () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Passed",
      fileValidationStatus: "Validating",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(
      submission,
      "Submitter"
    );
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when both validations are in "New" state', () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "New",
      fileValidationStatus: "New",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(
      submission,
      "Submitter"
    );
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when metadata validation is in "New" state', () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "New",
      fileValidationStatus: "Passed",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(
      submission,
      "Submitter"
    );
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when file validation is in "New" state', () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Passed",
      fileValidationStatus: "New",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(
      submission,
      "Submitter"
    );
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it("should allow submit when there are validation warnings", () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Warning",
      fileValidationStatus: "Warning",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(
      submission,
      "Submitter"
    );
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should allow submit when both validations are in "Passed" state', () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Passed",
      fileValidationStatus: "Passed",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(
      submission,
      "Submitter"
    );
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should allow submit when both validations are in "Warning" state', () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Warning",
      fileValidationStatus: "Warning",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(
      submission,
      "Submitter"
    );
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(false);
  });
});

describe("Admin Submit", () => {
  it("should allow submit with isAdminOverride when there are validation errors", () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Error",
      fileValidationStatus: "Error",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(submission, "Admin");
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(true);
  });

  it("should allow submit without isAdminOverride when there are no validation errors", () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Passed",
      fileValidationStatus: "Passed",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(submission, "Admin");
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(false);
  });

  it("should allow submit with isAdminOverride but null data files", () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Passed",
      fileValidationStatus: null,
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(submission, "Admin");
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(true);
  });

  it("should allow submit with isAdminOverride but null metadata", () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: null,
      fileValidationStatus: "Passed",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(submission, "Admin");
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(true);
  });

  it("should disable submit without isAdminOverride when null metadata and null data files", () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: null,
      fileValidationStatus: null,
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(submission, "Admin");
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should allow submit without isAdminOverride when both validations are in "Warning" state', () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Warning",
      fileValidationStatus: "Warning",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(submission, "Admin");
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should allow submit with isAdminOverride when metadata validation is "Warning" and file validation is "Error"', () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Warning",
      fileValidationStatus: "Error",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(submission, "Admin");
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(true);
  });
  it('should allow submit with isAdminOverride when metadata validation is "Error" and file validation is "Warning"', () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Error",
      fileValidationStatus: "Warning",
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(submission, "Admin");
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(true);
  });

  it('should not allow submit with isAdminOverride when Submission level errors exist', () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: null,
      fileValidationStatus: "Error",
      fileErrors: [
        {
          submissionID: "123",
          type: "",
          validationType: "data file",
          uploadedDate: "",
          batchID: "",
          displayID: 1,
          errors: [],
          warnings: [],
          severity: "Error",
          submittedID: "123",
          validatedDate: "",
        },
      ],
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(submission, "Admin");
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should not allow submitter to submit when Submission level errors exist', () => {
    const submission: Submission = {
      ...baseSubmission,
      metadataValidationStatus: "Passed",
      fileValidationStatus: "Passed",
      fileErrors: [
        {
          submissionID: "123",
          type: "",
          validationType: "data file",
          uploadedDate: "",
          batchID: "",
          displayID: 1,
          errors: [],
          warnings: [],
          severity: "Error",
          submittedID: "123",
          validatedDate: "",
        },
      ],
    };
    const result: SubmitInfo = utils.shouldDisableSubmit(submission, "Submitter");
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });
});
