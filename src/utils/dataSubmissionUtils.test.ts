import * as utils from './dataSubmissionUtils';
import { SubmitInfo } from './dataSubmissionUtils';

describe('General Submit', () => {
  it('should disable submit without isAdminOverride when user role is not Admin but there are validation errors', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Error', 'Error', 'Submitter');
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when metadata passed but files has validation errors', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Passed', 'Error', 'Submitter');
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when files passed but metadata has validation errors', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Error', 'Passed', 'Submitter');
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when metadata validation is "Warning" and file validation is "Error"', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Warning', 'Error', 'Submitter');
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when metadata validation is "Error" and file validation is "Warning"', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Error', 'Warning', 'Submitter');
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should not disable submit when user role is not Admin and there are no validation errors', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Passed', 'Passed', 'Submitter');
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when user role is undefined', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Passed', 'Passed', undefined);
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when metadata validation is null', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit(null, 'Passed', 'Submitter');
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when file validation is null', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Passed', null, 'Submitter');
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when both metadata validation and file validation are null', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit(null, null, 'Submitter');
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when both validations are in "Validating" state', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Validating', 'Validating', 'Submitter');
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when metadata validation is in "Validating" state', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Validating', 'Passed', 'Submitter');
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when file validation is in "Validating" state', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Passed', 'Validating', 'Submitter');
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when both validations are in "New" state', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('New', 'New', 'Submitter');
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when metadata validation is in "New" state', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('New', 'Passed', 'Submitter');
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should disable submit when file validation is in "New" state', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Passed', 'New', 'Submitter');
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should allow submit when there are validation warnings', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Warning', 'Warning', 'Submitter');
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should allow submit when both validations are in "Passed" state', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Passed', 'Passed', 'Submitter');
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should allow submit when both validations are in "Warning" state', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Warning', 'Warning', 'Submitter');
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(false);
  });
});

describe('Admin Submit', () => {
  it('should allow submit with isAdminOverride when there are validation errors', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Error', 'Error', 'Admin');
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(true);
  });

  it('should allow submit without isAdminOverride when there are no validation errors', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Passed', 'Passed', 'Admin');
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should allow submit with isAdminOverride but null data files', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Passed', null, 'Admin');
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(true);
  });

  it('should allow submit with isAdminOverride but null metadata', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit(null, 'Passed', 'Admin');
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(true);
  });

  it('should disable submit without isAdminOverride when null metadata and null data files', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit(null, null, 'Admin');
    expect(result.disable).toBe(true);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should allow submit without isAdminOverride when both validations are in "Warning" state', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Warning', 'Warning', 'Admin');
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(false);
  });

  it('should allow submit with isAdminOverride when metadata validation is "Warning" and file validation is "Error"', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Warning', 'Error', 'Admin');
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(true);
  });
  it('should allow submit with isAdminOverride when metadata validation is "Error" and file validation is "Warning"', () => {
    const result: SubmitInfo = utils.shouldDisableSubmit('Error', 'Warning', 'Admin');
    expect(result.disable).toBe(false);
    expect(result.isAdminOverride).toBe(true);
  });
});

describe('unpackQCResultSeverities cases', () => {
  // Base QCResult, unused props are empty
  const baseResult: Omit<QCResult, "errors" | "warnings"> = {
    submissionID: "",
    batchID: "",
    type: '',
    validationType: '' as QCResult["validationType"],
    // NOTE: This is intentionally incorrect and should break the tests if used
    severity: "SHOULD NOT BE USED" as QCResult["severity"],
    displayID: 0,
    submittedID: '',
    uploadedDate: '',
    validatedDate: ''
  };

  // Base ErrorMessage
  const baseError: ErrorMessage = {
    title: "",
    description: "unused description",
  };

  it('should unpack errors and warnings into separate results', () => {
    const errors: ErrorMessage[] = [
      { ...baseError, title: "error1" },
      { ...baseError, title: "error2" },
    ];
    const warnings: ErrorMessage[] = [
      { ...baseError, title: "warning1" },
      { ...baseError, title: "warning2" },
    ];
    const results: QCResult[] = [{ ...baseResult, errors, warnings }];

    const unpackedResults = utils.unpackQCResultSeverities(results);

    expect(unpackedResults.length).toEqual(4);
    expect(unpackedResults).toEqual([
      { ...baseResult, severity: "Error", errors: [errors[0]], warnings: [] },
      { ...baseResult, severity: "Error", errors: [errors[1]], warnings: [] },
      { ...baseResult, severity: "Warning", errors: [], warnings: [warnings[0]] },
      { ...baseResult, severity: "Warning", errors: [], warnings: [warnings[1]] },
    ]);
  });

  it('should return an array with the same length as errors.length + warnings.length', () => {
    const errors: ErrorMessage[] = new Array(999).fill({ ...baseError, title: "error1" });
    const warnings: ErrorMessage[] = new Array(999).fill({ ...baseError, title: "warning1" });
    const results: QCResult[] = [{ ...baseResult, errors, warnings }];

    expect(utils.unpackQCResultSeverities(results).length).toEqual(1998);
  });

  it('should unpack an array of only warnings', () => {
    const warnings: ErrorMessage[] = [
      { ...baseError, title: "warning1" },
      { ...baseError, title: "warning2" },
    ];
    const results: QCResult[] = [{ ...baseResult, errors: [], warnings }];

    const unpackedResults = utils.unpackQCResultSeverities(results);

    expect(unpackedResults.length).toEqual(2);
    expect(unpackedResults).toEqual([
      { ...baseResult, severity: "Warning", errors: [], warnings: [warnings[0]] },
      { ...baseResult, severity: "Warning", errors: [], warnings: [warnings[1]] },
    ]);
  });

  it('should unpack an array of only errors', () => {
    const errors: ErrorMessage[] = [
      { ...baseError, title: "error1" },
      { ...baseError, title: "error2" },
    ];
    const results: QCResult[] = [{ ...baseResult, errors, warnings: [] }];

    const unpackedResults = utils.unpackQCResultSeverities(results);

    expect(unpackedResults.length).toEqual(2);
    expect(unpackedResults).toEqual([
      { ...baseResult, severity: "Error", errors: [errors[0]], warnings: [] },
      { ...baseResult, severity: "Error", errors: [errors[1]], warnings: [] },
    ]);
  });

  it('should handle a large array of QCResults', () => {
    const errors: ErrorMessage[] = new Array(10).fill({ ...baseError, title: "error1" });
    const warnings: ErrorMessage[] = new Array(5).fill({ ...baseError, title: "warning1" });
    const results: QCResult[] = new Array(10000).fill({ ...baseResult, errors, warnings });

    const unpackedResults = utils.unpackQCResultSeverities(results);

    // 15 errors and 5 warnings per result, 150000 total
    expect(unpackedResults.length).toEqual(150000);
    expect(unpackedResults.filter((result) => result.severity === "Error").length).toEqual(100000);
    expect(unpackedResults.filter((result) => result.severity === "Warning").length).toEqual(50000);
  });

  it('should return an empty array when given an empty array', () => {
    expect(utils.unpackQCResultSeverities([])).toEqual([]);
  });

  it('returns an empty array when there are no errors or warnings', () => {
    const results = [{ ...baseResult, errors: [], warnings: [] }];
    expect(utils.unpackQCResultSeverities(results)).toEqual([]);
  });
});
