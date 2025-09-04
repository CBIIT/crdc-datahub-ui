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
  const baseStudy = (
    programs: Pick<ApprovedStudy["programs"][number], "_id" | "name">[] = []
  ): ApprovedStudy => ({
    _id: "study1",
    programs: programs?.map((p) => ({
      ...p,
      abbreviation: "",
      description: "",
      status: "Active",
      conciergeID: "",
      conciergeName: "",
      conciergeEmail: "",
      studies: [],
      readOnly: false,
      createdAt: "",
      updateAt: "",
    })),
    originalOrg: "",
    studyName: "",
    studyAbbreviation: "",
    dbGaPID: "",
    controlledAccess: false,
    openAccess: false,
    PI: "",
    ORCID: "",
    primaryContact: {
      _id: "",
      firstName: "",
      lastName: "",
      role: "User",
      email: "",
      dataCommons: [],
      dataCommonsDisplayNames: [],
      studies: [],
      institution: undefined,
      IDP: "nih",
      userStatus: "Active",
      permissions: [],
      notifications: [],
      updateAt: "",
      createdAt: "",
    },
    useProgramPC: false,
    createdAt: "",
  });

  it("returns false when studies array is empty", () => {
    expect(utils.hasStudyWithMultiplePrograms([], "prog1")).toBe(false);
  });

  it("returns false when newProgramId is an empty string", () => {
    const studies = [baseStudy([{ _id: "a", name: "Test" }])];
    expect(utils.hasStudyWithMultiplePrograms(studies, "")).toBe(false);
  });

  it("ignores 'NA' program and returns false when adding a new program results in a single entry", () => {
    const studies = [baseStudy([{ _id: "na1", name: "NA" }])];
    expect(utils.hasStudyWithMultiplePrograms(studies, "prog1")).toBe(false);
  });

  it("ignores 'NA' program and returns true when study is assigned to multiple programs", () => {
    const studies = [
      baseStudy([
        { _id: "na1", name: "NA" },
        { _id: "prog1", name: "Alpha" },
      ]),
    ];
    expect(utils.hasStudyWithMultiplePrograms(studies, "prog2")).toBe(true);
  });

  it("returns false when the only existing program matches the newProgramId and is the only program", () => {
    const studies = [baseStudy([{ _id: "prog1", name: "Alpha" }])];
    expect(utils.hasStudyWithMultiplePrograms(studies, "prog1")).toBe(false);
  });

  it("returns true when a study has one other program and the newProgramId is different", () => {
    const studies = [baseStudy([{ _id: "prog2", name: "Beta" }])];
    expect(utils.hasStudyWithMultiplePrograms(studies, "prog1")).toBe(true);
  });

  it("returns false when study has null programs", () => {
    const studies = [baseStudy(null)];
    expect(utils.hasStudyWithMultiplePrograms(studies, "prog1")).toBe(false);
  });

  it("returns true when a study has multiple programs even before adding the new one", () => {
    const studies = [
      baseStudy([
        { _id: "prog2", name: "Beta" },
        { _id: "prog3", name: "Gamma" },
      ]),
    ];
    expect(utils.hasStudyWithMultiplePrograms(studies, "prog1")).toBe(true);
  });

  it("returns true if at least one study in the list would become multi-program", () => {
    const studies = [
      baseStudy([{ _id: "na1", name: "NA" }]), // stays single
      baseStudy([{ _id: "X", name: "X" }]), // becomes multi
      baseStudy([
        { _id: "Y", name: "Y" },
        { _id: "na2", name: "NA" },
      ]), // also multi
    ];
    expect(utils.hasStudyWithMultiplePrograms(studies, "prog1")).toBe(true);
  });

  it("returns false when none of the studies would become multi-program", () => {
    const studies = [
      baseStudy([{ _id: "na1", name: "NA" }]),
      baseStudy([{ _id: "prog1", name: "Existing" }]),
    ];
    expect(utils.hasStudyWithMultiplePrograms(studies, "prog1")).toBe(false);
  });
});
