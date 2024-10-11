import { InitialQuestionnaire } from "../config/InitialValues";
import programOptions, { NotApplicableProgram, OptionalProgram } from "../config/ProgramConfig";
import * as utils from "./formUtils";

describe("filterNonNumeric cases", () => {
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

describe("filterForNumbers cases", () => {
  it("should return empty string when given an empty string", () => {
    expect(utils.filterForNumbers("")).toBe("");
  });

  it("should return only numbers when given a string with numbers and other characters", () => {
    expect(utils.filterForNumbers("abc123def456")).toBe("123456");
  });

  it("should return only numbers and dashes when given a string with numbers, dashes, and other characters", () => {
    expect(utils.filterForNumbers("abc123-def456")).toBe("123-456");
  });

  it("should return the original string when given a string with numbers and spaces", () => {
    expect(utils.filterForNumbers("123 456")).toBe("123 456");
  });

  it("should filter special characters", () => {
    expect(utils.filterForNumbers("123!@#$%^&*()_+")).toEqual("123");
  });

  it("should filter newlines", () => {
    // NOTE: This tests against the usage of \s in the regex
    expect(utils.filterForNumbers("123\n")).toEqual("123");
  });

  it("should filter tabs", () => {
    // NOTE: This tests against the usage of \s in the regex
    expect(utils.filterForNumbers("123\t")).toEqual("123");
  });
});

describe("validateEmail cases", () => {
  it("should prevent domain-only emails", () => {
    expect(utils.validateEmail("abc.com")).toEqual(false);
  });

  it("should prevent domains without TLDs emails", () => {
    expect(utils.validateEmail("test-email@example")).toEqual(false);
  });

  it("should return false for invalid email", () => {
    expect(utils.validateEmail("testexample.com")).toBe(false);
  });

  it("should return false for email with spaces", () => {
    expect(utils.validateEmail("test example@example.com")).toBe(false);
  });

  it("should return false for email with special characters", () => {
    expect(utils.validateEmail("test!example@example.com")).toBe(false);
  });

  it("should return false for email with multiple @ symbols", () => {
    expect(utils.validateEmail("test@example@com")).toBe(false);
  });

  it("should allow periods", () => {
    expect(utils.validateEmail("abc.123@example.com")).toEqual(true);
  });

  it("should return true for valid email", () => {
    expect(utils.validateEmail("test@example.com")).toBe(true);
  });

  it("should allow valid NIH emails", () => {
    expect(utils.validateEmail("abc@nih.gov")).toEqual(true);
  });

  it("should allow dashes", () => {
    expect(utils.validateEmail("test-email@example.com")).toEqual(true);
  });
});

describe("mapObjectWithKey cases", () => {
  const object = [{ name: "test1" }, { name: "test2" }, { name: "test3" }];

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

describe("findProgram cases", () => {
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

describe("programToSelectOption cases", () => {
  it("should correctly format a program with abbreviation", () => {
    const program = {
      name: "Test Program",
      abbreviation: "TP",
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

describe("formatFullStudyName cases", () => {
  it("should return the study name with abbreviation if abbreviation is provided", () => {
    const studyName = "Study Name";
    const studyAbbreviation = "SN";
    const result = utils.formatFullStudyName(studyName, studyAbbreviation);
    expect(result).toBe("Study Name (SN)");
  });

  it("should return the study name without abbreviation if abbreviation is not provided", () => {
    const studyName = "Study Name";
    const result = utils.formatFullStudyName(studyName, "");
    expect(result).toBe("Study Name");
  });

  it("should return the study name without abbreviation if abbreviation is undefined", () => {
    const studyName = "Study Name";
    const result = utils.formatFullStudyName(studyName, undefined);
    expect(result).toBe("Study Name");
  });

  it("should ignore casing when comparing the study name and abbreviation", () => {
    const equalValuesWithDifferentCasing = utils.formatFullStudyName("study name", "STUDY NAME");
    expect(equalValuesWithDifferentCasing).toBe("study name");

    const equalValuesWithDifferentCasing2 = utils.formatFullStudyName("STUDY NAME", "study name");
    expect(equalValuesWithDifferentCasing2).toBe("STUDY NAME");
  });

  it("should remove extra spaces from the study name", () => {
    const studyName = "   Study Name   ";
    const result = utils.formatFullStudyName(studyName, "");
    expect(result).toBe("Study Name");
  });

  it("should remove extra spaces from the study abbreviation", () => {
    const studyName = "Study Name";
    const studyAbbreviation = "   SN   ";
    const result = utils.formatFullStudyName(studyName, studyAbbreviation);
    expect(result).toBe("Study Name (SN)");
  });

  it("should ignore the abbreviation if its equal to the study name", () => {
    const studyName = "Study Name";
    const studyAbbreviation = "Study Name";
    const result = utils.formatFullStudyName(studyName, studyAbbreviation);
    expect(result).toBe("Study Name");
  });

  it("should return an empty string if the study name is not a string", () => {
    const studyName = 12345 as unknown as string;
    const result = utils.formatFullStudyName(studyName, "");
    expect(result).toBe("");
  });
});

describe("mapOrganizationStudyToId cases", () => {
  it("should return the id of the matching study", () => {
    const studies = [
      { _id: "1", studyName: "Study 1", studyAbbreviation: "S1" },
      { _id: "2", studyName: "Study 2", studyAbbreviation: "S2" },
    ] as ApprovedStudy[];

    const study = { studyName: "Study 1", studyAbbreviation: "S1" };
    const result = utils.mapOrganizationStudyToId(study, studies);

    expect(result).toBe("1");
  });

  it("should return the first matching study's id", () => {
    const studies = [
      { _id: "1", studyName: "MATCH", studyAbbreviation: "MA" },
      { _id: "2", studyName: "Study 2", studyAbbreviation: "S2" },
      { _id: "3", studyName: "MATCH", studyAbbreviation: "MA" },
    ] as ApprovedStudy[];

    const study = { studyName: "MATCH", studyAbbreviation: "MA" };
    const result = utils.mapOrganizationStudyToId(study, studies);

    expect(result).toBe("1");
  });

  it("should short-circuit if the study already has an id", () => {
    const studies = [
      { _id: "1", studyName: "Study 1", studyAbbreviation: "S1" },
      { _id: "2", studyName: "Study 2", studyAbbreviation: "S2" },
    ] as ApprovedStudy[];

    const study = { _id: "id already exists", studyName: "Study 3", studyAbbreviation: "S3" };
    const result = utils.mapOrganizationStudyToId(study, studies);

    expect(result).toBe("id already exists");
  });

  it.each([null, undefined, 1])(
    "should return an empty string if no valid _id is provided and none match",
    (value) => {
      const studies = [
        { _id: "1", studyName: "Study 1", studyAbbreviation: "S1" },
        { _id: "2", studyName: "Study 2", studyAbbreviation: "S2" },
      ] as ApprovedStudy[];

      const study = { _id: value, studyName: "Study 3", studyAbbreviation: "S3" };
      const result = utils.mapOrganizationStudyToId(study, studies);

      expect(result).toBe("");
    }
  );

  it("should return an empty string if no matching study is found", () => {
    const studies = [
      { _id: "1", studyName: "Study 1", studyAbbreviation: "S1" },
      { _id: "2", studyName: "Study 2", studyAbbreviation: "S2" },
    ] as ApprovedStudy[];

    const study = { studyName: "Study 3", studyAbbreviation: "S3" };
    const result = utils.mapOrganizationStudyToId(study, studies);

    expect(result).toBe("");
  });

  it("should not throw an exception if the study is undefined", () => {
    const studies = [
      { _id: "1", studyName: "Study 1", studyAbbreviation: "S1" },
      { _id: "2", studyName: "Study 2", studyAbbreviation: "S2" },
    ] as ApprovedStudy[];

    expect(() => utils.mapOrganizationStudyToId(undefined, studies)).not.toThrow();
  });

  it("should not throw an exception if the study is null", () => {
    const studies = [
      { _id: "1", studyName: "Study 1", studyAbbreviation: "S1" },
      { _id: "2", studyName: "Study 2", studyAbbreviation: "S2" },
    ] as ApprovedStudy[];

    expect(() => utils.mapOrganizationStudyToId(null, studies)).not.toThrow();
  });

  it("should not throw an exception if the approved studies are corrupt", () => {
    const studies = [
      null,
      { invalidObject: "true" },
      { AAAA: undefined },
    ] as unknown as ApprovedStudy[];

    const study = { studyName: "Study 1", studyAbbreviation: "S1" };

    expect(() => utils.mapOrganizationStudyToId(study, studies)).not.toThrow();
  });

  it("should not throw an exception if the approved studies are undefined", () => {
    const study = { studyName: "Study 1", studyAbbreviation: "S1" };

    expect(() => utils.mapOrganizationStudyToId(study, undefined)).not.toThrow();
  });
});

describe("isValidORCID cases", () => {
  it("should return true for a valid ORCID", () => {
    expect(utils.isValidORCID("0000-0002-1825-0097")).toBe(true);
  });

  it("should return true for a valid ORCID with 'X' as the last character", () => {
    expect(utils.isValidORCID("0000-0002-1825-009X")).toBe(true);
  });

  it("should return false for an ORCID with less than 19 characters", () => {
    expect(utils.isValidORCID("0000-0002-1825-009")).toBe(false);
  });

  it("should return false for an ORCID with more than 19 characters", () => {
    expect(utils.isValidORCID("0000-0002-1825-0097X")).toBe(false);
  });

  it("should return false for an ORCID with invalid characters", () => {
    expect(utils.isValidORCID("0000-0002-1825-00!7")).toBe(false);
  });

  it("should return false for an ORCID with 'X' not as the last character", () => {
    expect(utils.isValidORCID("0000-0002-182X-0097")).toBe(false);
  });

  it("should return false for an ORCID with incorrect hyphen placement", () => {
    expect(utils.isValidORCID("0000-0002-182500-97")).toBe(false);
  });

  it("should return false if the input is not a string", () => {
    expect(utils.isValidORCID(123456789012e34 as unknown as string)).toBe(false);
  });

  it("should return false for an empty string", () => {
    expect(utils.isValidORCID("")).toBe(false);
  });

  it("should return false for a string with spaces", () => {
    expect(utils.isValidORCID("0000 0002 1825 0097")).toBe(false);
  });

  it("should return false for a string with special characters", () => {
    expect(utils.isValidORCID("0000-0002-1825-009@")).toBe(false);
  });

  it("should return false for a string with mixed case 'x' in the middle", () => {
    expect(utils.isValidORCID("0000-000X-1825-0097")).toBe(false);
  });
  it("should return false for a null or undefined value", () => {
    expect(utils.isValidORCID(null as unknown as string)).toBe(false);
    expect(utils.isValidORCID(undefined as unknown as string)).toBe(false);
  });
});

describe("formatORCIDInput cases", () => {
  it("should format a valid ORCID without hyphens", () => {
    expect(utils.formatORCIDInput("0000000218250097")).toBe("0000-0002-1825-0097");
  });

  it("should format a valid ORCID with hyphens", () => {
    expect(utils.formatORCIDInput("0000-0002-1825-0097")).toBe("0000-0002-1825-0097");
  });

  it("should convert lowercase 'x' to uppercase 'X'", () => {
    expect(utils.formatORCIDInput("000000021825009x")).toBe("0000-0002-1825-009X");
  });

  it("should remove invalid characters and format the input", () => {
    expect(utils.formatORCIDInput("0000-0002-1825-00!7")).toBe("0000-0002-1825-007");
  });

  it("should limit input to 16 valid characters and format correctly", () => {
    expect(utils.formatORCIDInput("00000002182500971234")).toBe("0000-0002-1825-0097");
  });

  it("should return an empty string for an empty input", () => {
    expect(utils.formatORCIDInput("")).toBe("");
  });

  it("should handle input with no valid characters", () => {
    expect(utils.formatORCIDInput("!!!")).toBe("");
  });

  it("should correctly format input with spaces", () => {
    expect(utils.formatORCIDInput("0000 0002 1825 0097")).toBe("0000-0002-1825-0097");
  });

  it("should correctly format input with mixed case 'x' in the middle", () => {
    expect(utils.formatORCIDInput("0000-000X-1825-0097")).toBe("0000-000X-1825-0097");
  });

  it("should handle a string that starts with invalid characters", () => {
    expect(utils.formatORCIDInput("!!0000000218250097")).toBe("0000-0002-1825-0097");
  });

  it("should handle a string that ends with invalid characters", () => {
    expect(utils.formatORCIDInput("0000000218250097!!")).toBe("0000-0002-1825-0097");
  });

  it("should return an empty string when the input is null or undefined", () => {
    expect(utils.formatORCIDInput(null)).toBe("");
    expect(utils.formatORCIDInput(undefined)).toBe("");
  });
});

describe("renderStudySelectionValue cases", () => {
  const baseStudy: ApprovedStudy = {
    _id: "",
    studyName: "",
    studyAbbreviation: "",
    dbGaPID: "",
    controlledAccess: false,
    originalOrg: "",
    openAccess: false,
    PI: "",
    ORCID: "",
    createdAt: "",
  };

  it("should return the fallback value if studyIds is not an array", () => {
    const result = utils.formatStudySelectionValue(null, [baseStudy], "fallback");
    expect(result).toBe("fallback");
  });

  it("should return the fallback value if approvedStudies is not an array", () => {
    const result = utils.formatStudySelectionValue(["1"], null, "fallback");
    expect(result).toBe("fallback");
  });

  it("should return the fallback value if studyIds is empty", () => {
    const result = utils.formatStudySelectionValue([], [baseStudy], "fallback");
    expect(result).toBe("fallback");
  });

  it("should return the fallback value if approvedStudies is empty", () => {
    const result = utils.formatStudySelectionValue(["1"], [], "fallback");
    expect(result).toBe("fallback");
  });

  it("should return the fallback value if no matching study is found", () => {
    const studies = [
      { _id: "1", studyName: "Study 1", studyAbbreviation: "S1" },
      { _id: "2", studyName: "Study 2", studyAbbreviation: "S2" },
    ] as ApprovedStudy[];

    const result = utils.formatStudySelectionValue(["3"], studies, "fallback");
    expect(result).toBe("fallback");
  });

  it("should sort the approved studies by name and return the first element", () => {
    const studies = [
      { _id: "3", studyName: "Study C", studyAbbreviation: "SA" }, // actual 3
      { _id: "2", studyName: "Study A", studyAbbreviation: "SA" }, // actual 1
      { _id: "1", studyName: "Study B", studyAbbreviation: "SB" }, // actual 2
    ] as ApprovedStudy[];

    const result = utils.formatStudySelectionValue(["3", "2"], studies, "fallback");
    expect(result).toBe("Study A (SA)");
  });

  it("should filter out studies with formatted names", () => {
    const studies = [
      { _id: "1", studyName: "", studyAbbreviation: "" },
      { _id: "2", studyName: "Study 2", studyAbbreviation: "S2" },
      { _id: "3", studyName: "Study 3", studyAbbreviation: "S3" },
    ] as ApprovedStudy[];

    const result = utils.formatStudySelectionValue(["1", "2", "3"], studies, "fallback");
    expect(result).toBe("Study 2 (S2)");
  });

  it("should use the default fallback value if none is provided", () => {
    const result = utils.formatStudySelectionValue([], []);
    expect(result).toBe("");
  });
});

describe("validateEmoji cases", () => {
  it("should return null for a string without emojis", () => {
    expect(utils.validateEmoji("This is a test string")).toBe(null);
  });

  it("should return null for a string containing numbers", () => {
    expect(utils.validateEmoji("Test123 string with numbers 456 789 101112")).toBe(null);
  });

  it("should return an error message for a string with emojis and other characters", () => {
    expect(utils.validateEmoji("This is a test string 😊 with emojis")).toEqual(expect.any(String));
  });

  it("should return an error message for a string with only emojis", () => {
    expect(utils.validateEmoji("😊😊😊😊😊")).toEqual(expect.any(String));
  });

  // NOTE: We're testing various different types of emojis here
  it.each<string>(["😊", "👨🏿‍🎤", "🔴", "1️⃣", "🇵🇷"])(
    "should return an error message for a string with emojis",
    (value) => {
      expect(utils.validateEmoji(value)).toEqual(expect.any(String));
    }
  );
});
