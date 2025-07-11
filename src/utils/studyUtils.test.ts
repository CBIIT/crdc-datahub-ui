import { approvedStudyFactory } from "@/factories/approved-study/ApprovedStudyFactory";
import { organizationFactory } from "@/factories/auth/OrganizationFactory";

import * as utils from "./studyUtils";

describe("formatAccessTypes", () => {
  it('should return "Controlled, Open" when both controlledAccess and openAccess are true', () => {
    const result = utils.formatAccessTypes(true, true);
    expect(result).toBe("Controlled, Open");
  });

  it('should return "Controlled" when only controlledAccess is true', () => {
    const result = utils.formatAccessTypes(true, false);
    expect(result).toBe("Controlled");
  });

  it('should return "Open" when only openAccess is true', () => {
    const result = utils.formatAccessTypes(false, true);
    expect(result).toBe("Open");
  });

  it("should return an empty string when both controlledAccess and openAccess are false", () => {
    const result = utils.formatAccessTypes(false, false);
    expect(result).toBe("");
  });

  it("should handle controlledAccess as true and openAccess as undefined", () => {
    const result = utils.formatAccessTypes(true, undefined);
    expect(result).toBe("Controlled");
  });

  it("should handle openAccess as true and controlledAccess as undefined", () => {
    const result = utils.formatAccessTypes(undefined, true);
    expect(result).toBe("Open");
  });

  it("should handle both controlledAccess and openAccess as undefined", () => {
    const result = utils.formatAccessTypes(undefined, undefined);
    expect(result).toBe("");
  });

  it("should ignore non-boolean truthy values for controlledAccess and openAccess", () => {
    // @ts-expect-error Testing with non-boolean input
    const result = utils.formatAccessTypes(1, "true");
    expect(result).toBe("");
  });

  it("should handle non-boolean falsy values for controlledAccess and openAccess", () => {
    // @ts-expect-error Testing with non-boolean input
    const result = utils.formatAccessTypes(0, "");
    expect(result).toBe("");
  });
});

describe("hasStudyWithMultiplePrograms", () => {
  it("returns false when studies array is empty", () => {
    expect(utils.hasStudyWithMultiplePrograms([], "prog1")).toBe(false);
  });

  it("returns false when newProgramId is an empty string", () => {
    const studies = [
      approvedStudyFactory.build({
        programs: [organizationFactory.build({ _id: "a", name: "Test" })],
      }),
    ];
    expect(utils.hasStudyWithMultiplePrograms(studies, "")).toBe(false);
  });

  it("ignores 'NA' program and returns false when adding a new program results in a single entry", () => {
    const studies = [
      approvedStudyFactory.build({
        programs: [organizationFactory.build({ _id: "na1", name: "NA" })],
      }),
    ];
    expect(utils.hasStudyWithMultiplePrograms(studies, "prog1")).toBe(false);
  });

  it("ignores 'NA' program and returns true when study is assigned to multiple programs", () => {
    const studies = [
      approvedStudyFactory.build({
        programs: [
          organizationFactory.build({ _id: "na1", name: "NA" }),
          organizationFactory.build({ _id: "prog1", name: "Alpha" }),
        ],
      }),
    ];
    expect(utils.hasStudyWithMultiplePrograms(studies, "prog2")).toBe(true);
  });

  it("returns false when the only existing program matches the newProgramId and is the only program", () => {
    const studies = [
      approvedStudyFactory.build({
        programs: [organizationFactory.build({ _id: "prog1", name: "Alpha" })],
      }),
    ];
    expect(utils.hasStudyWithMultiplePrograms(studies, "prog1")).toBe(false);
  });

  it("returns true when a study has one other program and the newProgramId is different", () => {
    const studies = [
      approvedStudyFactory.build({
        programs: [organizationFactory.build({ _id: "prog2", name: "Beta" })],
      }),
    ];
    expect(utils.hasStudyWithMultiplePrograms(studies, "prog1")).toBe(true);
  });

  it("returns false when study has null programs", () => {
    const studies = [approvedStudyFactory.build({ programs: null })];
    expect(utils.hasStudyWithMultiplePrograms(studies, "prog1")).toBe(false);
  });

  it("returns true when a study has multiple programs even before adding the new one", () => {
    const studies = [
      approvedStudyFactory.build({
        programs: [
          organizationFactory.build({ _id: "prog2", name: "Beta" }),
          organizationFactory.build({ _id: "prog3", name: "Gamma" }),
        ],
      }),
    ];
    expect(utils.hasStudyWithMultiplePrograms(studies, "prog1")).toBe(true);
  });

  it("returns true if at least one study in the list would become multi-program", () => {
    const studies = [
      approvedStudyFactory.build({
        programs: [organizationFactory.build({ _id: "na1", name: "NA" })],
      }), // stays single
      approvedStudyFactory.build({
        programs: [organizationFactory.build({ _id: "X", name: "X" })],
      }), // becomes multi
      approvedStudyFactory.build({
        programs: [
          organizationFactory.build({ _id: "Y", name: "Y" }),
          organizationFactory.build({ _id: "na2", name: "NA" }),
        ],
      }), // also multi
    ];
    expect(utils.hasStudyWithMultiplePrograms(studies, "prog1")).toBe(true);
  });

  it("returns false when none of the studies would become multi-program", () => {
    const studies = [
      approvedStudyFactory.build({
        programs: [organizationFactory.build({ _id: "na1", name: "NA" })],
      }),
      approvedStudyFactory.build({
        programs: [organizationFactory.build({ _id: "prog1", name: "Existing" })],
      }),
    ];
    expect(utils.hasStudyWithMultiplePrograms(studies, "prog1")).toBe(false);
  });
});
