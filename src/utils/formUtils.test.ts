import { InitialQuestionnaire } from "../config/InitialValues";
import programOptions, { NotApplicableProgram, OptionalProgram } from "../config/ProgramConfig";
import * as utils from "./formUtils";

describe("questionnaire filterNonNumeric cases", () => {
  it("should filter non-numerics", () => {
    expect(utils.filterNonNumeric("123abc")).toEqual("123");
  });

  it("should preserve original strings", () => {
    expect(utils.filterNonNumeric("")).toEqual("");
  });

  it("should return empty strings if there is no numerics", () => {
    expect(utils.filterNonNumeric("abc")).toEqual("");
  });
});

describe("questionnaire validateDomain cases", () => {
  it("should prevent domain-only emails", () => {
    expect(utils.validateEmail("abc.com")).toEqual(false);
  });

  it("should prevent domains without TLDs emails", () => {
    expect(utils.validateEmail("test-email@example")).toEqual(false);
  });

  it("should allow valid NIH emails", () => {
    expect(utils.validateEmail("abc@nih.gov")).toEqual(true);
  });

  it("should allow dashes", () => {
    expect(utils.validateEmail("test-email@example.com")).toEqual(true);
  });

  it("should allow periods", () => {
    expect(utils.validateEmail("abc.123@example.com")).toEqual(true);
  });
});

describe("questionnaire mapObjectWithKey cases", () => {
  const object = [
    { name: "test1" },
    { name: "test2" },
    { name: "test3" }
  ];

  it("should not modify the original object", () => {
    expect(object.map(utils.mapObjectWithKey)).not.toBe(object);
  });

  it("should add a key to each object", () => {
    const newObject = object.map(utils.mapObjectWithKey);

    newObject.forEach((obj) => {
      expect(obj).toHaveProperty("key");
      expect(obj.key).not.toEqual("");
    });
  });
});

describe("questionnaire findProgram cases", () => {
  // This test assumes that there is no program named "test ABC 123 this should never exist" in programOptions
  it("should default to the optional program when a non-existent program name is provided", () => {
    const programInput = { name: "test ABC 123 this should never exist" };
    const program = utils.findProgram(programInput);

    expect(program).toEqual(OptionalProgram);
  });

  // This test assumes the provided program does not have a name, abbreviation, or description
  it("should default to the optional program when the program contains name, abbreviation, and description that does not exist in programOptions", () => {
    const programInput = { name: "this is a custom name" };
    const program = utils.findProgram(programInput);

    expect(program).toEqual(OptionalProgram);
  });

  // This test checks the NotApplicableProgram scenario based on the findProgram function's behavior
  it("should return NotApplicableProgram when program is marked as notApplicable", () => {
    const programInput = { notApplicable: true, name: "DummyName" };
    const program = utils.findProgram(programInput);

    expect(program).toEqual(NotApplicableProgram);
  });

  it("should return NotApplicableProgram when program name matches NotApplicableProgram name", () => {
    const programInput = { name: NotApplicableProgram.name };
    const program = utils.findProgram(programInput);

    expect(program).toEqual(NotApplicableProgram);
  });

  it("should return the correct program option when an existing program name is provided", () => {
    const existingProgram = programOptions[0];
    const programInput = { name: existingProgram.name };
    const program = utils.findProgram(programInput);

    expect(program).toEqual(existingProgram);
  });

  it("should return program with initial values if no program is provided", () => {
    const program = utils.findProgram(null);

    expect(program).toEqual(InitialQuestionnaire.program);
  });
});

describe("questionnaire programToSelectOption cases", () => {
  it("should correctly format a program with abbreviation", () => {
    const program = {
      name: "Test Program",
      abbreviation: "TP"
    };

    const selectOption = utils.programToSelectOption(program);

    expect(selectOption.label).toEqual("Test Program (TP)");
    expect(selectOption.value).toEqual("Test Program");
  });

  it("should correctly format a program without abbreviation", () => {
    const program = {
      name: "Test Program",
    };

    const selectOption = utils.programToSelectOption(program);

    expect(selectOption.label).toEqual("Test Program");
    expect(selectOption.value).toEqual("Test Program");
  });

  it("should correctly format a program with empty name", () => {
    const program = { name: "" };

    const selectOption = utils.programToSelectOption(program);

    expect(selectOption.label).toEqual("");
    expect(selectOption.value).toEqual("");
  });
});
